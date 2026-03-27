import os

path = r"C:\Users\RISHO\.gemini\antigravity\scratch\project-sonnet4.6\public\landing.html"
with open(path, "r", encoding="utf-8") as f:
    c = f.read()

# 1. Add GLTFLoader
c = c.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>',
              '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n<script src="https://unpkg.com/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>')

# 2. Add Directional light and reduce ambient properly
old_light = """        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
        scene.add(ambientLight);"""

new_light = """        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
        scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 3.0);
        dirLight.position.set(5, 3, 2);
        scene.add(dirLight);"""

c = c.replace(old_light, new_light)

# 3. Update Texture
c = c.replace("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
              "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg")

c = c.replace("opacity: 0.9", "opacity: 1.0")

# 4. Add Astronaut loader before comets
astro_loader = """
        // Astronaut
        let astronaut;
        const gltfLoader = new THREE.GLTFLoader();
        gltfLoader.load('https://raw.githubusercontent.com/google/model-viewer/master/packages/shared-assets/models/Astronaut.glb', (gltf) => {
            astronaut = gltf.scene;
            astronaut.scale.set(0.6, 0.6, 0.6);
            astronaut.position.set(-3, 0, -1);
            scene.add(astronaut);
        });

        // Comets and Shooting Stars
"""
c = c.replace('        // Comets and Shooting Stars', astro_loader)

# 5. Add Astronaut animate
astro_anim = """
            if (astronaut) {
                const time = Date.now() * 0.001;
                astronaut.position.y = Math.sin(time) * 0.5;
                astronaut.position.x = -3.5 + Math.cos(time * 0.5) * 0.5;
                astronaut.rotation.y += 0.002;
                astronaut.rotation.z = Math.sin(time * 0.5) * 0.1;
            }

            comets.forEach((comet) => {"""
c = c.replace('            comets.forEach((comet) => {', astro_anim)

with open(path, "w", encoding="utf-8") as f:
    f.write(c)
