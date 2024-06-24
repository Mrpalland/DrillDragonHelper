using Godot;
using System;

public partial class Frame : Control
{

	public static bool isMoving = false;

	public static bool overFrame = false;
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

		if(Input.IsActionPressed("click") && isMoving){
			Vector2 newPos = DisplayServer.WindowGetPosition() + ((mousePos - clickPos) * GetWindow().Size);
			DisplayServer.WindowSetPosition(new Vector2I((int)newPos.X, (int)newPos.Y));

			//float helperScale = MainWindowController.Instance.normalizedWindowPosition.X > 0.5 ? -1 : 1; 
			//Helper.Instance.parent.Scale = new Vector3(helperScale,1,1);
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
		} else {
			GD.Print("Couldn't find Options Window");
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