using Godot;
using System;
using System.Collections.Generic;

public partial class Frame : Control
{

	public static bool isMoving = false;
	public static bool overFrame = false;
	public static bool canMove = true;

	private Vector2 clickPos = Vector2.Zero;
	private Vector2 mousePos => GetGlobalMousePosition() / GetWindow().ContentScaleSize;
	private Window optionsWindow;

    public override void _Ready()
    {
		optionsWindow = (Window)FindChild("OptionsWindow");

		if(optionsWindow != null){
			optionsWindow.Visible = false;
		}
    }

    public override void _Process(double delta)
    {
		if(Input.IsActionJustPressed("click") && overFrame){
			isMoving = true;
			clickPos = mousePos;
		}

		if((Input.IsActionJustPressed("right-click") && overFrame) || Input.IsActionJustPressed("options")){
			ShowOptions();
		}

		if(Input.IsActionPressed("click") && isMoving && canMove){
			Vector2 newPos = DisplayServer.WindowGetPosition() + ((mousePos - clickPos) * GetWindow().Size);
			DisplayServer.WindowSetPosition(new Vector2I((int)newPos.X, (int)newPos.Y));
		}

		if(Input.IsActionJustReleased("click")){
			isMoving = false;
			MainWindowController.Instance.UpdatePosition(GetWindow().Position);
		}

        base._Process(delta);
    }
	
	private void ShowOptions(){
		if(optionsWindow != null){
			optionsWindow.Visible = !optionsWindow.Visible;
			SetMovable(!optionsWindow.Visible);
		} else {
			GD.Print("Couldn't find Options Window");
		}
	}

	private void SetMovable(bool moveable){
		canMove = moveable;

		List<Button> buttonList = new List<Button>();

        foreach (Node child in GetChildren())
        {
            if (child is Button button)
            {
                buttonList.Add(button);
				button.MouseDefaultCursorShape = moveable ? CursorShape.Drag : CursorShape.Forbidden;
            }
        }
	}

    public void _MouseEnter()
    {
		overFrame = true;
    }

    public void _MouseExit()
    {
		overFrame = false;
    }
}