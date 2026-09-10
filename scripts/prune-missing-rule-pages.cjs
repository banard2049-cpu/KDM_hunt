#!/usr/bin/env node
/**
 * Remove rule-page references that point at files which do not exist.
 *
 * Why these exist: scripts/import-loot.cjs declares the render job
 * `files = [<stem>-p<state>.jpg, <stem>-p<state+1>.jpg]` for every PDF-backed
 * rule page, but the actual JPEGs are produced later by an external pdftoppm
 * pass. When that pass does not cover a page, the data keeps a URL to a file
 * that was never written, and the UI renders a broken image.
 *
 * This prunes `rule.files` / `rule.hdFiles` to real files on disk and repoints
 * `rule.file` at the first survivor. A level that loses every page gets
 * `rule: null`, which the UI already handles ("模组未提供此条目的可用规则页").
 *
 * Usage:
 *   node scripts/prune-missing-rule-pages.cjs            # dry run, report only
 *   node scripts/prune-missing-rule-pages.cjs --write    # apply
 *   node scripts/prune-missing-rule-pages.cjs --check    # exit 1 if any remain (for CI)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'data', 'loot.json');

const write = process.argv.includes('--write');
const check = process.argv.includes('--check');

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const exists = p => typeof p === 'string' && fs.existsSync(path.join(root, p.replace(/^\.?\//, '')));

const changes = [];
const danglingFiles = new Set();

for (const b of data.bosses) {
  for (const l of b.levels || []) {
    const r = l.rule;
    if (!r) continue;
    const before = JSON.stringify({ file: r.file, files: r.files, hdFiles: r.hdFiles });

    for (const listKey of ['files', 'hdFiles']) {
      if (!Array.isArray(r[listKey])) continue;
      const good = r[listKey].filter(exists);
      for (const f of r[listKey]) if (!exists(f)) danglingFiles.add(f);
      if (good.length !== r[listKey].length) r[listKey] = good;
    }

    let repointed = false;
    if (r.file && !exists(r.file)) {
      danglingFiles.add(r.file);
      const survivors = [].concat(r.files || [], r.hdFiles || []).filter(exists);
      r.file = survivors[0] || null;
      repointed = true;
    }

    // A rule object with no page at all is indistinguishable from "no page
    // published"; drop it so the UI shows its explicit fallback message.
    const anyPage = (r.file && exists(r.file)) || (r.files || []).some(exists) || (r.hdFiles || []).some(exists);
    if (!anyPage) {
      l.rule = null;
      changes.push({ boss: b.name, level: l.name, note: 'rule -> null (no page exists)' });
      continue;
    }

    const after = JSON.stringify({ file: r.file, files: r.files, hdFiles: r.hdFiles });
    if (before !== after) {
      changes.push({
        boss: b.name, level: l.name,
        note: (repointed ? 'rule.file repointed; ' : '') + 'pruned ' +
          (JSON.parse(before).files || []).filter(f => !exists(f)).length + ' file(s)',
      });
    }
  }
}

console.log('dangling files found: ' + danglingFiles.size);
for (const d of [...danglingFiles].sort()) console.log('   ' + d);
console.log('\nlevels changed: ' + changes.length);
for (const c of changes) console.log(`   ${c.boss} / ${c.level}  ->  ${c.note}`);

// post-condition
const leftover = [];
for (const b of data.bosses) for (const l of b.levels || []) {
  const r = l.rule; if (!r) continue;
  if (r.file && !exists(r.file)) leftover.push(b.name + '/' + l.name + ' file=' + r.file);
  for (const f of [].concat(r.files || [], r.hdFiles || [])) if (!exists(f)) leftover.push(b.name + '/' + l.name + ' files=' + f);
}
console.log('\nremaining dangling references after prune: ' + leftover.length);
for (const x of leftover) console.log('   ' + x);

if (check) {
  process.exit(leftover.length ? 1 : 0);
}
if (write) {
  if (!leftover.length) {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    console.log('\nwritten: ' + dataPath);
  } else {
    console.error('\nrefusing to write: dangling references remain');
    process.exit(1);
  }
} else {
  console.log('\n(dry run; pass --write to apply)');
}
