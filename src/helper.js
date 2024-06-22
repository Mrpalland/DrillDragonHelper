// ----------------------------
// Evan Nave 2024
// Concept and designs by Floombo
// ----------------------------
const { Clock, AnimationMixer, AnimationClip, LoopRepeat } = require('three');
const { app } = require('electron');
const fs = require('fs');
const path = require('path');

class Helper {
  constructor() {
    this.clock = new Clock();
    this.mixer = null;
    this.listener = null;
    this.animations = {};
    this.states = this.createStates();
    this.currentState = 'idleState';
    this.currentAction = null;
    this.currentActionName = 'Idle';
    this.stateStartTime = this.clock.getElapsedTime();
    this.mute = false;

    this.soundPathRandom = path.join('assets', 'sounds', 'random');
    this.randomSounds = [];
    this.getRandomSounds();
  }

  start() {
    this.playSound(path.join('..', 'assets', 'sounds', 'reactions', 'Drilly_Hi2.mp3'));
  }

  update() {
    if (this.mixer) {
      this.mixer.update(this.clock.getDelta());
    }

    const elapsedTime = this.clock.getElapsedTime();
    const currentStateObj = this.states[this.currentState];
    if (!currentStateObj) {
      return;
    }
    if (elapsedTime - this.stateStartTime > currentStateObj.duration) {
      this.transition(currentStateObj.nextState());
    }
  }

  transition(newState) {
    this.currentState = newState;
    this.stateStartTime = this.clock.getElapsedTime();
    this.states[newState].onEnter();
    console.log(newState);
  }

  playAnimation(animationName, fade = 0.1, loop = LoopRepeat) {
    const clip = AnimationClip.findByName(this.animations, animationName);

    if (clip && this.currentActionName !== animationName) {
      const action = this.mixer.clipAction(clip);

      if (this.currentAction) {
        this.currentAction.fadeOut(fade);
      }

      action.reset();
      action.fadeIn(fade);
      action.setLoop(loop);
      action.play();

      this.currentAction = action;
      this.currentActionName = animationName;
    } else {
      console.log(`No animation with the name ${animationName} found. Or is already playing.`);
    }
  }

  playSound(soundName) {
    if (!this.listener || this.mute) {
      return;
    }

    const sound = new THREE.Audio(this.listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(soundName, function(buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(false);
      sound.setVolume(0.75);
      sound.play();
    });
  }

  playRandomSound() {
    if (this.randomSounds.length > 0) {
      const item = this.randomSounds[Math.floor(Math.random() * this.randomSounds.length)];
      this.playSound(item);
    } else {
      console.error("No random sounds found!");
    }
  }

  getRandomSounds() {
    const dir = this.folderExists('.', 'resources') ? path.join(process.resourcesPath, this.soundPathRandom) : path.join(__dirname, '..', this.soundPathRandom);

    fs.readdir(dir, (err, files) => {
      if (err) {
        console.error(err);
        return;
      }
      this.randomSounds = files.map(file => path.join(dir, file));
    });
  }

  setMixerAndAnimations(mixer, animations) {
    this.mixer = mixer;
    this.animations = animations;
  }

  onClick() {
    if (this.currentState !== 'danceState') {
      this.playRandomSound();
      this.transition('danceState');
    }
  }

  createStates() {
    return {
      idleState: {
        duration: 60,
        onEnter: () => this.playAnimation('Idle', 0.05),
        nextState: () => (Math.random() < 0.15 ? 'idleState' : 'talkState')
      },
      talkState: {
        duration: 1.0,
        onEnter: () => {
          this.playAnimation('Talk');
          this.playRandomSound();
        },
        nextState: () => 'idleState'
      },
      danceState: {
        duration: 3,
        onEnter: () => this.playAnimation('Dance', 0.01),
        nextState: () => 'idleState'
      },
      shiftyState: {
        duration: 1,
        onEnter: () => this.playAnimation('Shifty', 0.001),
        nextState: () => 'idleState'
      }
    };
  }

  folderExists(dir, folderName) {
    try {
      const items = fs.readdirSync(dir);
      return items.some(item => fs.statSync(path.join(dir, item)).isDirectory() && item === folderName);
    } catch (err) {
      console.error('Error reading directory:', err);
      return false;
    }
  }
}

module.exports = { Helper };