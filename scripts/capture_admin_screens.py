import os
import sys
import json
import time
import shutil
from playwright.sync_api import sync_playwright

WORKSPACE_DIR = r"e:\project\DPRD\MEETDEWAN"
SCREENSHOTS_DIR = os.path.join(WORKSPACE_DIR, "screenshots")
ARTIFACT_DIR = r"C:\Users\adrian\.gemini\antigravity-ide\brain\5d7fafd6-a12d-4a4c-bc29-8133c06e3c12"

os.makedirs(SCREENSHOTS_DIR, exist_ok=True)
os.makedirs(ARTIFACT_DIR, exist_ok=True)

def run():
    print("[1/5] Starting Playwright browser...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="msedge")
        context = browser.new_context(
            viewport={'width': 1440, 'height': 900},
            device_scale_factor=1.25
        )
        page = context.new_page()

        # Step 1: Login Page with credentials filled
        print("[SCREENSHOT] 1. Login Page (/login)...")
        page.goto("http://localhost:3001/login", wait_until="networkidle")
        page.wait_for_timeout(1500)
        page.fill('input[type="email"]', 'admin@dewan.id')
        page.fill('input[type="password"]', 'password')
        page.wait_for_timeout(800)
        
        login_img = os.path.join(SCREENSHOTS_DIR, "01_login_page.png")
        page.screenshot(path=login_img)
        print("  -> Saved:", login_img)

        # Step 2: Submit login button
        print("[AUTH] Submitting login form...")
        page.click('button[type="submit"]')
        page.wait_for_url("**/admin", timeout=15000)
        page.wait_for_timeout(3000)

        # Step 3: Admin Dashboard
        print("[SCREENSHOT] 2. Super Admin Dashboard (/admin)...")
        admin_img = os.path.join(SCREENSHOTS_DIR, "02_admin_dashboard.png")
        page.screenshot(path=admin_img)
        print("  -> Saved:", admin_img)

        # Step 4: Admin Settings
        print("[SCREENSHOT] 3. Admin Settings (/admin/settings)...")
        page.goto("http://localhost:3001/admin/settings", wait_until="networkidle")
        page.wait_for_timeout(3000)
        settings_img = os.path.join(SCREENSHOTS_DIR, "03_admin_settings.png")
        page.screenshot(path=settings_img)
        print("  -> Saved:", settings_img)

        # Step 5: Admin Streaming Settings
        print("[SCREENSHOT] 4. Admin Streaming Settings (/admin/settings/streaming)...")
        page.goto("http://localhost:3001/admin/settings/streaming", wait_until="networkidle")
        page.wait_for_timeout(3000)
        streaming_img = os.path.join(SCREENSHOTS_DIR, "04_admin_streaming.png")
        page.screenshot(path=streaming_img)
        print("  -> Saved:", streaming_img)

        # Step 6: GIS Sentimen & Aspirasi
        print("[SCREENSHOT] 5. GIS Sentimen & Aspirasi (/gis)...")
        page.goto("http://localhost:3001/gis", wait_until="networkidle")
        page.wait_for_timeout(4000)
        gis_img = os.path.join(SCREENSHOTS_DIR, "05_gis_peta_aspirasi.png")
        page.screenshot(path=gis_img)
        print("  -> Saved:", gis_img)

        # Step 7: GIS Kunjungan Kerja Dewan
        print("[SCREENSHOT] 6. GIS Kunjungan Kerja (/gis-kunjungan)...")
        page.goto("http://localhost:3001/gis-kunjungan", wait_until="networkidle")
        page.wait_for_timeout(4000)
        kunjungan_img = os.path.join(SCREENSHOTS_DIR, "06_gis_kunjungan_dapil.png")
        page.screenshot(path=kunjungan_img)
        print("  -> Saved:", kunjungan_img)

        # Step 8: Profil Pengguna Admin
        print("[SCREENSHOT] 7. Profile Page (/profile)...")
        page.goto("http://localhost:3001/profile", wait_until="networkidle")
        page.wait_for_timeout(3000)
        profile_img = os.path.join(SCREENSHOTS_DIR, "07_admin_profile.png")
        page.screenshot(path=profile_img)
        print("  -> Saved:", profile_img)

        # Step 9: Panel Dewan (Admin view)
        print("[SCREENSHOT] 8. Dewan Panel (/dewan)...")
        page.goto("http://localhost:3001/dewan", wait_until="networkidle")
        page.wait_for_timeout(3000)
        dewan_img = os.path.join(SCREENSHOTS_DIR, "08_dewan_panel.png")
        page.screenshot(path=dewan_img)
        print("  -> Saved:", dewan_img)

        # Step 10: Portal Warga / Aspirasi (Admin view)
        print("[SCREENSHOT] 9. Masyarakat Portal (/masyarakat)...")
        page.goto("http://localhost:3001/masyarakat", wait_until="networkidle")
        page.wait_for_timeout(3000)
        masyarakat_img = os.path.join(SCREENSHOTS_DIR, "09_portal_masyarakat.png")
        page.screenshot(path=masyarakat_img)
        print("  -> Saved:", masyarakat_img)

        # Step 11: Landing Page (Session admin)
        print("[SCREENSHOT] 10. Landing Page (/)...")
        page.goto("http://localhost:3001/", wait_until="networkidle")
        page.wait_for_timeout(3000)
        landing_img = os.path.join(SCREENSHOTS_DIR, "10_landing_page.png")
        page.screenshot(path=landing_img)
        print("  -> Saved:", landing_img)

        # Step 12: Disposisi Aspirasi Tracker
        print("[SCREENSHOT] 11. Disposisi Tracking (/disposisi/192)...")
        page.goto("http://localhost:3001/disposisi/192", wait_until="networkidle")
        page.wait_for_timeout(3000)
        disposisi_img = os.path.join(SCREENSHOTS_DIR, "11_disposisi_tracking.png")
        page.screenshot(path=disposisi_img)
        print("  -> Saved:", disposisi_img)

        # Step 13: Room Pre-join / Virtual Meeting
        print("[SCREENSHOT] 12. Video Conference Pre-join (/room/192)...")
        page.goto("http://localhost:3001/room/192", wait_until="networkidle")
        page.wait_for_timeout(4000)
        room_img = os.path.join(SCREENSHOTS_DIR, "12_video_conference_room.png")
        page.screenshot(path=room_img)
        print("  -> Saved:", room_img)

        context.close()
        browser.close()

    print("[SYNC] Copying screenshots to artifacts directory...")
    for filename in os.listdir(SCREENSHOTS_DIR):
        if filename.endswith(".png"):
            src = os.path.join(SCREENSHOTS_DIR, filename)
            dst = os.path.join(ARTIFACT_DIR, filename)
            shutil.copy2(src, dst)
            print(f"  -> Synced {filename} to artifact dir")

    print("[SUCCESS] All screenshots completed!")

if __name__ == "__main__":
    run()
