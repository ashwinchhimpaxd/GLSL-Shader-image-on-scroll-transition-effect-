
import * as THREE from "three"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Lenis from "lenis"

gsap.registerPlugin(ScrollTrigger);

const sections = [
    { label: "three.js", src: './image/img1.jpg' },
    { label: "Shader", src: './image/img2.jpg' },
    { label: "a water drop ", src: './image/img3.jpg' },
    { label: "wave effect", src: './image/img4.jpg' },
    { label: "on image", src: './image/img5.jpg' },
    { label: "when we scroll", src: './image/img6.jpg' },
    { label: "the window", src: './image/img7.jpg' },
]

const scrollerWrapper = document.getElementById("image-GLSL-scroller-container")
const imagescroller = document.getElementById("images-GLSL-tracks")

let renderer, camera, scene, mesh;
let textures = [];
let currentIndex = 0;
let targetIndex = 0;
let isTransitioning = false;

const lenis = new Lenis();
lenis.on("scroll", () => {
    ScrollTrigger.update();
});

const vertexShader = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

// Naya Water Drop Fragment Shader
const fragmentShader = `                     
uniform sampler2D u_texture0;
uniform sampler2D u_texture1;
uniform float u_progress;
uniform vec2 u_resolution;
uniform vec2 u_textureResolution0;
uniform vec2 u_textureResolution1;

varying vec2 vUv;

vec2 coverUV(vec2 uv, vec2 planeRes, vec2 texRes) {
    float scale = max(planeRes.x / texRes.x, planeRes.y / texRes.y);
    vec2 newSize = texRes * scale;
    return uv * (planeRes / newSize) + (newSize - planeRes) / 2.0 / newSize;
}

void main() {
    vec2 center = vec2(0.5);
    vec2 p = vUv - center;
    
    // Aspect ratio theek karne ke liye (Taki wave round rahe)
    p.x *= u_resolution.x / u_resolution.y; 
    float dist = length(p);

    // Water Drop Ripple Math
    float amplitude = 0.05;  // Ripple strength
    float frequency = 40.0;  // Number of waves
    float speed = 10.0;      // Wave speed
    
    float currentRadius = u_progress * 1.5; 
    
    // Sirf radius border par wave dikhane ke liye mask
    float waveMask = smoothstep(0.0, 0.2, currentRadius - dist) * smoothstep(0.0, 0.2, dist - (currentRadius - 0.3));
    
    // Sine wave calculation
    float wave = sin(dist * frequency - u_progress * speed) * waveMask;

    // Direction from center
    vec2 dir = normalize(vUv - center);
    if (dist == 0.0) dir = vec2(0.0);

    // Add wave offset
    vec2 offset = dir * wave * amplitude;
    
    // Cover UVs
    vec2 uv0 = coverUV(vUv, u_resolution, u_textureResolution0);
    vec2 uv1 = coverUV(vUv, u_resolution, u_textureResolution1);

    // Apply distortion and sample textures
    vec4 tex0 = texture2D(u_texture0, uv0 + offset);
    vec4 tex1 = texture2D(u_texture1, uv1 + offset);

    // Blend between old and new texture outwards like a circle
    float mixFactor = smoothstep(currentRadius + 0.05, currentRadius - 0.05, dist);

    gl_FragColor = mix(tex0, tex1, mixFactor);
}
`

function loadTexture(src) {
    return new Promise((resolve, reject) => {
        new THREE.TextureLoader().load(
            src,
            (texture) => {
                texture.wrapS = THREE.RepeatWrapping;
                texture.wrapT = THREE.RepeatWrapping;
                texture.minFilter = THREE.LinearFilter;
                resolve(texture);
            },
            undefined,
            reject
        );
    });
}

function setTextureResolution(material, index, textureObj) {
    if (textureObj && textureObj.image) {
        material.uniforms[`u_textureResolution${index}`].value.set(
            textureObj.image.width,
            textureObj.image.height
        );
    }
}

function transitionTo(index) {
    if (index < 0 || index >= textures.length || index === currentIndex || isTransitioning) {
        targetIndex = index;
        return;
    }
    targetIndex = index;
    isTransitioning = true;

    const material = mesh.material;
    material.uniforms.u_texture1.value = textures[index];
    setTextureResolution(material, 1, textures[index]);

    gsap.to(material.uniforms.u_progress, {
        value: 1,
        duration: 1,
        ease: "power3.inOut", // smooth wave ke liye thoda change kiya hai
        onComplete: () => {
            material.uniforms.u_texture0.value = textures[index];
            setTextureResolution(material, 0, textures[index]);
            material.uniforms.u_progress.value = 0;
            currentIndex = index;
            isTransitioning = false;
            if (targetIndex !== currentIndex) {
                transitionTo(targetIndex);
            }
        }
    });
}

async function init() {
    if (!imagescroller) return;

    const overlay = document.createElement("div");
    overlay.classList.add("gl");

    sections.forEach(({ label }) => {
        const inner = document.createElement("div");
        inner.classList.add("gl-inner");
        inner.innerHTML = `<p>${label.toUpperCase()}</p>`;
        overlay.appendChild(inner);
    });

    scrollerWrapper.appendChild(overlay);
    scrollerWrapper.style.height = `${sections.length * 100}vh`;

    const { clientWidth: width, clientHeight: height } = imagescroller;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    imagescroller.appendChild(renderer.domElement);

    camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 0.1, 100);
    camera.position.z = 10;
    scene = new THREE.Scene();

    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.ShaderMaterial({
        uniforms: {
            u_texture0: { value: null },
            u_texture1: { value: null },
            u_progress: { value: 0 },
            u_resolution: { value: new THREE.Vector2(width, height) },
            u_textureResolution0: { value: new THREE.Vector2(1, 1) },
            u_textureResolution1: { value: new THREE.Vector2(1, 1) }
        },
        vertexShader,
        fragmentShader,
        transparent: true
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    try {
        // Ab extra displacement texture load karne ki zaroorat nahi hai
        const loadedTextures = await Promise.all(sections.map(section => loadTexture(section.src)));

        textures = loadedTextures;

        // Pre-warm all textures to GPU to prevent first-time transition jitter
        textures.forEach(texture => {
            renderer.initTexture(texture);
        });

        const mat = mesh.material;
        mat.uniforms.u_texture0.value = textures[0];
        mat.uniforms.u_texture1.value = textures[0];

        setTextureResolution(mat, 0, textures[0]);
        setTextureResolution(mat, 1, textures[0]);

        ScrollTrigger.create({
            trigger: scrollerWrapper,
            start: "top top",
            end: `+=${(textures.length - 1) * 100}%`,
            scrub: true,
            onUpdate: (self) => {
                const newIndex = Math.round(self.progress * (textures.length - 1));
                transitionTo(newIndex);
            }
        });

    } catch (error) {
        console.error("Initialization error:", error);
    }
}

function render(time) {
    lenis.raf(time);

    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
    requestAnimationFrame(render);
}

function onResize() {
    if (!imagescroller || !renderer || !camera || !mesh) return;
    const { clientWidth: width, clientHeight: height } = imagescroller;

    renderer.setSize(width, height);

    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();

    mesh.geometry.dispose();
    mesh.geometry = new THREE.PlaneGeometry(width, height);
    mesh.material.uniforms.u_resolution.value.set(width, height);

    if (textures[currentIndex]) {
        setTextureResolution(mesh.material, 0, textures[currentIndex]);
    }
    if (textures[targetIndex]) {
        setTextureResolution(mesh.material, 1, textures[targetIndex]);
    }

    ScrollTrigger.update();
}

init();
requestAnimationFrame(render);
window.addEventListener('resize', onResize);