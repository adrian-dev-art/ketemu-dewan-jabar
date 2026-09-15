import os, json, urllib.request
from playwright.sync_api import sync_playwright

def get_auth(email, password):
    req = urllib.request.Request(
        'http://localhost:5001/api/auth/login',
        data=json.dumps({'email': email, 'password': password}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode('utf-8'))

def run():
    os.makedirs('screenshots', exist_ok=True)
    
    # Pre-fetch tokens
    print("[AUTH] Fetching auth data from backend...")
    auth_masyarakat = get_auth('masyarakat@demo.id', 'password')
    auth_dewan = get_auth('ahmad@dewan.id', 'password')
    auth_admin = get_auth('admin@dewan.id', 'password')

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="msedge")

        # 1. Landing Page
        print("[SCREENSHOT] Capturing Landing Page...")
        ctx = browser.new_context(viewport={'width': 1366, 'height': 868})
        page = ctx.new_page()
        page.goto('http://localhost:3000/', wait_until='networkidle')
        page.wait_for_timeout(2000)
        page.screenshot(path='screenshots/landing_page.png')
        ctx.close()

        # 2. Login Page
        print("[SCREENSHOT] Capturing Login Page...")
        ctx = browser.new_context(viewport={'width': 1366, 'height': 868})
        page = ctx.new_page()
        page.goto('http://localhost:3000/login', wait_until='networkidle')
        page.wait_for_timeout(2000)
        page.screenshot(path='screenshots/login_page.png')
        ctx.close()

        # 3. Register Page
        print("[SCREENSHOT] Capturing Register Page...")
        ctx = browser.new_context(viewport={'width': 1366, 'height': 868})
        page = ctx.new_page()
        page.goto('http://localhost:3000/register', wait_until='networkidle')
        page.wait_for_timeout(2000)
        page.screenshot(path='screenshots/register_page.png')
        ctx.close()

        # 4. Masyarakat Dashboard
        print("[SCREENSHOT] Capturing Masyarakat Dashboard...")
        ctx = browser.new_context(viewport={'width': 1366, 'height': 868})
        page = ctx.new_page()
        page.goto('http://localhost:3000/login', wait_until='networkidle')
        page.evaluate(f"""() => {{
            localStorage.setItem('auth_token', '{auth_masyarakat['token']}');
            localStorage.setItem('auth_user', JSON.stringify({json.dumps(auth_masyarakat['user'])}));
        }}""")
        page.goto('http://localhost:3000/masyarakat', wait_until='networkidle')
        page.wait_for_timeout(3000)
        page.screenshot(path='screenshots/masyarakat_page.png')
        ctx.close()

        # 5. Dewan Dashboard
        print("[SCREENSHOT] Capturing Dewan Dashboard...")
        ctx = browser.new_context(viewport={'width': 1366, 'height': 868})
        page = ctx.new_page()
        page.goto('http://localhost:3000/login', wait_until='networkidle')
        page.evaluate(f"""() => {{
            localStorage.setItem('auth_token', '{auth_dewan['token']}');
            localStorage.setItem('auth_user', JSON.stringify({json.dumps(auth_dewan['user'])}));
        }}""")
        page.goto('http://localhost:3000/dewan', wait_until='networkidle')
        page.wait_for_timeout(3000)
        page.screenshot(path='screenshots/dewan_page.png')
        ctx.close()

        # 6. Admin Dashboard
        print("[SCREENSHOT] Capturing Admin Dashboard...")
        ctx = browser.new_context(viewport={'width': 1366, 'height': 868})
        page = ctx.new_page()
        page.goto('http://localhost:3000/login', wait_until='networkidle')
        page.evaluate(f"""() => {{
            localStorage.setItem('auth_token', '{auth_admin['token']}');
            localStorage.setItem('auth_user', JSON.stringify({json.dumps(auth_admin['user'])}));
        }}""")
        page.goto('http://localhost:3000/admin', wait_until='networkidle')
        page.wait_for_timeout(3000)
        page.screenshot(path='screenshots/admin_page.png')
        
        # 7. GIS Page
        print("[SCREENSHOT] Capturing GIS Page...")
        page.goto('http://localhost:3000/gis', wait_until='networkidle')
        page.wait_for_timeout(4000)
        page.screenshot(path='screenshots/gis_page.png')

        ctx.close()
        browser.close()
        print("[SUCCESS] All authenticated screenshots successfully captured and saved!")

if __name__ == "__main__":
    run()
