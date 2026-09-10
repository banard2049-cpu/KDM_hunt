#!/usr/bin/env node
/**
 * Pack all game assets into a tarball for uploading to GitHub Release.
 *
 * This creates a single archive containing all images (~483MB) that will be
 * downloaded during CI builds instead of being stored in the Git repository.
 *
 * Usage:
 *   node scripts/pack-assets.cjs
 *
 * Output:
 *   kdm-hunt-assets.tar.gz (ready to upload to GitHub Release)
 */

const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const OUTPUT_FILE = path.join(ROOT_DIR, 'kdm-hunt-assets.tar.gz');

// Directories to include in the archive
const ASSET_DIRS = [
  'board',
  'cards',
  'hunt-backs',
  'hunt-sheets',
  'loot',
  'showdown'
];

// Patterns to EXCLUDE from the archive (HD assets are private)
const EXCLUDE_PATTERNS = [
  '--exclude=**/hd',
  '--exclude=**/hd/*',
  '--exclude=**/*-hd.*',
  '--exclude=**/*_hd.*',
  '--exclude=**/rulebook-hd',
  '--exclude=**/rulebook-hd/*'
];

function formatSize(bytes) {
  return (bytes / 1024 / 1024).toFixed(1);
}

function main() {
  // Check if assets directory exists
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error(`Error: Assets directory not found at ${ASSETS_DIR}`);
    process.exit(1);
  }

  console.log('KDM Hunt Assets Packer');
  console.log('======================\n');

  // Check each subdirectory and report size
  let totalSize = 0;
  const missingDirs = [];

  for (const dir of ASSET_DIRS) {
    const dirPath = path.join(ASSETS_DIR, dir);

    if (!fs.existsSync(dirPath)) {
      missingDirs.push(dir);
      console.log(`⚠ ${dir}/ - NOT FOUND`);
      continue;
    }

    // Get size using du command
    try {
      const output = execSync(`du -sb "${dirPath}"`, { encoding: 'utf-8' });
      const bytes = parseInt(output.split('\t')[0]);
      totalSize += bytes;

      const files = execSync(`find "${dirPath}" -type f | wc -l`, { encoding: 'utf-8' }).trim();
      console.log(`✓ ${dir}/ - ${formatSize(bytes)}MB (${files} files)`);
    } catch (err) {
      console.error(`Error checking ${dir}:`, err.message);
    }
  }

  if (missingDirs.length > 0) {
    console.error(`\nError: Missing directories: ${missingDirs.join(', ')}`);
    console.error('Make sure all asset directories exist before packing.');
    process.exit(1);
  }

  console.log(`\nTotal size: ${formatSize(totalSize)}MB`);
  console.log('\nCreating tarball (excluding private HD assets)...');

  // Create tarball with all asset directories, excluding HD files
  // Use relative paths and change to root directory first to avoid path encoding issues
  const dirs = ASSET_DIRS.map(d => `assets/${d}`).join(' ');

  // For Windows, use a simple output filename to avoid encoding issues
  const tempOutput = 'kdm-assets-temp.tar.gz';
  const excludeFlags = EXCLUDE_PATTERNS.join(' ');
  const command = `cd "${ROOT_DIR}" && tar -czf "${tempOutput}" ${excludeFlags} ${dirs}`;

  execSync(command, {
    stdio: 'inherit',
    shell: 'bash'
  });

  // Move to final location
  const tempPath = path.join(ROOT_DIR, tempOutput);
  if (fs.existsSync(OUTPUT_FILE)) {
    fs.unlinkSync(OUTPUT_FILE);
  }
  fs.renameSync(tempPath, OUTPUT_FILE);

  // Check output file size
  const stats = fs.statSync(OUTPUT_FILE);
  const compressedSize = formatSize(stats.size);
  const compressionRatio = ((stats.size / totalSize) * 100).toFixed(1);

  console.log(`\n✓ Created ${path.basename(OUTPUT_FILE)}`);
  console.log(`  Original size: ${formatSize(totalSize)}MB`);
  console.log(`  Compressed size: ${compressedSize}MB (${compressionRatio}% of original)`);
  console.log(`  ⚠ HD assets excluded (private files not included)`);
  console.log(`\nNext steps:`);
  console.log(`  1. Upload this file to a GitHub Release as "kdm-hunt-assets.tar.gz"`);
  console.log(`  2. Run: gh release create assets-v2 --title "Game Assets" --notes "游戏资源包（不含HD资源）" kdm-hunt-assets.tar.gz`);
  console.log(`  3. The CI build will automatically download it`);
}

main();
