using Godot;

public partial class MainWindowController : Node
{
    public enum Corner
    {
        BotLeft,
        BotRight,
        TopLeft,
        TopRight
    }

    public static MainWindowController Instance;

    public bool snappingEnabled = true;

    private int currentScreen => GetWindow().CurrentScreen;
    private Vector2 windowSize => GetWindow().Size;
    private Vector2I availableScreen => DisplayServer.ScreenGetUsableRect(currentScreen).Abs().Size;
    public Vector2 NormalizedWindowPosition => (GetWindow().Position - DisplayServer.ScreenGetPosition(currentScreen)) / availableScreen;

    public override void _Ready()
    {
        if (Instance == null)
        {
            Instance = this;
        }

        ResizeWindow(0.167f);
        SnapToCorner(Corner.BotLeft);
    }

    public void UpdatePosition(Vector2 position)
    {
        if (!snappingEnabled)
        {
            return;
        }

        Vector2 relativePos = position - DisplayServer.ScreenGetPosition(currentScreen);
        relativePos /= DisplayServer.ScreenGetSize(currentScreen);
        PositionWindow(relativePos.Round());
    }

    public void ResizeWindow(float size)
    {
        int newSize = (int)(size * availableScreen.Y);
        GetWindow().Size = new Vector2I(newSize, newSize);
    }

    public void PositionWindow(Vector2 position)
    {
        Vector2I newPosition = (Vector2I)((availableScreen - GetWindow().Size) * position);
        GetWindow().Position = newPosition + DisplayServer.ScreenGetPosition(currentScreen);
    }

    public void SnapToCorner(Corner corner)
    {
        switch (corner)
        {
            case Corner.BotLeft:
                PositionWindow(new Vector2(0, 1));
                break;
            case Corner.BotRight:
                PositionWindow(new Vector2(1, 1));
                break;
            case Corner.TopLeft:
                PositionWindow(new Vector2(0, 0));
                break;
            case Corner.TopRight:
                PositionWindow(new Vector2(1, 0));
                break;
        }
    }
}