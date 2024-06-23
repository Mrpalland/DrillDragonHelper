using Godot;
using System;

public partial class OptionsMenu : Control
{

	public override void _Ready()
    {

    }

    public override void _Process(double delta)
    {

    }

	public void SoundsCheck(bool sounds){
		Helper.Instance.mute = !sounds;
	}

	public void SnappingCheck(bool snapping){
		MainWindowController.Instance.snappingEnabled = snapping;
	}

	public void SetHelperSize(int size){
		switch(size){
			case 0:
				MainWindowController.Instance.ResizeWindow(0.08f);
			break;
			case 1:
				MainWindowController.Instance.ResizeWindow(0.167f);
			break;
			case 2:
				MainWindowController.Instance.ResizeWindow(0.25f);
			break;
			case 3:
				MainWindowController.Instance.ResizeWindow(0.45f);
			break;
			case 4:

			break;
		}
	}

	public void ResetWindow(){
		MainWindowController.Instance.ResizeWindow(0.167f);
		MainWindowController.Instance.SnapToCorner(MainWindowController.Corner.botLeft);
	}

	public void QuitApp(){
		GetTree().Quit();
	}
	
}
