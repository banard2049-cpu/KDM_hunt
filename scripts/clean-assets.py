"""Build reviewed atlas cells, then remove unreferenced imported assets.

Run after downloading an older asset archive and before staging or packing.
Pillow is required only when an original mixed atlas needs sanitizing.
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
PLAN = json.loads((ROOT / 'scripts/official-assets.json').read_text('utf8'))


def inside(relative):
    target = (ROOT / relative).resolve()
    if not target.is_relative_to((ROOT / 'assets').resolve()):
        raise ValueError(f'Asset path escapes workspace: {relative}')
    return target


def main():
    generated = 0
    for plan in PLAN:
        source, target = inside(plan['source']), inside(plan['target'])
        if target.exists():
            continue
        if not source.exists():
            raise FileNotFoundError(f'Missing official asset source: {source}')
        target.parent.mkdir(parents=True, exist_ok=True)
        if plan.get('copy'):
            target.write_bytes(source.read_bytes())
        else:
            from PIL import Image
            with Image.open(source) as original:
                clean = Image.new('RGB', original.size, 'black')
                for col, row in plan['cells']:
                    box = (round(col * original.width / plan['w']),
                           round(row * original.height / plan['h']),
                           round((col + 1) * original.width / plan['w']),
                           round((row + 1) * original.height / plan['h']))
                    clean.paste(original.crop(box), box)
                clean.save(target, format='PNG')
        generated += 1

    files = list((ROOT / 'data').glob('*.json')) + [ROOT / 'index.html']
    files += [p for p in (ROOT / 'assets').iterdir() if p.is_file() and p.suffix in {'.js', '.css', '.html'}]
    text = '\n'.join(p.read_text('utf8') for p in files)
    keep = set(re.findall(r'assets/[^\s"\'`<>\\)]+\.(?:png|jpe?g|webp|svg|gif|pdf)', text))
    # Rulebook crop pages are assembled as assets/cards/ + relative filename.
    for p in (ROOT / 'assets/cards').rglob('*'):
        if p.is_file() and p.name in text:
            keep.add(p.relative_to(ROOT).as_posix())
    missing = [p for p in keep if not inside(p).exists() and '/hd/' not in p and 'rulebook-hd/' not in p]
    if missing:
        raise FileNotFoundError('Missing referenced assets: ' + ', '.join(sorted(missing)))
    removed = size = 0
    for directory in ['board', 'cards', 'hunt-backs', 'hunt-sheets', 'loot', 'showdown']:
        base = inside('assets/' + directory)
        if not base.exists():
            continue
        for p in list(base.rglob('*')):
            if not p.is_file():
                continue
            relative = p.relative_to(ROOT).as_posix()
            if relative not in keep:
                checked = inside(relative)
                size += checked.stat().st_size
                checked.unlink()
                removed += 1
    print(f'Official assets: {generated} atlases generated; {removed} unused files removed ({size / 1048576:.1f} MiB).')


if __name__ == '__main__':
    main()
