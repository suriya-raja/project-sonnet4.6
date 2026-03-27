import os
import re

# Aqua theme color definitions
AQUA_PRIMARY = '#00e5ff'
AQUA_SECONDARY = '#00b4d8'
AQUA_GLOW = 'rgba(0, 229, 255, 0.3)'

def apply_aqua_theme_to_js(content):
    c = content
    # Replace Emerald colors
    c = c.replace('#10b981', AQUA_PRIMARY)
    c = c.replace('#064e3b', AQUA_SECONDARY)
    c = c.replace('rgba(16, 185, 129', 'rgba(0, 229, 255')
    
    # Text changes
    c = c.replace('color: #10b981', 'color: #00e5ff')
    c = c.replace('color: "#10b981"', 'color: "#00e5ff"')
    
    # Remove globe initialization in THREE.js blocks if present
    c = re.sub(r'const globeGeo =.*?scene\.add\(globe\);', '', c, flags=re.DOTALL)
    c = re.sub(r'globe\.rotation\..*?;', '', c, flags=re.DOTALL)
    
    # Change particles to cyan
    c = c.replace('0x10b981', '0x00e5ff')
    c = c.replace('0x00e5ff', '0x00e5ff') # safety
    
    return c

def apply_aqua_theme_to_html(content):
    c = content
    # Replace the theme colors
    c = c.replace('#10b981', AQUA_PRIMARY)
    c = c.replace('#059669', AQUA_SECONDARY)
    c = c.replace('rgba(16, 185, 129', 'rgba(0, 229, 255')
    c = c.replace('emerald-', 'cyan-')
    c = c.replace('glow-emerald', 'glow-cyan')
    c = c.replace('0x10b981', '0x00e5ff')
    
    # Remove globe logic
    c = re.sub(r'const globeGeometry =.*?scene\.add\(globeParticles\);', '', c, flags=re.DOTALL)
    c = re.sub(r'globeParticles\.rotation\..*?;', '', c, flags=re.DOTALL)
    c = re.sub(r'tl\.to\(globeParticles\.scale,.*?z: 5 \}, 0\)', '', c, flags=re.DOTALL)
    c = re.sub(r'gsap\.fromTo\(globeParticles\.position,.*?ease: "power3\.out" \);', '', c, flags=re.DOTALL)
    c = re.sub(r'gsap\.fromTo\(globeParticles\.rotation,.*?ease: "power3\.out" \);', '', c, flags=re.DOTALL)
    
    return c

# 1. Update landing.html
landing_path = r"C:\Users\RISHO\.gemini\antigravity\scratch\project-sonnet4.6\public\landing.html"
with open(landing_path, "r", encoding="utf-8") as f:
    html = f.read()
html = apply_aqua_theme_to_html(html)
with open(landing_path, "w", encoding="utf-8") as f:
    f.write(html)

# 2. Update dashboard pages
dashboard_dir = r"C:\Users\RISHO\.gemini\antigravity\scratch\project-sonnet4.6\src\app\dashboard"
pages = [
    "page.js",
    "farm/page.js",
    "farm/post/page.js",
    "give/page.js",
    "orders/page.js",
    "scoreboard/page.js",
    "take/page.js"
]

for p in pages:
    full_path = os.path.join(dashboard_dir, p)
    if os.path.exists(full_path):
        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        updated = apply_aqua_theme_to_js(content)
        
        # Inject background for sub-dashboard items if not present
        if p != "page.js" and "canvasRef" not in updated:
            # Simple dash injection or wrapping
            pass # Keep it simple for now, the user wants the "color theme"
        
        with open(full_path, "w", encoding="utf-8") as f:
            f.write(updated)
