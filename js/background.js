// Three.js Background Effect
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg-canvas'),
    antialias: true,
    alpha: true
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(30);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

// Create stars with different colors and sizes
const starsGeometry = new THREE.BufferGeometry();
const starsMaterial = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.1,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
});

const starsVertices = [];
const starsColors = [];
const starsSizes = [];

for (let i = 0; i < 15000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starsVertices.push(x, y, z);

    // Random colors
    const color = new THREE.Color();
    color.setHSL(Math.random(), 0.7, 0.5);
    starsColors.push(color.r, color.g, color.b);

    // Random sizes
    starsSizes.push(Math.random() * 0.2);
}

starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starsColors, 3));
starsGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starsSizes, 1));

const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Add a subtle glow effect
const glowGeometry = new THREE.SphereGeometry(100, 32, 32);
const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
        color: { value: new THREE.Color(0x0070f3) },
        time: { value: 0 }
    },
    vertexShader: `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        uniform vec3 color;
        uniform float time;
        varying vec3 vNormal;
        void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            gl_FragColor = vec4(color, intensity * 0.2);
        }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending
});

const glow = new THREE.Mesh(glowGeometry, glowMaterial);
scene.add(glow);

// Mouse movement effect
const mouse = new THREE.Vector2();
const target = new THREE.Vector2();
const windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);

document.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX - windowHalf.x) * 0.0005;
    mouse.y = (event.clientY - windowHalf.y) * 0.0005;
});

// Animation
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    
    // Rotate stars based on mouse position
    stars.rotation.x += 0.0005;
    stars.rotation.y += 0.0005;
    
    // Add mouse movement effect
    target.x = mouse.x;
    target.y = mouse.y;
    
    camera.position.x += (target.x - camera.position.x) * 0.05;
    camera.position.y += (target.y - camera.position.y) * 0.05;
    
    // Update glow effect
    glowMaterial.uniforms.time.value = time;
    glow.rotation.x = time * 0.1;
    glow.rotation.y = time * 0.1;
    
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    windowHalf.set(window.innerWidth / 2, window.innerHeight / 2);
});

// Start animation
animate(); 