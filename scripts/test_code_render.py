import os
import subprocess
import pygments
from pygments.lexers import get_lexer_by_name
from pygments.formatters import HtmlFormatter

code = '''import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const router = Router();

// Endpoint Autentikasi NIK Kependudukan dan Password
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Kredensial tidak valid' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: 'Kredensial tidak valid' });

    const token = jwt.sign(
        { userId: user.id, role: user.role, nik: user.nik },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
    );
    return res.json({ success: true, token });
});
'''

lexer = get_lexer_by_name('typescript')
formatter = HtmlFormatter(style='one-dark', linenos=True)
code_html = pygments.highlight(code, lexer, formatter)
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
    box-shadow: 0 10px 28px rgba(0,0,0,0.22);
    overflow: hidden;
    width: 1100px;
  }}
  .titlebar {{
    background: #21252B;
    padding: 9px 14px;
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
    padding: 4px 12px;
    border-radius: 4px 4px 0 0;
    border-top: 2px solid #61AFEF;
    margin-left: 6px;
  }}
  .file-name {{
    font-size: 12px;
    font-weight: 500;
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
    padding-right: 16px;
    user-select: none;
    border-right: 1px solid #3E4451;
    width: 42px;
  }}
  .highlight td.code {{
    padding-left: 16px;
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
    padding: 4px 14px;
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
        <span class="file-name">auth.routes.ts</span>
      </div>
      <div class="breadcrumb">MEETDEWAN &gt; backend &gt; src &gt; routes &gt; auth.routes.ts</div>
    </div>
    <div class="code-area">
      {code_html}
    </div>
    <div class="statusbar">
      <span>TypeScript &bull; UTF-8</span>
      <span>Platform HUDANG Backend Core</span>
    </div>
  </div>
</body>
</html>
"""

with open("docs/test_code.html", "w", encoding="utf-8") as f:
    f.write(html_content)

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
png_file = os.path.abspath("docs/test_code.png")
cmd = [
    edge_path,
    "--headless=new",
    "--disable-gpu",
    "--force-device-scale-factor=2",
    f"--screenshot={png_file}",
    "--window-size=1180,680",
    "file:///" + os.path.abspath("docs/test_code.html").replace("\\", "/")
]
res = subprocess.run(cmd, capture_output=True, text=True)
print("Return code:", res.returncode)
print("Generated:", os.path.exists(png_file), os.path.getsize(png_file) if os.path.exists(png_file) else 0)
