
# Documentation guide


## Table of Contents
**[tonejs.md](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/documentation/tonejs.md)**\
Supplemental documentation for Tone.js API, to fill holes that I encountered in their official documentation. Important for any future work on this code!

**[depth_design.md](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/documentation/depth_design.md)**\
Conceptual description and documentation of design considerations for the depth map-related prototypes.

**[scan_design.md](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/documentation/scan_design.md)**\
Conceptual description and documentation of design considerations for the scanning prototypes. 

**[depth_technical.md](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/documentation/depth_technical.md)**\
In-depth technical documentation for the depth map prototypes, from higher level to nitty-gritty implementation details.

**[scan_technical.md](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/documentation/scan_technical.md)**\
In-depth technical documentation for the scanning prototypes, from higher level to nitty-gritty implementation details.

**[depth_usage.md](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/documentation/depth_usage.md)**\
How to take a look at the example depth map prototypes. Which files are relevant, controls, configuration...etc.

**[scan_usage.md](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/documentation/scan_usage.md)**\
How to take a look at the example scan prototypes. Which files are relevant, using and changing the interactive controls...etc.

**[object_schema.json](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/documentation/object_schema.json)**\
IMAGE object detection schema, with the "depth" property manually added. This is the schema used in all the depth map prototypes.

**[scan_sound_map.json](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/documentation/scan_sound_map.json)**\
List of proposed mapping of some stock sounds to potential region names, including semantically "synonymous" regions that could be mapped to the same sound. Contains links to the original sources.

**[LPF_frequency-graph.png](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/documentation/LPF_frequency-graph.png)**\
Image (screenshot from Desmos graphing calculator) of the function the depth map prototypes use to convert object "depth" (x) to cutoff frequency of the low pass filter (y). Used in `depth_technical.md`.

**[layers_prototype.md](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/documentation/layers_prototype.md)**\
Very basic documentation for the first ever prototype.



## Prototypes
### [Scan](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/documentation/scan_design.md#concept) category
Representational audio cues (e.g. sound of waves for "water" region) + vertical layout of picture. Scan up an image and play the sounds associated with the regions present, changing volume of sounds to indicate changing ratio of the horizontal slice of image occupied by that region.

Versions, from newest to oldest:
#### "Segmented": [`/scan/scan_segmented.js`](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/scan/scan_segmented.js)
***Complete, best version. Look at this one for examples***. Interactive version where the sonification is split into "segments", and the user clicks forwards and backwards between them using the keyboard.
e.g. starts at beginning, "up" trigger = play first segment, "up" = play second segment, "down" = play first segment again

#### "Continuous": `[/scan/scan_continuous.js`](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/scan/scan_continuous.js)
***Not complete***. Interactive version where the user presses and holds the trigger (e.g. arrow keys) to play and releases key to pause. Backwards playback has timing issues, use of Tone.js API is clumsy.

#### "Static": [`/scan/static_prototype/scan_static.js`](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/scan/static_prototype/scan_static.js)
**_Complete but old (implementation and idea)_**. Original version, does not use Tone.js API. Play/pause button on screen to controls playback. Cannot move around within the sonification.

### [Depth map](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/documentation/depth_design.md#concept) category
Communicate three dimensions of spatial information.

Versions, from newest to oldest:
#### "Duration": [`/depth_map_designs/duration.js`](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/depth_map_designs/duration.js)
***Complete, look at this one***. Object tone lasts longer the farther away the object is.

#### "Echo": [`/depth_map_designs/echo.js`](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/depth_map_designs/echo.js)
***Complete, ...or this one***. Replicate echolocation as if the objects were physically in front of the user: an echo that takes longer to come back and sounds farther away (reverb, low pass filter) the greater the object's "depth".

#### "Multiple Echoes": [`/depth_map_designs/echo_multiple.js`](https://github.com/rachel-sedibridge/IMAGE-obj-sonification-prototypes/blob/main/depth_map_designs/echo_multiple.js)
***Deprecated, not fully functional***. Only kept to record failed design idea. Early attempt to replicate echolocation, using *more echoes* to communicate greater distance.
