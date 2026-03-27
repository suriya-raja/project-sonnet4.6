import os
import re

path = r"C:\Users\RISHO\.gemini\antigravity\scratch\project-sonnet4.6\public\landing.html"
with open(path, "r", encoding="utf-8") as f:
    c = f.read()

# Replace astronaut loader with farmer loader
loader_old = r"        // Astronaut.*?scene\.add\(astronaut\);\n        \}\);"
loader_new = """        // Farmer Hologram
        let astronaut;
        const texLoader2 = new THREE.TextureLoader();
        texLoader2.load('/farmer.png', (texture) => {
            const material = new THREE.SpriteMaterial({ 
                map: texture, 
                color: 0xccffff, // slight tint for hologram effect
                blending: THREE.AdditiveBlending, // makes black completely invisible!
                transparent: true,
                opacity: 0.9
            });
            astronaut = new THREE.Sprite(material);
            astronaut.scale.set(6.0, 6.0, 1); // Large glowing farmer
            astronaut.position.set(-3, 0, -1);
            scene.add(astronaut);
        });"""
c = re.sub(loader_old, loader_new, c, flags=re.DOTALL)

# Replace animation code
old_anim = r"""                astronaut\.rotation\.x = Math\.sin.*?\}"""
new_anim = """                // Sprite material rotation since normal rotation rules don't apply
                astronaut.material.rotation = Math.sin(time * 0.3) * 0.1;
            }"""
c = re.sub(old_anim, new_anim, c, flags=re.DOTALL)

with open(path, "w", encoding="utf-8") as f:
    f.write(c)
