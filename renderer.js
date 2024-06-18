// To-DO:
// - Add emotional state and animation control
// - Sounds
// - Enable on startup
// - Custom settings on tray -- Maybe control panel? -- Saving preferences
// - Customizable Model and Frame

const THREE = require('three');
const { FBXLoader, OrbitControls } = require('three-stdlib');


// Set up the AnimationMixer
let mixer;
const clock = new THREE.Clock();

// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(
  5,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const targetPosition = new THREE.Vector3(29.4, 3.921, 15.898);
const targetRotation = new THREE.Quaternion(0.8606, -0.0329, 0.5077, 0.01944);

camera.position.copy(targetPosition);
camera.quaternion.copy(targetRotation);

// Create renderer
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('three-canvas'), alpha: true });
renderer.setSize(window.innerHeight - 5, window.innerHeight - 5);
renderer.setClearColor(0x4b6513, 0.85);

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true;
controls.enablePan = true;
controls.enableZoom = false;
controls.update();
controls.target.set(0.8, 1.4, 0)

addModel();
drawBoxFrame();
animate();

// Animation loop
function animate() {
  requestAnimationFrame(animate);
    if (mixer) {
        mixer.update(clock.getDelta());
    }

  // Render the scene
  controls.update();
  //console.log(camera);
  renderer.render(scene, camera);
}

function addModel(){
  // Load the FBX model
  const fbxLoader = new FBXLoader();
  fbxLoader.load(
    './assets/DrillyModel.fbx',
    (object) => {
        mixer = new THREE.AnimationMixer(object);
        
        object.traverse((child) => {
            if (child.isMesh) {
                const oldMat = child.material;
                child.material = mat();
            }
        });

        // Extract and play animations
        if (object.animations && object.animations.length > 0) {
            const action = mixer.clipAction(object.animations[0]);
            action.setLoop(THREE.LoopRepeat);
            action.timeScale = 0.1;
            action.play();
            console.log(action);
        }

        scene.add(object);
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    (error) => {
        console.log(error);
    }
  );
}

function mat(){
      var vertexShader = `
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

    var fragmentShader = `
        varying vec3 vColor;

        void main() {
            gl_FragColor = vec4(vColor, 1.0);
        }
    `;

    var material;
    material = new THREE.ShaderMaterial({
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      vertexColors: true,
      skinning: true
    });

    //material = new THREE.MeshBasicMaterial();
    return material; 
}

function drawBoxFrame() {
  var min = Math.min(window.innerHeight, window.innerWidth);
  
  var frame = document.createElement('div')
  frame.style.width = "100%"
  frame.style.height = "100%"
  frame.style.position = "absolute"
  frame.style.left = 0
  frame.style.top = 0
  frame.style.webkitAppRegion = "drag"
  frame.style.overflow = "hidden";
  frame.style.pointerEvents = "none";
  
  var svgMarkup = `<img id="frame" src="./assets/frame.svg" style="width:` + min + 'px' + `; height:` + min + 'px' + `; position:absolute;" />`;
  
  // Set the SVG as the innerHTML of the div
  frame.innerHTML = svgMarkup;
  
  // Create the inner non-draggable area
  var innerArea = document.createElement('div');
  innerArea.style.position = "absolute";
  innerArea.style.left = "10%"; // Adjust based on your SVG frame design
  innerArea.style.top = "10%"; // Adjust based on your SVG frame design
  innerArea.style.width = "calc(70%)"; // Adjust based on your SVG frame design
  innerArea.style.height = "calc(70%)"; // Adjust based on your SVG frame design
  innerArea.style.webkitAppRegion = "no-drag"; // Make the inner area non-draggable
  innerArea.style.pointerEvents = "none";
  
  frame.appendChild(innerArea);

  
  document.body.appendChild(renderer.domElement);
  document.body.appendChild(frame);
  document.getElementById("frame").style.width = min + 'px';
  document.getElementById("frame").style.height = min + 'px';
}

window.addEventListener('resize', () => {
  //console.log(window.innerHeight);
  var min = Math.min(window.innerHeight, window.innerWidth);
  document.getElementById("frame").style.width = min + 'px';
  document.getElementById("frame").style.height = min + 'px';
  renderer.setSize(min - 5, min - 5);
  });

// Add event listeners for controls
controls.addEventListener('start', () => {
  userIsInteracting = true;
  shouldReturnToView = false;
});

controls.addEventListener('end', () => {
  userIsInteracting = false;
  shouldReturnToView = true;
});
