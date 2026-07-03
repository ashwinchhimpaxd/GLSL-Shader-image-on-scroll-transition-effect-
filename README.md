# 3D Scrolling Image Distortion Effect 🌊✨

An interactive 3D scroll-driven transition website using **Three.js**, **GLSL Shaders**, **GSAP (ScrollTrigger)**, and **Lenis (Smooth Scroll)**. The website features stunning liquid displacement and water drop ripple distortion transitions when scrolling between sections.

---

## Features 🚀

- **WebGL Image Slider**: An interactive fullscreen WebGL canvas rendering image quads with custom shaders.
- **Water Drop Ripple Effect**: A realistic concentric ripple distortion that sweeps outward as sections change.
- **Liquid & RGB Shift Distortion**: High-quality organic displacement matching custom distortion maps with chromatic aberration.
- **GPU Texture Pre-Warming**: Optimized texture initialization preventing any first-time scroll transitions stutter/lag.
- **Dynamic Cover UVs**: Custom GLSL UV-mapping algorithm that calculates aspect ratios dynamically to mimic CSS `object-fit: cover` perfectly.
- **Smooth Custom Scrolling**: Integrated with Lenis and GSAP ScrollTrigger.
- **Premium Typography**: Custom headers and overlays utilizing modern web fonts ("Jersey 10").

---

## Tech Stack 🛠️

- **Core**: HTML5, Vanilla CSS3, Javascript (ES6+)
- **3D Graphics**: [Three.js](https://threejs.org/)
- **Animation**: [GSAP (GreenSock)](https://greensock.com/) & [ScrollTrigger](https://greensock.com/scrolltrigger/)
- **Smooth Scroll**: [Lenis](https://lenis.darkroom.engineering/)
- **Build Tool**: [Vite](https://vitejs.dev/)

---

## Setup & Local Development 💻

Follow these instructions to run the project locally on your machine:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ashwinchhimpaxd/GLSL-Shader-image-on-scroll-transition-effect-.git
   cd GLSL-Shader-image-on-scroll-transition-effect-
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the local address (default: `http://localhost:5173`).

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## Customizing Shader Transitions 🎨

You can choose between the two pre-built transitions in `index.html`:

- **Liquid Displacement with RGB Shift**:
  ```html
  <!-- <script type="module" src="/src/LiquidDisplacementRGBShifterTransition.js"></script> -->
  ```
- **Water Drop Ripple Wave Effect (Default)**:
  ```html
  <script type="module" src="/src/WaterDropWaveImageEffecetTransition.js"></script>
  ```

---

## License 📄

This project is open-source and available under the **MIT License**.