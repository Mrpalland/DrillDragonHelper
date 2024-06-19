const { Clock, AnimationMixer } = require('three');

class Helper {
  constructor() {
    this.clock = new Clock();
    this.mixer = null;
    this.animations = {};
    this.states = this.createStates();
    this.currentState = 'idleState';
    this.currentAction = null;
    this.currentActionName = "Idle";
    this.stateStartTime = this.clock.getElapsedTime();
  }

  setMixerAndAnimations(mixer, animations) {
    this.mixer = mixer;
    this.animations = animations;
  }

  setStates(states) {
    this.states = states;
  }

  update() {
    
    if (this.mixer) {
      this.mixer.update(this.clock.getDelta());
    }
    
    const elapsedTime = this.clock.getElapsedTime();
    const currentStateObj = this.states[this.currentState];
    if(!currentStateObj){
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

  playAnimation(animationName, fade = 0.1, loop = THREE.LoopRepeat) {
    var clip = THREE.AnimationClip.findByName(this.animations, animationName);
    if (clip && this.currentActionName != animationName) {
      const action = this.mixer.clipAction(clip);

      // Check if there's a currently playing action and fade it out
      if (this.currentAction) {
        this.currentAction.fadeOut(fade);
      }

      action.reset();
      action.fadeIn(fade);
      action.setLoop(loop);
      action.play();

      // Set the current action to the new action
      this.currentAction = action;
      this.currentActionName = animationName;
    } else {
      console.log("No animation with the name " + animationName + " found. Or it is already Playing.");
    }
  }

  createStates() {
    return {
      idleState: {
        duration: 5,
        onEnter: () => {
          this.playAnimation('Idle');
        },
        nextState: () => Math.random() < 0.5 ? 'talkState' : 'idleState'
      },
      talkState: {
        duration: 3,
        onEnter: () => this.playAnimation('Talk'),
        nextState: () => 'idleState'
      },
      random2: {
        duration: 3,
        onEnter: () => this.playAnimation('RandomAnimation2'),
        nextState: () => 'idle'
      }
    };
  }
}

// Define states and transitions
const createStates = (helper) => ({
  idle: {
    duration: 5,
    onEnter: () => helper.playAnimation('Idle'),
    nextState: () => Math.random() < 0.5 ? 'random1' : 'random2'
  },
  random1: {
    duration: 3,
    onEnter: () => helper.playAnimation('RandomAnimation1'),
    nextState: () => 'idle'
  },
  random2: {
    duration: 3,
    onEnter: () => helper.playAnimation('RandomAnimation2'),
    nextState: () => 'idle'
  }
});

module.exports = { Helper, createStates };