"""Ensure mixed atlases contain no pixels outside the reviewed card cells."""
import json
from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
plans = json.loads((root / 'scripts/official-assets.json').read_text('utf8'))
for plan in plans:
    target = root / plan['target']
    assert target.is_file(), target
    if plan.get('copy'):
        continue
    with Image.open(target) as image:
        remainder = image.convert('RGB')
        draw = ImageDraw.Draw(remainder)
        for col, row in plan['cells']:
            left, top, right, bottom = [round(n) for n in (
                col * image.width / plan['w'], row * image.height / plan['h'],
                (col + 1) * image.width / plan['w'], (row + 1) * image.height / plan['h'])]
            draw.rectangle((left, top, right - 1, bottom - 1), fill='black')
        assert remainder.getbbox() is None, f'Unreviewed artwork remains: {target}'
print(f'Passed: {len(plans) - 1} sanitized atlases contain only reviewed cells.')
