import os

path = r"C:\Users\RISHO\.gemini\antigravity\scratch\project-sonnet4.6\public\landing.html"
with open(path, "r", encoding="utf-8") as f:
    c = f.read()

c = c.replace("rose", "cyan")
c = c.replace("#ff4d6d", "#00e5ff")
c = c.replace("#ff2a54", "#00b4d8")
c = c.replace("rgba(255, 77, 109", "rgba(0, 229, 255")
c = c.replace("0xff4d6d", "0x00e5ff")
c = c.replace("earth-night.jpg", "earth-blue-marble.jpg")
c = c.replace("new THREE.AmbientLight(0xffffff, 0.5)", "new THREE.AmbientLight(0xffffff, 1.2)")
c = c.replace("opacity: 0.95", "opacity: 1.0")

with open(path, "w", encoding="utf-8") as f:
    f.write(c)
