import os
import re

dashboard_dir = r"C:\Users\RISHO\.gemini\antigravity\scratch\project-sonnet4.6\src\app\dashboard"
pages = [
    "farm/page.js",
    "farm/post/page.js",
    "give/page.js",
    "orders/page.js",
    "scoreboard/page.js",
    "take/page.js"
]

import_stmt = "import ThreeBackground from '@/components/ThreeBackground';\n"

for p in pages:
    full_path = os.path.join(dashboard_dir, p)
    if os.path.exists(full_path):
        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # 1. Add import if missing
        if "ThreeBackground" not in content:
            # Insert after other imports
            content = content.replace("import AuthGuard", import_stmt + "import AuthGuard")
        
        # 2. Inject component inside AuthGuard if present
        if "<AuthGuard>" in content and "<ThreeBackground />" not in content:
            content = content.replace("<AuthGuard>", "<AuthGuard>\n      <ThreeBackground />")
        
        # 3. Ensure color themes are correct (Aqua Blue)
        # (The aqua_theme_cleanup script already ran, but let's be sure)
        content = content.replace('#10b981', '#00e5ff')
        
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(content)
