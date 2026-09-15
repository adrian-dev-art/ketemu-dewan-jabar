import os
import re
import subprocess
import pygments
from pygments.lexers import get_lexer_by_name, TextLexer
from pygments.lexer import RegexLexer
from pygments.token import Comment, Keyword, Name, Number, String, Whitespace, Operator, Punctuation
from pygments.formatters import HtmlFormatter

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
SCREENSHOT_DIR = os.path.join(DOCS_DIR, "code_screenshots")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

EDGE_PATH = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

class PrismaLexer(RegexLexer):
    name = 'Prisma'
    tokens = {
        'root': [
            (r'//.*?\n', Comment.Single),
            (r'\b(datasource|generator|model|enum|type)\b', Keyword.Declaration),
            (r'\b(String|Int|Float|Boolean|DateTime|Json|Bytes|BigInt|Decimal)\b', Keyword.Type),
            (r'@(id|default|unique|relation|updatedAt|map|index|db\.[a-zA-Z]+)', Name.Decorator),
            (r'"(\\\\|\\"|[^"])*"', String.Double),
            (r'\b(true|false|now|autoincrement|cuid|uuid)\b', Keyword.Constant),
            (r'\b\d+\b', Number.Integer),
            (r'[a-zA-Z_][a-zA-Z0-9_]*', Name),
            (r'[\{\}\[\]\(\)\?]', Punctuation),
            (r'[=:]', Operator),
            (r'\s+', Whitespace),
            (r'.', Name),
        ]
    }

def get_lexer_for_lang(lang, filename):
    l = lang.lower().strip()
    if 'prisma' in l or filename.endswith('.prisma'):
        return PrismaLexer()
    if l in ['typescript', 'ts']:
        return get_lexer_by_name('typescript')
    if l in ['tsx', 'jsx', 'javascript', 'js']:
        return get_lexer_by_name('javascript')
    if l in ['yaml', 'yml']:
        return get_lexer_by_name('yaml')
    if l in ['json']:
        return get_lexer_by_name('json')
    if l in ['nginx']:
        return get_lexer_by_name('nginx')
    if l in ['ini', 'conf']:
        return get_lexer_by_name('ini')
    try:
        return get_lexer_by_name(l)
    except:
        return TextLexer()

def render_code_to_html(code_text, lang, filename, breadcrumb, status_label, start_line=1):
    lexer = get_lexer_for_lang(lang, filename)
    formatter = HtmlFormatter(style='one-dark', linenos=True, linenostart=start_line)
    code_html = pygments.highlight(code_text.strip(), lexer, formatter)
    css_styles = formatter.get_style_defs('.highlight')

    html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    background-color: #F8FAFC;
    padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    display: flex;
    justify-content: center;
  }}
  .window {{
    background: #282C34;
    border-radius: 8px;
    border: 1px solid #3E4451;
    box-shadow: 0 12px 32px rgba(0,0,0,0.25);
    overflow: hidden;
    width: 1120px;
  }}
  .titlebar {{
    background: #21252B;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    border-bottom: 1px solid #181A1F;
    gap: 12px;
  }}
  .traffic-lights {{
    display: flex;
    gap: 7px;
  }}
  .dot {{
    width: 11px;
    height: 11px;
    border-radius: 50%;
  }}
  .dot-red {{ background: #FF5F56; }}
  .dot-yellow {{ background: #FFBD2E; }}
  .dot-green {{ background: #27C93F; }}
  .tabs {{
    display: flex;
    align-items: center;
    gap: 6px;
    background: #282C34;
    padding: 5px 14px;
    border-radius: 5px 5px 0 0;
    border-top: 2px solid #61AFEF;
    margin-left: 6px;
  }}
  .file-name {{
    font-size: 12px;
    font-weight: 600;
    color: #D7DAE0;
    font-family: 'Segoe UI', sans-serif;
  }}
  .breadcrumb {{
    margin-left: auto;
    font-size: 11px;
    color: #5C6370;
    font-family: 'Consolas', monospace;
  }}
  .code-area {{
    padding: 14px 18px;
    font-family: 'Consolas', 'JetBrains Mono', monospace;
    font-size: 12.5px;
    line-height: 1.5;
  }}
  {css_styles}
  .highlight {{
    background: transparent !important;
  }}
  .highlight table {{
    border-collapse: collapse;
    width: 100%;
  }}
  .highlight td.linenos {{
    color: #4B5263 !important;
    background: transparent !important;
    text-align: right;
    padding-right: 18px;
    user-select: none;
    border-right: 1px solid #3E4451;
    width: 44px;
  }}
  .highlight td.code {{
    padding-left: 18px;
    background: transparent !important;
  }}
  .highlight pre {{
    margin: 0;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }}
  .statusbar {{
    background: #21252B;
    border-top: 1px solid #181A1F;
    color: #9DA5B4;
    font-size: 11px;
    padding: 4px 16px;
    display: flex;
    justify-content: space-between;
    font-weight: 500;
  }}
</style>
</head>
<body>
  <div class="window">
    <div class="titlebar">
      <div class="traffic-lights">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
      </div>
      <div class="tabs">
        <span class="file-name">{filename}</span>
      </div>
      <div class="breadcrumb">{breadcrumb}</div>
    </div>
    <div class="code-area">
      {code_html}
    </div>
    <div class="statusbar">
      <span>{status_label} &bull; UTF-8</span>
      <span>Sekretariat DPRD Jawa Barat &bull; Platform HUDANG</span>
    </div>
  </div>
</body>
</html>
"""
    return html_content

def capture_screenshot(html_content, output_png_path, line_count):
    temp_html = output_png_path.replace(".png", ".html")
    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(html_content)

    # Calculate optimal window height based on line count
    calc_height = min(max(180 + (line_count * 21), 260), 2200)

    cmd = [
        EDGE_PATH,
        "--headless=new",
        "--disable-gpu",
        "--force-device-scale-factor=2",
        f"--screenshot={os.path.abspath(output_png_path)}",
        f"--window-size=1200,{calc_height}",
        "file:///" + os.path.abspath(temp_html).replace("\\", "/")
    ]
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
    if res.returncode == 0 and os.path.exists(output_png_path):
        size = os.path.getsize(output_png_path)
        print(f"Rendered: {os.path.basename(output_png_path)} ({size:,} bytes, {line_count} lines)")
        return True
    else:
        print(f"Error rendering {output_png_path}: {res.stderr}")
        return False

def extract_and_generate_all():
    md_path = os.path.join(DOCS_DIR, "SPESIFIKASI_TEKNIS_PLATFORM_HUDANG.md")
    with open(md_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    in_code = False
    lang = ""
    code_lines = []
    current_h = ""
    blocks = []

    for line in lines:
        trimmed = line.strip()
        if trimmed.startswith("## ") or trimmed.startswith("### ") or trimmed.startswith("#### "):
            current_h = trimmed
        elif trimmed.startswith("```"):
            if not in_code:
                in_code = True
                lang = trimmed[3:].strip()
                code_lines = []
            else:
                in_code = False
                if lang != "mermaid":
                    blocks.append({
                        "heading": current_h,
                        "lang": lang,
                        "lines": list(code_lines)
                    })
                code_lines = []
        elif in_code:
            code_lines.append(line)

    print(f"Found {len(blocks)} code blocks to process.")

    # Process Bab 2.3 Nginx (Block 0)
    nginx_lines = blocks[0]["lines"]
    # Part 1: lines 1-52
    p1 = "".join(nginx_lines[:52])
    html = render_code_to_html(p1, "nginx", "ketemudewan.perdinkeuangan.online.conf (Bagian 1/2)", "MEETDEWAN > nginx > conf.d > ketemudewan.conf", "Nginx SSL / Security Headers", start_line=1)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_2_3_nginx_part1.png"), 52)
    # Part 2: lines 53-102
    p2 = "".join(nginx_lines[52:])
    html = render_code_to_html(p2, "nginx", "ketemudewan.perdinkeuangan.online.conf (Bagian 2/2)", "MEETDEWAN > nginx > conf.d > ketemudewan.conf", "Nginx WebSocket & Rate Limiting", start_line=53)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_2_3_nginx_part2.png"), len(nginx_lines)-52)

    # Process Bab 2.5 LiveKit (Block 1)
    lk_lines = blocks[1]["lines"]
    html = render_code_to_html("".join(lk_lines), "yaml", "livekit.yaml", "MEETDEWAN > livekit > livekit.yaml", "LiveKit SFU Gateway Config", start_line=1)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_2_5_livekit.png"), len(lk_lines))

    # Process Bab 2.5 Coturn (Block 2)
    turn_lines = blocks[2]["lines"]
    html = render_code_to_html("".join(turn_lines), "ini", "turnserver.conf", "MEETDEWAN > coturn > turnserver.conf", "Coturn STUN/TURN Server Config", start_line=1)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_2_5_turnserver.png"), len(turn_lines))

    # Process Bab 2.6 Sysctl (Block 3)
    sysctl_lines = blocks[3]["lines"]
    html = render_code_to_html("".join(sysctl_lines), "ini", "99-hudang-performance.conf", "etc > sysctl.d > 99-hudang-performance.conf", "Linux Kernel Socket Tuning", start_line=1)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_2_6_sysctl.png"), len(sysctl_lines))

    # Process Bab 3.1 REST API Envelopes (Block 5 & 6)
    env_code = "".join(blocks[5]["lines"]) + "\n\n" + "".join(blocks[6]["lines"])
    html = render_code_to_html(env_code, "json", "api_response_envelope.json", "MEETDEWAN > backend > contracts > api_envelope.json", "Standard REST API Envelope", start_line=1)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_3_1_api_envelope.png"), len(blocks[5]["lines"]) + len(blocks[6]["lines"]) + 2)

    # Process Bab 3.3.1 Auth JWT Claim (Block 7 & 8)
    jwt_code = "".join(blocks[7]["lines"]) + "\n\n" + "".join(blocks[8]["lines"])
    html = render_code_to_html(jwt_code, "json", "auth_jwt_schema_and_claim.json", "MEETDEWAN > backend > contracts > auth_jwt.json", "JWT Token Claims & Schema", start_line=1)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_3_3_jwt.png"), len(blocks[7]["lines"]) + len(blocks[8]["lines"]) + 2)

    # Process Bab 3.3.2 LiveKit Token Schema (Block 9 & 10)
    lk_token_code = "".join(blocks[9]["lines"]) + "\n\n" + "".join(blocks[10]["lines"])
    html = render_code_to_html(lk_token_code, "json", "livekit_token_contract.json", "MEETDEWAN > backend > contracts > livekit_token.json", "LiveKit WebRTC Token Payload", start_line=1)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_3_3_livekit_token.png"), len(blocks[9]["lines"]) + len(blocks[10]["lines"]) + 2)

    # Process Bab 3.3.3 SIPD Kamus Usulan (Block 11)
    sipd_lines = blocks[11]["lines"]
    html = render_code_to_html("".join(sipd_lines), "json", "sipd_kamus_payload.json", "MEETDEWAN > contracts > sipd_kamus_payload.json", "Kamus Usulan SIPD Interoperability", start_line=1)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_3_3_sipd.png"), len(sipd_lines))

    # Process Bab 3.3.4 GeoJSON FeatureCollection (Block 12)
    geojson_lines = blocks[12]["lines"]
    html = render_code_to_html("".join(geojson_lines), "json", "geojson_spatial_payload.json", "MEETDEWAN > contracts > geojson_spatial_payload.json", "GeoJSON RFC 7946 Spatial Schema", start_line=1)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_3_3_geojson.png"), len(geojson_lines))

    # Process Bab 4.1 docker-compose.yml (Block 13)
    dc_lines = blocks[13]["lines"]
    html = render_code_to_html("".join(dc_lines), "yaml", "docker-compose.yml", "MEETDEWAN > docker-compose.yml", "Multi-Service Container Orchestration", start_line=1)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_4_1_docker_compose.png"), len(dc_lines))

    # Process Bab 4.2 schema.prisma (Block 14)
    prisma_lines = blocks[14]["lines"]
    # Part 1: User, Aspirasi, Verification, Schedule (lines 1-65)
    p1 = "".join(prisma_lines[:65])
    html = render_code_to_html(p1, "prisma", "schema.prisma (Bagian 1/2: User, Aspirasi, Verification, Schedule)", "MEETDEWAN > backend > prisma > schema.prisma", "Prisma ORM PostgreSQL Models", start_line=1)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_4_2_schema_part1.png"), 65)
    # Part 2: ActionFollowUp, Feedback, Egress, GIS (lines 66-128)
    p2 = "".join(prisma_lines[65:])
    html = render_code_to_html(p2, "prisma", "schema.prisma (Bagian 2/2: ActionFollowUp, Feedback, Egress, SessionLog)", "MEETDEWAN > backend > prisma > schema.prisma", "Prisma ORM PostgreSQL Models", start_line=66)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_4_2_schema_part2.png"), len(prisma_lines)-65)

    # Process Bab 4.3 auth.routes.ts (Block 15)
    auth_lines = blocks[15]["lines"]
    html = render_code_to_html("".join(auth_lines), "typescript", "auth.routes.ts", "MEETDEWAN > backend > src > routes > auth.routes.ts", "Express Router / Bcrypt & JWT Auth", start_line=1)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_4_3_auth_routes.png"), len(auth_lines))

    # Process Bab 4.4 analysisService.ts (Block 16)
    analysis_lines = blocks[16]["lines"]
    html = render_code_to_html("".join(analysis_lines), "typescript", "analysisService.ts", "MEETDEWAN > backend > src > services > analysisService.ts", "Google Gemini AI Multimodal Worker", start_line=1)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_4_4_analysis_service.png"), len(analysis_lines))

    # Process Bab 4.5 livekit.routes.ts (Block 17)
    livekit_lines = blocks[17]["lines"]
    html = render_code_to_html("".join(livekit_lines), "typescript", "livekit.routes.ts", "MEETDEWAN > backend > src > routes > livekit.routes.ts", "LiveKit Access Token Minting", start_line=1)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_4_5_livekit_routes.png"), len(livekit_lines))

    # Process Bab 4.6 PublicTransparencyPortal.tsx (Block 18)
    portal_lines = blocks[18]["lines"]
    html = render_code_to_html("".join(portal_lines), "tsx", "PublicTransparencyPortal.tsx", "MEETDEWAN > frontend > components > PublicTransparencyPortal.tsx", "React Next.js Public Transparency Component", start_line=1)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_4_6_portal_tsx.png"), len(portal_lines))

    # Process Bab 4.7 queueService.ts (Block 19)
    queue_lines = blocks[19]["lines"]
    html = render_code_to_html("".join(queue_lines), "typescript", "queueService.ts", "MEETDEWAN > backend > src > services > queueService.ts", "FFmpeg Audio Transcoder & Background Queue", start_line=1)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_4_7_queue_service.png"), len(queue_lines))

    # Process Bab 6.3 k6_load_test.js (Block 20)
    k6_lines = blocks[20]["lines"]
    html = render_code_to_html("".join(k6_lines), "javascript", "k6_load_test.js", "MEETDEWAN > tests > load > k6_load_test.js", "Grafana k6 Load & Concurrency Benchmark", start_line=1)
    capture_screenshot(html, os.path.join(SCREENSHOT_DIR, "code_6_3_k6_load_test.png"), len(k6_lines))

    print("\n[SUCCESS] All code screenshots generated successfully in docs/code_screenshots/!")

if __name__ == "__main__":
    extract_and_generate_all()
