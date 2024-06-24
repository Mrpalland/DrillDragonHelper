using Godot;

public partial class OptionsMenu : Control
{
	public void SoundsCheck(bool sounds){
		if(!sounds)
			Helper.Instance.PlaySadSound();

		Helper.Instance.mute = !sounds;

		string state = sounds ? "danceState" : "sadState";
		Helper.Instance.Transition(state);
		Helper.Instance.PlayRandomSound();
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
				// Blank for custom size settings later
			break;
		}
	}

	public void ResetWindow(){
		MainWindowController.Instance.ResizeWindow(0.167f);
		MainWindowController.Instance.SnapToCorner(MainWindowController.Corner.BotLeft);
	}

	public void QuitApp(){
		GetTree().Quit();
	}
	
}
