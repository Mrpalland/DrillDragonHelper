using Godot;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection.PortableExecutable;
using System.Runtime.InteropServices;

public partial class Helper : Node
{
    public static Helper Instance;
    
    private AnimationPlayer animationPlayer;
    private AudioStreamPlayer audioPlayer;
    private Dictionary<string, State> states;
    private string currentState = "idleState";
    private string currentActionName = "Idle";
    private float stateStartTime;
    private string soundPathReactions = "res://assets/sounds/reactions/";
    private string soundPathRandom = "res://assets/sounds/random";
    private List<string> randomSounds = new List<string>();
    private double clock;

    public bool mute = false;

    public override void _Ready()
    {
        if(Instance == null){
            Instance = this;
        }

        animationPlayer = GetNode<AnimationPlayer>("AnimationPlayer");
        audioPlayer = GetNode<AudioStreamPlayer>("AudioStreamPlayer");
        states = CreateStates();
        currentState = "idleState";
        currentActionName = "none";
        stateStartTime = 0;
        GetRandomSounds();
        Start();
    }

    public override void _Process(double delta)
    {
        clock += delta;

        if (states.ContainsKey(currentState))
        {
            var currentStateObj = states[currentState];
            if (clock - stateStartTime > currentStateObj.duration)
            {
                Transition(currentStateObj.NextState());
            }
        }
    }

    private void Start()
    {
        PlaySound("res://assets/sounds/reactions/Drilly_Hi2.mp3");
        PlayAnimation("Idle", 0.25f);
    }

    public void Transition(string newState)
    {
        currentState = newState;
        stateStartTime = (float)clock;
        states[newState].OnEnter();
    }

    private void PlayAnimation(string animationName, float speed = 1.0f, float fade = -1.0f, bool loop = true)
    {
        if (currentActionName != animationName)
        {
            animationPlayer.Play(animationName, fade, speed);
            currentActionName = animationName;
        }
        else
        {
            GD.Print($"No animation with the name {animationName} found. Or is already playing.");
        }
    }

    private void PlaySound(string soundPath)
    {
        if (!mute)
        {
            var audioStream = GD.Load<AudioStream>(soundPath);//ResourceLoader.Load<AudioStream>(soundPath);//
            audioPlayer.Stream = audioStream;
            audioPlayer.Play();
        }
    }

    public void PlayRandomSound()
    {
        if (randomSounds.Count > 0)
        {
            var random = new Random();
            int index = random.Next(randomSounds.Count);
            PlaySound(randomSounds[index]);
        }
        else
        {
            GD.PrintErr("No random sounds found!");
        }
    }

    public void PlaySadSound(){
        PlaySound(soundPathReactions + "Drilly_Sad.mp3");
    }

    private void GetRandomSounds()
    {
		if(!DirAccess.DirExistsAbsolute(soundPathRandom)){
			GD.PrintErr("Sound directory does not exist!");
			return;
		}

        var files = DirAccess.GetFilesAt(soundPathRandom);
		foreach(string fileName in files) {
			string file = fileName.Replace(".import", "");
			if (file.EndsWith(".ogg") || file.EndsWith(".wav") || file.EndsWith(".mp3"))
                {
                    randomSounds.Add(soundPathRandom + "/" + file);
                }
		}
    }

    public override void _Input(InputEvent @event)
    {
		if(Input.IsActionJustPressed("click") && !Frame.overFrame) {
			if (currentState != "danceState")
			{
				PlayRandomSound();
				Transition("danceState");
			}
		}
        base._Input(@event);
    }

    private class State
    {
        public float duration;
        public Action OnEnter;
        public Func<string> NextState;
    }

private Dictionary<string, State> CreateStates()
{
    return new Dictionary<string, State>
    {
        {
            "idleState", new State
            {
                duration = 120f,
                OnEnter = () =>
                {
                    PlayAnimation("Idle", 0.25f);
                },
                NextState = () =>
                {
                    return new Random().NextDouble() < 0.15 ? "idleState" : "talkState";
                }
            }
        },
        {
            "talkState", new State
            {
                duration = 1f,
                OnEnter = () =>
                {
                    PlayAnimation("Talk");
                    PlayRandomSound();
                },
                NextState = () => "idleState"
            }
        },
        {
            "danceState", new State
            {
                duration = 3f,
                OnEnter = () =>
                {
                    PlayAnimation("Dance");
                },
                NextState = () => "idleState"
            }
        },
        {
            "shiftyState", new State
            {
                duration = 1f,
                OnEnter = () =>
                {
                    PlayAnimation("Shifty");
                },
                NextState = () => "idleState"
            }
        },
        {
            "sadState", new State
            {
                duration = 1f,
                OnEnter = () =>
                {
                    PlayAnimation("Sad");
                    PlaySadSound();
                },
                NextState = () => "idleState"
            }
        }
    };
}
}