using Godot;
using System;
using System.Runtime.CompilerServices;

public partial class OptionsWindow : Window
{
	public override void _Ready()
	{
		GetWindow().CloseRequested += OnClose;
	}

	public void VisibilityChanged()
	{
		if(Helper.Instance == null)
			return;

		if(Visible){
			Helper.Instance.Transition("scaredState");
		} else {
			Helper.Instance.Transition("reliefState");
		}

		//Maybe cursed?
		if(DisplayServer.GetScreenCount() > 1){
			Frame frame = GetParent<Control>() as Frame;
			frame.SetMovable(!Visible);
		}
	}
	
	private void OnClose()
	{
		GetWindow().Visible = false;
	}

}
