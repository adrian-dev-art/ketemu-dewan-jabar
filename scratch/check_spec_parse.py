import os, re

md_path = "docs/SPESIFIKASI_TEKNIS_PLATFORM_HUDANG.md"
with open(md_path, "r", encoding="utf-8") as f:
    lines = f.read().splitlines()

print("Total lines in MD:", len(lines))

in_code = False
in_math = False
in_table = False
in_alert = False
paragraphs = 0
tables = 0
alerts = 0
code_blocks = 0
math_blocks = 0
headings = 0

for line in lines:
    t = line.strip()
    if t.startswith("```"):
        in_code = not in_code
        if not in_code: code_blocks += 1
        continue
    if in_code: continue

    if t.startswith("$$"):
        in_math = not in_math
        if not in_math: math_blocks += 1
        continue
    if in_math: continue

    if t.startswith("|") and t.endswith("|"):
        if not in_table:
            in_table = True
            tables += 1
        continue
    else:
        in_table = False

    if re.match(r"^>\s*\[!", t):
        in_alert = True
        alerts += 1
        continue
    elif in_alert:
        if t.startswith(">"): continue
        else: in_alert = False

    if t.startswith("#"):
        headings += 1
        continue

    if t:
        paragraphs += 1

print(f"Stats: headings={headings}, paragraphs={paragraphs}, tables={tables}, alerts={alerts}, code_blocks={code_blocks}, math_blocks={math_blocks}")
