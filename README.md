# Description
Sound design prototypes for [IMAGE](https://image.a11y.mcgill.ca/).

There are two groups of prototypes in this repo: "scanning" (`/scan/`) and depth map-based (`/depth_map_designs/`).

Each group of prototypes uses only one image so far: they can be found in the directory for that group, under the `photos/` subdirectory.

## Dependencies
Prototypes use the [Tone.js](https://tonejs.github.io/) API (v15). In cases where keyboard input is used, the JavaScript builtin [Keyboard Events API](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent) is used.

The depth map-based prototypes use a schema based on the [object detection schema](https://github.com/Shared-Reality-Lab/IMAGE-server/blob/2945b52da77bf74b1307e7e2286c6297ebef6157/preprocessors/object-detection.schema.json) for IMAGE.


# Documentation
**More detailed documentation for all of these can be found in the `documentation` directory.** This is just an overview.

See [`/documentation/guide.md`](https://github.com/rachel-sedibridge/COMP400-proj-IMAGE/blob/documentation/documentation/guide.md#documentation-guide) for a table of contents and short overview of every prototype in this repo.

TL;DR of `guide.md`:
- **`<prototype_group>_design.md`**: Concept description for that group of prototypes. Design considerations and iteration.
- **`<prototype_group>_technical.md`**: In-depth technical documentation for prototypes in that group.
- **`<prototype_group>_usage.md`**: Instructions for taking a look a the prototypes yourself.
- **other**: supporting misc. documentation, e.g. object schema for the depth map-based prototypes.


# Designs

## Depth map-based
Communicate three dimensions of information using spatialization\* for the x-y plane, and some way of communicating depth. This is what varies between designs.

*\*NOTE: these prototypes use simple left-right spatialization (just x) for simplicity, but they use the Tone.js API, which does support higher-dimension equalpower or HRTF panning .*


## Scan
This design is meant to go alongside an alt-text description, like the spatialized audio in IMAGE as it exists at time of writing.

This design plays with assigning real-life representational sounds to regions, as well as depicting height within the 2D projection of the picture. It maps the identified regions to a representational sound (e.g. waves on a lake for water-related sounds). It then "scans" up the picture from bottom to top, and the sound for each region appears, disappears, and grows lounder or quieter in the sonification where that region takes up more or less space in the picture.

Put another way, each of the regions detected in an image has an associated sound. Imagine a bar scanning over the image from bottom to top: the sound of a region plays when that region is present under that bar. The volume of the sound is proportional to how much of image it takes up under the bar.
&nbsp;&nbsp;&nbsp;&nbsp;e.g. If the sound for "water" and the sound for "rock" are playing at equal volumes, the image at that height is about half water and half rock.
&nbsp;&nbsp;&nbsp;&nbsp;e.g. If a sound plays for the first quarter of the total sonification and then disappears, that region is only present in the bottom quarter of the image.

[If that made no sense, imagine taking a very small horizontal slice of the bottom of a photo. Like, the bottom 2 rows of pixels. This sonification plays the sounds for the regions present in this slice, with volume proportional to how much of the slice they take up.]: #

[&nbsp;&nbsp;&nbsp;&nbsp;e.g. If that slice contains entirely water, you will hear only the sound associated to "water".]: #
[&nbsp;&nbsp;&nbsp;&nbsp;e.g. If that slice is 67% "field" and 33% "forest", you will hear the sounds for both those regions, with "field" sounding roughly twice as loud as "forest".]: #

[Then, imagine looking at the next 2 rows of pixels and playing the sonification for that, then the next, and so on up to the top of the picture.]:  #

*If you've ever played the demo for sheet music online and seen the line moving across it to track the place, that's where I got the idea. [Video example](https://www.youtube.com/watch?v=NWEVKyEwi4A&list=PLhkgFCE9DX4PplwDyQrNN_XTedppjjiry&index=1).*


### Design idea
This design covers two things.

The first was an attempt to represent height by focusing on the vertical composition of the picture. It communicates height only in the context of the 2D projection, so this would almost certainly be more useful for late-blind users who find it useful to create a 2D mental image.

The second is immersion: the hope is that by using sounds representing the regions in real life, users get a richer experience of the image.

### Limitations
- (Probably!! Not tested!!) mainly useful for late-blind: not universally helpful
- Finding sounds to represent the regions is *hard*. It's helpful that these are long tones, but it's still a pain. The `sound_map.json` file contains the beginnings of this mapping.
- This is not an intuitive design: I did my best w/ the instructions and making the experience customizable and parse-able, but there's still some amount of learning curve.

### Variations
1. Static (OG)
2. Interactive, continuous
3. Interactive, sectioned (**this is the best one**)


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



# TODOs (incomplete)
- reduce the number of global vars esp. in the "scan" prototypes
- versions of all prototypes w/ more pictures
- implement UI features for `scan_segmented`
- `scan_continous` backwards playback start from the correct point in track
- clean up `scan/scan_continuous.js`
- the start/stop in "echo" prototype makes the tones a little louder every time you pause: 3 pauses in and it's so loud the noise is breaking. No *clue* why, gotta fix that.
- read out names (label tones) in depth_map prototypes
- work out timing so that `toneEvents` doesn't need to be global var - `echo.js`, `thrown_ball.js`
