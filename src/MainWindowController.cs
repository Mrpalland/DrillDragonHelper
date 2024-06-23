using Godot;
using System;

public partial class MainWindowController : Node
{
	
	public enum Corner {
		botLeft,
		botRight,
		topLeft,
		topRight
	}

	public static MainWindowController Instance;

	public bool snappingEnabled = true;

	private int currentScreen => GetWindow().CurrentScreen;

	private Vector2 windowSize => GetWindow().Size;
	
	private Vector2I availableScreen =>  DisplayServer.ScreenGetUsableRect(currentScreen).Abs().Size;

	public Vector2 normalizedWindowPosition => (GetWindow().Position - DisplayServer.ScreenGetPosition(0))/availableScreen;
	public override void _Ready()
	{
		if(Instance == null){
			Instance = this;
		}

		ResizeWindow(0.167f);
		SnapToCorner(Corner.botLeft);
	}

	// Called every frame. 'delta' is the elapsed time since the previous frame.
	public override void _Process(double delta)
	{
		//GD.Print(GetWindow().Position - DisplayServer.ScreenGetPosition(0));
		
	}

	public void UpdatePosition(Vector2 position){
		if(!snappingEnabled){
			return;
		}

		Vector2 relativePos = position - DisplayServer.ScreenGetPosition(currentScreen);
		relativePos /= DisplayServer.ScreenGetSize(currentScreen);
		PositionWindow(relativePos.Round());

	}

	public void ResizeWindow(float size){
		int newSize = (int)(size * availableScreen.Y);
		GetWindow().Size = new Vector2I(newSize, newSize);
	}

	public void PositionWindow(Vector2 position){
		Vector2I newPosition = (Vector2I)((Vector2)(availableScreen - GetWindow().Size) * position);

		GetWindow().Position = newPosition + DisplayServer.ScreenGetPosition(currentScreen);
	}

	public void SnapToCorner(Corner corner){
		switch (corner)
		{
			case Corner.botLeft: 
				PositionWindow(new Vector2(0,1));
			break;
			case Corner.botRight: 
				PositionWindow(new Vector2(1,1));
			break;
			case Corner.topLeft: 
				PositionWindow(new Vector2(0,0));
			break;
			case Corner.topRight: 
				PositionWindow(new Vector2(1,0));
			break;
		}
	}
}
