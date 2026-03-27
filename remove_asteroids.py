import os
import re

path = r"C:\Users\RISHO\.gemini\antigravity\scratch\project-sonnet4.6\public\landing.html"
with open(path, "r", encoding="utf-8") as f:
    c = f.read()

# Make Astronaut bigger
c = c.replace('astronaut.scale.set(0.6, 0.6, 0.6);', 'astronaut.scale.set(2.0, 2.0, 2.0);')

# Remove floating asteroids setup
c = re.sub(r'// Floating Asteroids.*?asteroids\.push\(ast\);\n        \}', '', c, flags=re.DOTALL)

# Remove asteroids loop in animate
c = re.sub(r'asteroids\.forEach\(ast => \{.*?\}\);', '', c, flags=re.DOTALL)

with open(path, "w", encoding="utf-8") as f:
    f.write(c)
