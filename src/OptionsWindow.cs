using Godot;
using System;

public partial class OptionsWindow : Window
{
	public override void _Ready()
	{
		GetWindow().CloseRequested += OnClose;
	}

	public override void _Process(double delta)
	{
		
	}
	
	private void OnClose(){
		GetWindow().Visible = false;
	}

}
