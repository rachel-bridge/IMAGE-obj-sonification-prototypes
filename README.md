# Description
Sound design prototypes for [IMAGE](https://image.a11y.mcgill.ca/).

More detailed documentation for all of these can be found in the `documentation` directory. This is just an overview.


# Designs

## Echo


## Scan
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

### This prototype
This is a single "wizard of Oz" example with the photo at `scanning/photos/dramatic_crossing-a_stankiewicz.jpg`. The sound for each region was created by uploading the stock sounds into Reaper, manually editing the volume according to roughly where IMAGE split the regions, and rendering one track at a time. This is also a pretty simple picture with a few big regions, and horizontally organized.

I have yet to make a version of this with a greater variety of images.

### Implementation / Dependencies
Audio editing & playback [Tone.js](https://github.com/Tonejs/Tone.js/tree/dev).

Base sounds:
- "sky": <https://pixabay.com/sound-effects/wind-blowing-sfx-07-423677/>
- "water": <https://pixabay.com/sound-effects/lake-waves-1-411720/>
- "animal": <https://pixabay.com/sound-effects/horse-galloping-339737/>
- "ground": <https://pixabay.com/sound-effects/rocks-falling-44890/>
Here's the Pixabay (stock sound site) public [collection](https://pixabay.com/accounts/collections/30321802/) of sound clips I considered using.


## OLD - depth layers
This was the first prototype I made at the very beginning of this project. It was too good a prototype for that point in the project: I'd done no testing and not enough brainstorming. **I do not recommend this for integration with IMAGE**. I'm just leaving it in for the sake of completeness. Who knows, maybe it'll be useful at some point.

This idea divides an image (a very easily-split landscape was used for demonstration purposes) into "layers" of perspective, from closest to farthest. Users can navigate forwards and backwards within these layers to gain a more immersive impression of the photo. Additional navigation is available for moving vertically within a "layer".

The idea was to apply the depth mapping, since I'd been told that was very useful especially for early-blind individuals.

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
- I was never happy with the sound effects.
- Program exits before the "exiting" audio clip can play
- I used a free limited AI text-to-voice program, so the voice is wonky at times and not always the same (I exceeded the daily limit on the main voice I'd been using lol)



# Terminology
- "Region": something identified by the semantic segmentation, using [this schema](https://github.com/Shared-Reality-Lab/IMAGE-server/blob/2945b52da77bf74b1307e7e2286c6297ebef6157/preprocessors/segmentation.schema.json)
- "Object" (in context of IMAGE output): something identified by object detection, using [this schema](https://github.com/Shared-Reality-Lab/IMAGE-server/blob/2945b52da77bf74b1307e7e2286c6297ebef6157/preprocessors/object-detection.schema.json)
- "2D panning": exclusively left-right panning