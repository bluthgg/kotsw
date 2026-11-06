"""Build the wedding gallery files from the photographer's zip.

Usage (run from the repo root, kotsw/):
    pip install pillow
    python _source/wedding-gallery/build_photos.py

Reads   _photos_originals/<the zip>           (stays out of the website)
Writes  public/wedding/photos/<section>/<NNNN>.jpg    full photos, copied byte for byte
        public/wedding/thumbs/<section>/<NNNN>.jpg    grid thumbnails
        public/wedding/photos.json                    sections and photos, with sizes

Safe to run again. Existing thumbnails are skipped unless you pass --force.
The photo ids (for example ceremony-0123) come from the photographer's file
numbers, so favorites and comments keep pointing at the same photo.
"""
import argparse, io, json, pathlib, re, sys, zipfile
from PIL import Image, ImageOps

# Order and display names of the sections, as on the photographer's site.
# A folder in the zip that is not listed here is added at the end.
SECTIONS = [
    "Getting Ready",
    "Pre-Ceremony Portraits",
    "First Look",
    "Ceremony",
    "Portraits",
    "Reception",
    "Magic Kingdom Portraits",
]
THUMB_EDGE = 480      # longest side of a grid thumbnail, in pixels
THUMB_QUALITY = 78

def slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")

def main():
    root = pathlib.Path(__file__).resolve().parents[2]
    ap = argparse.ArgumentParser()
    ap.add_argument("--zip", help="path to the photographer's zip")
    ap.add_argument("--out", default=str(root / "public" / "wedding"))
    ap.add_argument("--force", action="store_true", help="rebuild thumbnails that exist")
    a = ap.parse_args()

    if a.zip:
        zpath = pathlib.Path(a.zip)
    else:
        zips = sorted((root / "_photos_originals").glob("*.zip"))
        if not zips:
            sys.exit("No zip found in _photos_originals. Pass --zip <path>.")
        zpath = zips[0]
    out = pathlib.Path(a.out)

    by_section = {}
    with zipfile.ZipFile(zpath) as z:
        for info in z.infolist():
            if info.is_dir():
                continue
            parts = info.filename.replace("\\", "/").split("/")
            # only <section>/<file>.jpg is used; the license PDF and anything else is skipped
            if len(parts) != 2 or not parts[1].lower().endswith((".jpg", ".jpeg")):
                continue
            m = re.search(r"(\d+)\.jpe?g$", parts[1], re.I)
            if not m:
                print("skip (no number):", info.filename)
                continue
            by_section.setdefault(parts[0], []).append((int(m.group(1)), info))

        names = [s for s in SECTIONS if s in by_section]
        names += sorted(s for s in by_section if s not in SECTIONS)
        manifest = {"title": "Provost & Bowman Wedding", "sections": []}
        total = 0
        for name in names:
            sid = slug(name)
            (out / "photos" / sid).mkdir(parents=True, exist_ok=True)
            (out / "thumbs" / sid).mkdir(parents=True, exist_ok=True)
            photos = []
            for num, info in sorted(by_section[name], key=lambda t: t[0]):
                fname = f"{num:04d}.jpg"
                data = z.read(info)
                with Image.open(io.BytesIO(data)) as im:
                    im = ImageOps.exif_transpose(im)
                    w, h = im.size
                    (out / "photos" / sid / fname).write_bytes(data)
                    tpath = out / "thumbs" / sid / fname
                    if a.force or not tpath.exists():
                        t = im.convert("RGB")
                        t.thumbnail((THUMB_EDGE, THUMB_EDGE), Image.LANCZOS)
                        t.save(tpath, "JPEG", quality=THUMB_QUALITY, optimize=True, progressive=True)
                photos.append({"id": f"{sid}-{num:04d}", "f": f"photos/{sid}/{fname}",
                               "t": f"thumbs/{sid}/{fname}", "w": w, "h": h})
            manifest["sections"].append({"id": sid, "title": name, "count": len(photos), "photos": photos})
            total += len(photos)
            print(f"{name}: {len(photos)}")

    (out / "photos.json").write_text(json.dumps(manifest, separators=(",", ":")), encoding="utf-8")
    print(f"done: {total} photos in {len(names)} sections -> {out}")

if __name__ == "__main__":
    main()
