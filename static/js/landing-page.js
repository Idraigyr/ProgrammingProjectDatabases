
let scene, camera, renderer;
let planet;


var img = new Image();
img.src = "background.jpg";

init();
animate();


function init() {
    // Set up scene
    scene = new THREE.Scene();

    // Set up camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 4;
    camera.position.y = 0.5;

    // Set up renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Load planet model
    const loader = new THREE.GLTFLoader();
    loader.load('./planet.glb', (gltf) => {
        planet = gltf.scene;
        scene.add(planet);
        planet.rotation.x += 0.5
        planet.position.y -= 1;
    });

    // Add directional light
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 5);
    directionalLight1.position.set(1, 1, 1).normalize();
    scene.add(directionalLight1);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(-1, -1, -1).normalize();
    scene.add(directionalLight2);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(ambientLight);

    const texture = new THREE.TextureLoader().load( "background.jpg" );
    scene.background = texture;

    scaleBackground();
}

function scaleBackground(){
    if(!scene.background) return;
    const targetAspect = window.innerWidth / window.innerHeight;
    const imageAspect = img.width / img.height;
    const factor = imageAspect / targetAspect;
// When factor larger than 1, that means texture 'wilder' than target。
// we should scale texture height to target height and then 'map' the center  of texture to target， and vice versa.
    scene.background.offset.x = factor > 1 ? (1 - 1 / factor) / 2 : 0;
    scene.background.repeat.x = factor > 1 ? 1 / factor : 1;
    scene.background.offset.y = factor > 1 ? 0 : (1 - factor) / 2;
    scene.background.repeat.y = factor > 1 ? 1 : factor;
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate the planet
    if (planet) {
        planet.rotation.y += 0.005; // Adjust the speed of rotation as needed
    }

    // Render the scene
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    scaleBackground();
});