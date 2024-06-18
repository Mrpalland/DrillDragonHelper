// ----------------------------
// Made By Evan Nave 2024
// Concept and designs by Floombo
// ----------------------------
// To-DO:
// ✔ Sample IPC
// ✔ Cleanup
// - Add emotional state and animation control
// - Sounds
// - Enable on startup
// - Custom settings on tray -- Maybe control panel? -- Saving preferences
// - Dark Mode
// - Customizable Model and Frame

const { ipcRenderer } = require('electron');
const THREE = require('three');
const { FBXLoader, OrbitControls } = require('three-stdlib');

// Globals
let mixer;
const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(5, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas'), alpha: true }); //Needs alpha for see-through effect
const controls = new OrbitControls(camera, renderer.domElement);
const targetCameraPosition = new THREE.Vector3(29.4, 3.921, 15.898);
const targetCameraRotation = new THREE.Quaternion(0.8606, -0.0329, 0.5077, 0.01944); //Rotation is handled by orbit controls but is set for initial view.

initScene();

// Main loop
function animate() {
  requestAnimationFrame(animate);
  if (mixer) {
    mixer.update(clock.getDelta());
  }
  controls.update();
  renderer.render(scene, camera);
}

function initScene() {
  camera.position.copy(targetCameraPosition);
  camera.quaternion.copy(targetCameraRotation);

  renderer.setSize(window.innerHeight - 5, window.innerHeight - 5);
  renderer.setClearColor(0x4b6513, 0.85);

  controls.enableDamping = true;
  controls.enablePan = true;
  controls.enableZoom = false;
  controls.update();
  controls.target.set(0.8, 1.4, 0);

  addModel();
  constructHTML();
  animate();
}

// May add custom model loading in the future
function addModel() {
  const fbxLoader = new FBXLoader();
  fbxLoader.load(
    './assets/DrillyModel.fbx',
    (object) => {
      mixer = new THREE.AnimationMixer(object);

      object.traverse((child) => {
        if (child.isMesh) {
          child.material = createShaderMaterial();
        }
      });

      if (object.animations && object.animations.length > 0) {
        const action = mixer.clipAction(object.animations[0]);
        action.setLoop(THREE.LoopRepeat);
        action.timeScale = 0.1;
        action.play();
      }

      scene.add(object);
    },
    (xhr) => {
      console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
    },
    (error) => {
      console.error(error);
    }
  );
}

// Shader material currently uses vertex colors for model color. 
// Texture support may be added later.
function createShaderMaterial() {
  const vertexShader = `
    #include <skinning_pars_vertex>
    varying vec3 vColor;

    void main() {
      #include <skinbase_vertex>
      #include <begin_vertex>
      #include <skinning_vertex>
      #include <project_vertex>
      vColor = color;
    }
  `;

  const fragmentShader = `
    varying vec3 vColor;

    void main() {
      gl_FragColor = vec4(vColor, 1.0);
    }
  `;

  return new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    vertexColors: true,
    skinning: true
  });
}

// CSS may be refined in the future (css moment)
function constructHTML() {
  const min = Math.min(window.innerHeight, window.innerWidth);

  const frame = document.createElement('div');
  frame.style.width = "100%";
  frame.style.height = "100%";
  frame.style.position = "absolute";
  frame.style.left = 0;
  frame.style.top = 0;
  frame.style.webkitAppRegion = "drag";
  frame.style.overflow = "hidden";
  frame.style.pointerEvents = "none";

  const frameImage = document.createElement('img');
  frameImage.style.left = 0;
  frameImage.style.top = 0;
  frameImage.id = "frame";
  frameImage.src = "./assets/frame.svg";
  frameImage.style.position = "absolute";
  frameImage.style.width = `${min}px`;
  frameImage.style.height = `${min}px`;
  frameImage.style.pointerEvents = "none";

  const noDrag = document.createElement('div');
  noDrag.style.position = "absolute";
  noDrag.style.left = "10%";
  noDrag.style.top = "10%";
  noDrag.style.width = "calc(70%)";
  noDrag.style.height = "calc(70%)";
  noDrag.style.webkitAppRegion = "no-drag";
  noDrag.style.pointerEvents = "none";

  frame.appendChild(frameImage);
  frame.appendChild(noDrag);

  document.body.appendChild(renderer.domElement);
  document.body.appendChild(frame);
  document.getElementById("frame").style.width = `${min}px`;
  document.getElementById("frame").style.height = `${min}px`;
}

// Window resize listener -- user-resizing may be removed
window.addEventListener('resize', () => {
  const min = Math.min(window.innerHeight, window.innerWidth);
  document.getElementById("frame").style.width = `${min}px`;
  document.getElementById("frame").style.height = `${min}px`;
  renderer.setSize(min - 5, min - 5);
});

// Threejs listeners for user interaction
controls.addEventListener('start', () => {
  userIsInteracting = true;
});

controls.addEventListener('end', () => {
  userIsInteracting = false;
});

// IPC Listener
ipcRenderer.on('toggle-dark-mode', (event, isDarkMode) => {
  console.log("Dark Mode Toggled");
});
