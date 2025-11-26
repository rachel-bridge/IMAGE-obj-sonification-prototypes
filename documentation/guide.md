# Documentation guide


## Table of Contents
**tonejs.md**\
Supplemental documentation for Tone.js API, to fill holes that I encountered in their official documentation.

**depth_design.md**\
Documentation of design considerations for the prototypes using the depth map generator.

**scan_design.md**\
Documentation of design considerations for the scanning prototypes. 

**depth_technical.md**\
Technical documentation of the nitty-gritty implementation details for the depth map prototypes.

**scan_technical.md**\
Technical documentation of the nitty-gritty implementation details for the scanning prototypes.

**depth_usage.md**\
Usage documentation for demo-ing the depth map category of prototypes. How to use the controls under default settings, how to change parameters like tone spacing and secondary tone duration...etc.

**scan_usage.md**\
Usage documentation for demo-ing the scan category of prototypes. How to use and change the interactive controls.

**EDITED_object_detection_schema.json**\
IMAGE object detection schema, with the "depth" property added as I've defined it for the depth map prototypes.

**scan_sound_map.json**\
List of proposed mapping of some stock sounds to potential region names, including "synonymous" regions that could be mapped to the same sound.

**LPF_frequency-graph.png**\
Image (screenshot from Desmos graphing calculator) of the function the depth map prototypes use to convert object "depth" (x) to cutoff frequency of the low pass filter (y).



## Prototypes
### "Scan" category
Representational audio cues (e.g. sound of waves for "water" region) + vertical layout of picture. Scan up an image and play the sounds associated with the regions present, changing volume of sounds to indicate changing ratio of the horizontal slice of image occupied by that region.

The versions / iterations of this concept are as follows:
#### "Segmented": `/scan/scan_segmented.js`
*Complete, best version*. Interactive version where the sonification is split into $x$ (default: 4) "segments", and the user moves between them using the trigger keys. Clicking "backwards" moves to an earlier segment, but the segments themselves do not play backwards.
e.g. starts at beginning, "up" trigger = play first segment, "up" = play second segment, "down" = play first segment again

#### "Static": `/scan/static_prototype/scan_static.js`
*Complete, has functioning web interface*. Original implementation of this idea, does not use Tone.js. The user presses a play/pause button on screen to start/stop playback. No moving around within the sonification is possible.

#### "Continuous": `/scan/scan_continuous.js`
*Not complete*. This version was abandoned most of the way through implementation in favour of the "segmented" variation, and it was my first try using Tone.js.
Interactive version where the user presses and holds the trigger keys to play, either forwards or backwards, and releases the key to pause. 

### Depth map category
Integrate depth information to the current spatialized pings for object detection. Keep the single spatialized tone for each object, changing duration and adding a secondary tone with effects on it to communicate depth information.

The versions / iterations of this concept are as follows:
#### "Echo": `/depth_map_designs/echo.js`
*Complete*. Replicate echolocation as if the objects were physically in front of the user: an echo that takes longer to come back and sounds farther away (reverb, low pass filter) the greater the object's "depth".

#### "Duration": `/depth_map_designs/duration.js`
*Complete*. Similar to "echo" but rely only on the duration of the primary tone to communicate distance. Secondary tone is a different base sound and just tags the end of the primary tone for clarity.

#### "Multiple Echoes": `/depth_map_designs/echo_multiple.js`
*Deprecated, not fully functional*. Original iteration of this concept, made before I really figured out Tone.js, and abandoned in favour of the other variations. Objects are categorized by depth as having 0-4 echoes, where the farthest away objects have 4 increasingly distant-sounding echoes after the primary tone.



