# Description
Sound design prototypes for [IMAGE](https://image.a11y.mcgill.ca/).

There are two groups of prototypes in this repo: "scanning" (`/scan/`) and depth map-based (`/depth_map_designs/`).

Each group of prototypes uses only one image so far: they can be found in the directory for that group, under the `photos/` subdirectory.

## Dependencies
Prototypes use the [Tone.js](https://tonejs.github.io/) API (v15). In cases where keyboard input is used, the JavaScript builtin [Keyboard Events API](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent) is used.

The depth map-based prototypes use a schema based on the [object detection schema](https://github.com/Shared-Reality-Lab/IMAGE-server/blob/2945b52da77bf74b1307e7e2286c6297ebef6157/preprocessors/object-detection.schema.json) for IMAGE.


# Documentation
This file is an overview: **see [here](https://github.com/rachel-sedibridge/COMP400-proj-IMAGE/blob/documentation/documentation/guide.md#documentation-guide) for full documentation** (*link to table of contents*).

Table of contents TL;DR (just click the link though):
- **`/documentation/<prototype_group>_design.md`**: Concept description for that group of prototypes. Design considerations and iteration.
- **`/documentation/<prototype_group>_technical.md`**: In-depth technical documentation for prototypes in that group.
- **`/documentation/<prototype_group>_usage.md`**: Instructions for taking a look a the prototypes yourself.


# Design groups
All designs are meant to go alongside and enhance alt-text, not replace it.

There are variations/iterations of every design "group" listed below: **see [here](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/documentation/guide.md#prototypes) for high-level breakdown** (*link to docs*). 

## Depth map-based
See [specific design documentation](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/documentation/depth_design.md#concept) for more details.

Communicate three dimensions of information using spatialization\* for the x-y plane, and some way of communicating depth. This is what varies between designs.

*\*NOTE: these prototypes use simple left-right spatialization (just x) for simplicity, but they use the Tone.js API, which does support higher-dimension equalpower or HRTF panning .*


## Scan
See [specific design documentation](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/documentation/scan_design.md#concept) for more details.

Main components:
1. Representing height. Focuses on the vertical composition of the picture: relies heavily on the picture being a 2D projection. Therefore, this design is likely to be more useful to late-blind users (past SRL user studies show late-blind people find 2D projections much more intuitive).
2. Use sounds that might go with the semantic regions in real life (sound of waves for water, heartbeat for animal/person...etc). Hopefully, this gives users a richer experience.


## OLD - depth layers
This prototype does not have more detailed documentation in the `documentation` folder because it's not very good so I didn't think it was worth it...

This was the first prototype I made at the very beginning of this project. It was too good a prototype for that point in the project: I'd done no testing and not enough brainstorming. **I do not recommend this for integration with IMAGE**. I'm just leaving it in for the sake of completeness. Who knows, maybe it'll be useful at some point.

This idea divides an image (a very easily-split landscape was used for demonstration purposes) into "layers" of perspective, from closest to farthest. Users can navigate forwards and backwards within these layers to gain a more immersive impression of the photo. Additional navigation is available for moving vertically within a "layer".

The idea was to apply the depth mapping, since I'd been told that was very useful especially for early-blind individuals.

This idea also aimed to replace the alt-text description by integrating it with an interactive experience.

**Actually, the controls from this prototype may still be a useful idea even if the sonification strategies aren't**.

### Features used:
- Pitch to outline the shape of a region (*this one has been lovingly nicknamed the "slide whistle" prototype...*)
- Volume to depict texture (e.g. rapidly changing volume for fluffy clouds)
- 2D panning: show horizontal extent of a region within a "layer"

### Usage
Execute the `prototype.py` script, follow spoken instructions.

Controls (repeated in instructions):
- `up` to move "deeper" (farther from yourself) by one layer
- `down` to move "closer" to yourself by one layer
- `shift+up` & `shift+down` to move vertically within the current layer.

### Missing
- The audio clips play on top of each other if you start one before the last one finishes.
- Program exits before the "exiting" audio clip can play
- I used a free limited AI text-to-voice program, so the voice is wonky at times and not always the same (I exceeded the daily limit on the main voice I'd been using lol)



# Terminology
- "Region": something identified by the semantic segmentation, using [this schema](https://github.com/Shared-Reality-Lab/IMAGE-server/blob/2945b52da77bf74b1307e7e2286c6297ebef6157/preprocessors/segmentation.schema.json)
- "Object" (in context of IMAGE output): something identified by object detection, using [this schema](https://github.com/Shared-Reality-Lab/IMAGE-server/blob/2945b52da77bf74b1307e7e2286c6297ebef6157/preprocessors/object-detection.schema.json)



# TODO
Incomplete list
- reduce the number of global vars esp. in the "scan" prototypes
- versions of all prototypes w/ more pictures
- implement UI features for `scan_segmented`
- `scan_continous` backwards playback start from the correct point in track
- clean up `scan/scan_continuous.js`
- the start/stop in "echo" prototype makes the tones a little louder every time you pause: 3 pauses in and it's so loud the noise is breaking. No *clue* why, gotta fix that.
- read out names (label tones) in depth_map prototypes
- work out timing so that `toneEvents` doesn't need to be global var - `echo.js`, `thrown_ball.js`

# License
This project is licensed under the McGill SRL IMAGE contributor license agreement [here](https://github.com/Shared-Reality-Lab/IMAGE-server/blob/main/CLA.md).
