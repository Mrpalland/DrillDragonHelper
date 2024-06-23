extends Node3D

var click_pos = Vector2.ZERO

# Called when the node enters the scene tree for the first time.
func _ready():
	setPanel()

func setPanel():
	get_tree().get_root().set_transparent_background(true)
