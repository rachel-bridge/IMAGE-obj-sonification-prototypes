# Dependencies
- Tone.js v15.3.5 ([here](https://tonejs.github.io/))
- KeyboardEvent API (built-in) (docs [here](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent))
- IMAGE object detection pre-processor schema ([here](https://github.com/Shared-Reality-Lab/IMAGE-server/blob/2945b52da77bf74b1307e7e2286c6297ebef6157/preprocessors/object-detection.schema.json))
- IMAGE depth map generator schema ([here](https://github.com/Shared-Reality-Lab/IMAGE-server/blob/2945b52da77bf74b1307e7e2286c6297ebef6157/preprocessors/depth-map-generator.schema.json))


# General (all variations)
As noted in more detail in the documentation for Tone.js (`documentation/tonejs.md`), I have not figured out how to apply different effects to different calls on the same `ToneAudio` object (`Sampler`, `Player`, ...etc). Thus, even when the same sound is used for every object, a separate instance of the tone generator (probably a `Sampler`) was created for each one to allow for different effects (at minimum, different panning).

## Potential integration w/ IMAGE
In order to (hopefully) make it easier to integrate into IMAGE, these prototypes all generate, edit, time, and play back the tones for all objects using a JSON file following an existing IMAGE schema. Specifically, the object detection schema (linked above). I haven't yet set this up to work with the [semantic segmentation schema](https://github.com/Shared-Reality-Lab/IMAGE-server/blob/2945b52da77bf74b1307e7e2286c6297ebef6157/preprocessors/segmentation.schema.json).

These prototypes obviously depend on the depth map, which is not currently integrated into any other schemas. I therefore added a "depth" parameter to the schema, setting it to a value between 0 and 1 inclusive, where 0 is closest and 1 is farthest. This is a pretty trivial normalization from the values in the depth map generator schema (also linked above).

It doesn't really matter what that depth value refers to (e.g. depth value of pixel closest to centroid, average value across bounding box, ...). I've been imagining it to be the average value within the outline of the object.


# "Thrown Ball" (idk what else to call it...)


# Echo Variations

## Making something sound farther away
To make something sound far away, add the following effects:
- low pass filter: attenuate (limit) high frequencies
    Use a `Tone.Filter` object with the parameter `type = "lowpass"` and default (12dB/octave) rolloff. Cutoff frequency discussed later**WHERE**.
    High frequencies do not travel as far as low frequencies and are more easily blocked by obstructions (e.g. when you're standing outside a concert, you hear a lot more of the bass than the guitar). The farther away a sound source is, the more of the high frequency range you miss.
- reverb: happens naturally when sound waves reflect off of surfaces
    Use a `Tone.Reverb` object with high decay and a high wet value.
    When a sound originates farther from you (the listener), you hear a more intense reverb. Specifically, the farther away a sound is, the more "wet" the reverb (i.e. the higher the ratio of the reverb-ed signal to the original "dry" signal) and the greater the decay (i.e. the more time it takes for the "reflected" sound waves to die away).
- (optional) volume: reduce the volume
    Use a `Tone.Volume` object.
    Sounds coming from farther away are less loud. However, you may not need to do this, because the low pass filter will also make the sound quieter.
    I did not use this here.

e.g. [YouTube tutorial](https://www.youtube.com/watch?v=cyv5-YLe4Qw) on this


## Single Echo (`echo.js`)

### Effects


## Multiple Echoes (`echo_multiple.js`) - superseded

### Effects