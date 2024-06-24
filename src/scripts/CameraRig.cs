using Godot;
using System;

public partial class CameraRig : Node3D
{
    [Export] public float RotationSpeed = 0.1f;
    [Export] public float Dampening = 0.25f;
    [Export] public Vector2 RotationLimit = new Vector2(20, 20); // In degrees

    private Vector3 originalRotation;
    private Vector3 targetRotation;
    private bool dragging = false;

    public override void _Ready()
    {
        originalRotation = RotationDegrees;
        targetRotation = originalRotation;
    }

    public override void _Input(InputEvent @event)
    {
		dragging = Input.IsActionPressed("click") && !Frame.isMoving;

        if (@event is InputEventMouseMotion mouseMotion && dragging)
        {
            Vector3 rotationChange = new Vector3(-mouseMotion.Relative.Y, -mouseMotion.Relative.X, 0) * RotationSpeed;
            targetRotation += rotationChange;

            targetRotation.X = Mathf.Clamp(targetRotation.X, -RotationLimit.X, RotationLimit.X);
            targetRotation.Y = Mathf.Clamp(targetRotation.Y, -RotationLimit.Y, RotationLimit.Y);
        }
    }

    public override void _Process(double delta)
    {
        if (!dragging)
        {
            targetRotation = originalRotation;
        }

        RotationDegrees = RotationDegrees.Lerp(targetRotation, Dampening);
    }
}