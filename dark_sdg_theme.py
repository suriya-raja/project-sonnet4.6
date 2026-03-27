import os

def update_colors(content):
    c = content
    c = c.replace('#00e5ff', '#10b981') # Neon Cyan -> Emerald
    c = c.replace('#00b4d8', '#059669') # Cyan -> Deep Green
    c = c.replace('rgba(0, 229, 255', 'rgba(16, 185, 129')
    c = c.replace('cyan-', 'emerald-')
    c = c.replace('glow-cyan', 'glow-emerald')
    return c

# 1. Update landing.html
landing_path = r"C:\Users\RISHO\.gemini\antigravity\scratch\project-sonnet4.6\public\landing.html"
with open(landing_path, "r", encoding="utf-8") as f:
    html = f.read()

html = update_colors(html)

# Adjust lighting slightly to make the dark earth look richer and organic, not just a floating rock in deep space
html = html.replace('new THREE.AmbientLight(0xffffff, 0.05)', 'new THREE.AmbientLight(0xffffff, 0.15)')

# Make the falling stars (now emerald lines) look like floating fireflies or pollen by dropping their speed and changing color randomly
html = html.replace('color: 0xffffff, size: 0.05', 'color: 0xfbbf24, size: 0.08') # amber pollen in the air

with open(landing_path, "w", encoding="utf-8") as f:
    f.write(html)

# 2. Update dashboard/page.js
dash_path = r"C:\Users\RISHO\.gemini\antigravity\scratch\project-sonnet4.6\src\app\dashboard\page.js"
with open(dash_path, "r", encoding="utf-8") as f:
    js = f.read()

js = update_colors(js)

# Replace Space Terminology with SDG / Agriculture Terminology
js = js.replace('Mission Control,', 'Welcome back,')
js = js.replace("|| 'Operator'", "|| 'Partner'")
js = js.replace("SECTOR:", "COMMUNITY:")
js = js.replace("AWAITING DIRECTIVE", "TOGETHER WE END HUNGER")
js = js.replace("Initiate Transfer →", "Share Surplus →")
js = js.replace("Scan local coordinates for high-priority recovery missions.", "Find free, fresh, and perfectly edible surplus meals shared locally.")
js = js.replace("Access Network →", "Search Map →")
js = js.replace("Communicate directly with field agents to intercept post-harvest yield.", "Connect directly with farmers to rescue unsellable crop yields before they waste.")
js = js.replace("Intercept Data →", "Browse Farms →")
js = js.replace("Missions Done", "Meals Shared")

with open(dash_path, "w", encoding="utf-8") as f:
    f.write(js)
