"""Build the standalone Ula'tek guide from the parts in ./parts.
Usage:  python build.py            ->  writes ulatek-heroic-guide.html next to this file
Needs only Python 3. Order matters: head, css, body sections, then the scripts."""
import pathlib
here = pathlib.Path(__file__).parent
P = here / "parts"
rd = lambda n: (P / n).read_text(encoding="utf-8")

js = "".join(rd(n) for n in ["j1-core.js", "j2-scenes.js", "j3-ui.js", "j4-icons.js"])
head = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<style>body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>
"""
mid = "<style>body{background:var(--bg);color:var(--fg)}</style>\n</head>\n<body>\n"
body = "".join(rd(n) for n in ["p3-top.html", "p4a-phase1.html", "p4b-phase2.html", "p5-int-p3.html"])
out = head + rd("p1-head.html") + rd("p2-css.html") + mid + body + "<script>\n" + js + "</script>\n</body></html>\n"
out = out.replace("<!--LOGO-->", "").replace("<!--/LOGO-->", "")  # logo markers: the Claude artifact copy strips whole blocks instead
(here / "ulatek-heroic-guide.html").write_text(out, encoding="utf-8")
print("wrote", len(out), "characters")
