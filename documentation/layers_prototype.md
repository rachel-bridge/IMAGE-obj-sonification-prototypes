# Important notes
This prototype does not exist in the current repo: it is accessible through [this tag](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/releases/tag/layers_prototype).

The sonification strategies in this design were very bad, and I do not recommend them. However, the "layers" idea and the controls might have some merit.


# Concept
Divide an image into "layers" of perspective, from closest to farthest. Alt-text is split between the layers, and assigned to the corresponding one. Users can navigate forwards and backwards within these layers, and vertically within a layer, to play the alt text for it.

e.g. A picture has a clear foreground with grass, midground with trees, and background with a mountain and clouds. 
Navigating to the background plays the alt text "A snow-capped mountain under blue sky with clouds". Within that layer, the first vertical section is "Mountain. \*object sonification for mountain\*", and the second is "Clouds. \*object sonification for mountain\*".


# Features used:
- Pitch to outline the shape of a region (*this one has been lovingly nicknamed the "slide whistle" prototype...*)
- Volume to depict texture (e.g. rapidly changing volume for fluffy clouds)
- Left-right spatialization: show horizontal extent of a region within a "layer"


# Usage
Check out the tag, linked at top, for the code. Execute the `prototype.py` script, follow spoken instructions.

Controls (repeated in instructions):
- `upArrow` to move "deeper" (farther from yourself) by one layer
- `downArrow` to move "closer" to yourself by one layer
- `shift+upArrow` & `shift+downArrow` to move vertically within the current layer.