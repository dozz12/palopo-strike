import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;
let dummy;
let raycaster = new THREE.Raycaster();
let pointer = new THREE.Vector2();
let score = 0;

const scoreDisplay = document.getElementById('score');
const shootBtn = document.getElementById('shootBtn');

let joystick, moveDirection = { x: 0, y: 0 };

init();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 5);

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game') });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 10, 10);
  scene.add(light);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshStandardMaterial({ color: 0x444444 }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  dummy = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.5), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
  dummy.position.set(0, 1, -5);
  scene.add(dummy);

  const loader = new GLTFLoader();
  loader.load('models/pistol.glb', (gltf) => {
    const gun = gltf.scene;
    gun.scale.set(0.5, 0.5, 0.5);
    gun.position.set(0.2, -0.2, -1);
    gun.rotation.y = Math.PI;
    camera.add(gun);
  }, undefined, function (error) {
    console.error('Error loading model:', error);
  });

  scene.add(camera);

  const joystickZone = document.getElementById('joystick-zone');
  joystick = nipplejs.create({ zone: joystickZone, mode: 'static', position: { left: '60px', bottom: '60px' }, color: 'white' });
  joystick.on('move', (evt, data) => {
    moveDirection.x = data.vector.x;
    moveDirection.y = data.vector.y;
  });
  joystick.on('end', () => moveDirection = { x: 0, y: 0 });

  window.addEventListener('click', shoot);
  shootBtn.addEventListener('touchstart', shoot);

  animate();
}

function shoot() {
  raycaster.setFromCamera({ x: 0, y: 0 }, camera);
  const intersects = raycaster.intersectObject(dummy);

  if (intersects.length > 0) {
    score++;
    scoreDisplay.innerText = `Target Kena: ${score}`;
    dummy.position.x = (Math.random() - 0.5) * 10;
    dummy.position.z = -5 - Math.random() * 5;
  }
}

function animate() {
  requestAnimationFrame(animate);

  const speed = 0.05;
  const forward = new THREE.Vector3();
  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0));

  camera.position.add(forward.clone().multiplyScalar(moveDirection.y * speed));
  camera.position.add(right.clone().multiplyScalar(moveDirection.x * speed));

  renderer.render(scene, camera);
}
