import * as THREE from 'three';
import {
    OrbitControls
} from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import earthVertexShader from './shaders/earth/vertex.glsl';
import earthFragmentShader from './shaders/earth/fragment.glsl';

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
};

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 100);
camera.position.set(12, 5, 4);
scene.add(camera);

// Loaders
const textureLoader = new THREE.TextureLoader();
const earthDayTexture = textureLoader.load('./earth/day.jpg');
const earthNightTexture = textureLoader.load('./earth/night.jpg');
const earthCloudsTexture = textureLoader.load('./earth/specularClouds.jpg');

earthDayTexture.colorSpace = THREE.SRGBColorSpace;
earthNightTexture.colorSpace = THREE.SRGBColorSpace;

earthDayTexture.anisotropy = 8;
earthNightTexture.anisotropy = 8;
earthCloudsTexture.anisotropy = 8;

/**
 * Earth
 */
// Mesh
const earthGeometry = new THREE.SphereGeometry(2, 64, 64);
const earthMaterial = new THREE.ShaderMaterial({
    vertexShader: earthVertexShader,
    fragmentShader: earthFragmentShader,
    uniforms:
    {
        uDayTexture: new THREE.Uniform(earthDayTexture),
        uNightTexture: new THREE.Uniform(earthNightTexture),
        uCloudsTexture: new THREE.Uniform(earthCloudsTexture),
        uCloudsIntensity: new THREE.Uniform(0.2),
        uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1))
    }
});
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

/**
 * Sun
 */
const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5);
const sunDirection = new THREE.Vector3();

const debugSun = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.1, 2),
    new THREE.MeshBasicMaterial()
);
scene.add(debugSun);

const updateSun = () => {
    // Sun Direction
    sunDirection.setFromSpherical(sunSpherical);

    // Debug Sun
    debugSun.position
        .copy(sunDirection)
        .multiplyScalar(5)
    ;

    // Uniforms
    earthMaterial.uniforms.uSunDirection.value.copy(sunDirection);
}

updateSun();

const sunGUI = gui.addFolder('Sun');

sunGUI.add(sunSpherical, 'phi')
    .min(0)
    .max(Math.PI)
    .onChange(updateSun)
    .name("Sun PHI")
;
sunGUI.add(sunSpherical, 'theta')
    .min(-Math.PI)
    .max(Math.PI)
    .onChange(updateSun)
    .name("Sun THETA")
;

const cloudsGUI = gui.addFolder('Clouds');

cloudsGUI.add(earthMaterial.uniforms.uCloudsIntensity, 'value')
    .min(0)
    .max(1)
    .step(0.001)
    .name("Clouds Intensity")
;

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2);

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(sizes.pixelRatio);
});

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(sizes.pixelRatio);
renderer.setClearColor('#000011');

console.log(renderer.capabilities.getMaxAnisotropy());

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime();

    earth.rotation.y = elapsedTime * 0.1;

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
