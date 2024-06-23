using Godot;
using System;

public partial class CameraRig : Node3D
{
    [Export] public float RotationSpeed = 0.1f; // Speed of rotation
    [Export] public float Dampening = 0.25f; // Dampening amount
    [Export] public Vector2 RotationLimit = new Vector2(20, 20); // Limit of rotation in degrees

    private Vector3 originalRotation;
    private Vector3 targetRotation;
    private bool dragging = false;

    public override void _Ready()
    {
        // Save the initial rotation as the original position
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

            // Clamp the rotation
            targetRotation.X = Mathf.Clamp(targetRotation.X, -RotationLimit.X, RotationLimit.X);
            targetRotation.Y = Mathf.Clamp(targetRotation.Y, -RotationLimit.Y, RotationLimit.Y);
        }
    }

    public override void _Process(double delta)
    {
        if (!dragging)
        {
            // Return to the original rotation when not dragging
            targetRotation = originalRotation;
        }

        // Apply dampening to smooth the rotation
        RotationDegrees = RotationDegrees.Lerp(targetRotation, Dampening);
    }
}