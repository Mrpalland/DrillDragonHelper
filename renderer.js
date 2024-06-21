// ----------------------------
// Evan Nave 2024
// Concept and designs by Floombo
// ----------------------------
// To-DO:
// ✔ Sample IPC
// ✔ Cleanup
// ✔ Add emotional state and animation control
// ✔ Sounds
// ✔ Cleanup
// - Custom settings on tray -- Maybe control panel? -- Saving preferences
// - Enable on startup
// - Customizable Model and Frame

const { ipcRenderer } = require('electron');
const THREE = require('three');
const { FBXLoader, OrbitControls } = require('three-stdlib');
const { Helper} = require('./helper.js');

// Globals
const helper = new Helper();
let mixer;
let userIsInteracting = false;
let shouldReturnToView = false;
const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(5, window.innerWidth / window.innerHeight, 0.1, 1000);
const listener = new THREE.AudioListener();
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas'), alpha: true }); //Needs alpha for see-through effect
const controls = new OrbitControls(camera, renderer.domElement);
const targetCameraPosition = new THREE.Vector3(29.26, -0.7534, 16.2068);
const targetCameraRotation = new THREE.Quaternion(0.8606, -0.0329, 0.5077, 0.01944); //Rotation is handled by orbit controls but is set for initial view.

initScene();

// Main loop
function animate() {
  requestAnimationFrame(animate);
  
  if (shouldReturnToView && !userIsInteracting) {
    camera.position.lerp(targetCameraPosition, 0.1);
    controls.update();

    // Check if the camera is close enough to the target position
    if (camera.position.distanceTo(targetCameraPosition) < 0.01) {
        camera.position.copy(targetCameraPosition);
        shouldReturnToView = false;
    }
    } else {
        controls.update();
    }

  helper.update();
  renderer.render(scene, camera);
}

function initScene() {
  camera.position.copy(targetCameraPosition);
  camera.quaternion.copy(targetCameraRotation);
  camera.add(listener);

  renderer.setSize(window.innerHeight - 5, window.innerHeight - 5);
  renderer.setClearColor(0x4b6513, 0.85);

  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = Math.PI/3; // radians
  controls.maxPolarAngle = Math.PI/1.5; // radians
  controls.maxAzimuthAngle = Math.PI / 2.6;
  controls.minAzimuthAngle = Math.PI / 4.5;
  controls.update();
  controls.target.set(0.7834, 1.40787, 0.0415);

  helper.listener = listener;
  
  addModel();
  helper.start();
  
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
        var clip = THREE.AnimationClip.findByName(object.animations, "Idle");
        var action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat);
        action.timeScale = 0.25;
        action.play();
      }

      scene.add(object);
      helper.currentAction = action;
      helper.setMixerAndAnimations(mixer, object.animations);
    },
    (xhr) => {
      //console.log(`${(xhr.loaded / xhr.total) * 100}% loaded`);
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
    side: THREE.FrontSide
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

  renderer.domElement.style.userSelect = false;
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
  shouldReturnToView = false;
  helper.onClick();
});

controls.addEventListener('end', () => {
  userIsInteracting = false;
  shouldReturnToView = true;
});

// IPC Listener
ipcRenderer.on('toggle-dark-mode', (event, isDarkMode) => {
  console.log("Dark Mode Toggled");
});

ipcRenderer.on('mute', (event, mute) => {
  helper.mute = mute;
});