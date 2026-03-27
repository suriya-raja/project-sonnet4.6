import os
import re

path = r"C:\Users\RISHO\.gemini\antigravity\scratch\project-sonnet4.6\public\landing.html"
with open(path, "r", encoding="utf-8") as f:
    c = f.read()

# 1. Remove Comets Setup
c = re.sub(r"// Comets and Shooting Stars.*?comets\.push\(comet\);\n\s*}", "", c, flags=re.DOTALL)

# 2. Modify Astronaut config
c = c.replace('astronaut.scale.set(0.6, 0.6, 0.6);', 'astronaut.scale.set(1.5, 1.5, 1.5);')

# 3. Change Astronaut animation and remove comets loop
c = re.sub(r'if \(astronaut\).*?\}', """if (astronaut) {
                const time = Date.now() * 0.001;
                astronaut.position.x = Math.sin(time * 0.2) * 8; // Float wide left and right
                astronaut.position.y = Math.cos(time * 0.15) * 5; // Float high and low
                astronaut.position.z = Math.sin(time * 0.3) * 3 - 2; // Move smoothly back and front
                astronaut.rotation.x = Math.sin(time * 0.2) * 0.5;
                astronaut.rotation.y += 0.003;
                astronaut.rotation.z = Math.cos(time * 0.2) * 0.5;
            }""", c, flags=re.DOTALL, count=1)

c = re.sub(r'comets\.forEach\(\(comet\) => \{.*?\}\);', '', c, flags=re.DOTALL)

# 4. Make stars move
star_old = "starField.rotation.y += 0.0005;"
star_new = """starField.rotation.y += 0.0002;
            const positions = starGeometry.attributes.position.array;
            for(let i = 2; i < positions.length; i+=3) {
                positions[i] += 0.08;
                if (positions[i] > 20) {
                    positions[i] = -80;
                }
            }
            starGeometry.attributes.position.needsUpdate = true;"""
c = c.replace(star_old, star_new)

with open(path, "w", encoding="utf-8") as f:
    f.write(c)
