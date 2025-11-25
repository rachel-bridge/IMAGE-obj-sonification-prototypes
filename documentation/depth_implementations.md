# Dependencies
- Tone.js v15.3.5 ([here](https://tonejs.github.io/))
- KeyboardEvent API (built-in) (docs [here](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent))
- IMAGE object detection pre-processor schema ([here](https://github.com/Shared-Reality-Lab/IMAGE-server/blob/2945b52da77bf74b1307e7e2286c6297ebef6157/preprocessors/object-detection.schema.json))
- IMAGE depth map generator schema ([here](https://github.com/Shared-Reality-Lab/IMAGE-server/blob/2945b52da77bf74b1307e7e2286c6297ebef6157/preprocessors/depth-map-generator.schema.json))


# General (all variations)
As noted in more detail in the documentation for Tone.js (`./tonejs.md`), I have not figured out how to apply different effects to different calls on the same `ToneAudio` object (`Sampler`, `Player`, ...etc). Thus, even when the same sound is used for every object, a separate instance of the tone generator (probably a `Sampler`) was created for each one to allow for different effects (at minimum, different panning).

## Potential integration w/ IMAGE
In order to (hopefully) make it easier to integrate into IMAGE, these prototypes all generate, edit, time, and play back the tones for all objects using a JSON file following an existing IMAGE schema. Specifically, the object detection schema (linked above). I haven't yet set this up to work with the [semantic segmentation schema](https://github.com/Shared-Reality-Lab/IMAGE-server/blob/2945b52da77bf74b1307e7e2286c6297ebef6157/preprocessors/segmentation.schema.json).

These prototypes obviously depend on the depth map, which is not currently integrated into any other schemas. I therefore added a "depth" parameter to the schema, setting it to a value between 0 and 1 inclusive, where 0 is closest and 1 is farthest. This is a pretty trivial normalization from the values in the depth map generator schema (also linked above).

It doesn't really matter what that depth value refers to (e.g. depth value of pixel closest to centroid, average value across bounding box, ...). I've been imagining it to be the average value within the outline of the object.

The parameters of effects are computed based on the json definition it receives, typically by normalizing some value (e.g. depth) onto a different range. This is done using the following equation, where the initial range (of the value in the json schema) is $[a,b]$ and the new range is $[c,d]$, and given that $b > a$:
```math
f(x) = c + \left(\frac{d-c}{b-a}\right) (x - a)
```

The order of objects in that JSON file is the order they are played in.

# Making something sound farther away
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

## Limitations
The main glaring limitation of all these prototypes is that the tones are not labelled. There are audio clips from an online free text-to-speech service that can be played in advance of tones, and there's space in the main config object (similar across all prototypes described here) for that info, it just hasn't been implemented yet.


# "Thrown Ball" (idk what else to call it...)

## Configuration globals
... I should just make a config file for this lol. OK there are a few global variables, that are there to make them easy to tweak. These are
- `D_URL`: URL (assuming already inside the `audio_tracks/` folder) of the object tone base sound.
- `schema_url`: URL of the JSON schema to build the sonification off of. In a real implementation, this would be removed.
- `TOGGLE_PLAY`: name (in KeyboardEvents API) of the key that should toggle play/pause of the sonification. Set to spacebar (`" "`; yes, actually) by default bc that most intuitive to me.
- `TONE_SPACING`: number of seconds (can be decimal) of dead space between the end of the echo of one tone and the start of the main tone of the next.
- `STOP_DURATION`: duration of the short tone that tags the end of a main tone, in seconds.

There's also a global `toneEvents` array, which is global because it needs to be instantiated at load time: if it's instantiated during user input handling, even if in a separate function call before the playback, the `Sample` buffers aren't loaded in time and it crashes. Haven't worked out a fix for that yet.

## On-load initialization
At load, the fetch API is used to read the contents of the specified (above) JSON file. That is passed to a function that interprets it, and populates the `toneEvents` array with the primary (object/main tone) and secondary ("stop") tones and timing information.

## Effects
The main tone is passed through the **panner**, and then to output. The secondary ("stop") tone is passed in series through the **volume**, **panner**, and then to output.

> [!CAUTION]
> Passing the "stop" tone through the panner and *then* the volume editor does not work: volume gets skipped.

### Panning
For each object, the main and secondary tone are both panned to the same location.
The x coordinate of the object centroid (from json def'n) is normalized to the [-1, 1] range (instead of [0, 1] original range).
This value is passed as parameter to a `Tone.Panner` object. 

### Volume
A `Tone.Volume` object is used to lower the volume of the secondary "stop" tone, just because the stock sound I picked is a bit loud. It's lowered by 14 decibels (14dB). **If a different stock sound is picked, this should be adjusted or removed.**

> [!NOTE]
> This could be done with a single `Volume` instance that is connected to every "stop" tone using `send()`/`receive()` instead of `connect()`: good to look into.


# Single Echo (`echo.js`)

## Configuration globals
The global variables are identical to those in the "Thrown Ball" prototype (above), except that `STOP_DURATION` is renamed `ECHO_DURATION`. It refers to the same thing: the duration of the secondary tone.

## On-load initialization
Same as "Thrown Ball" prototype.

## Effects
The main tone is passed through the **panner**, and then to output. The echo is passed in series through the **reverb**, **low pass filter**, **panner**, and finally to output.

If you want to change any of these parameters, you can generally change the normalized min and max and see what that does to it, and go from there.

### Panning
For each object, the original tone and its echo are both panned to the same location.
The x coordinate of the object centroid (from json def'n) is normalized to the [-1, 1] range (instead of [0, 1] original range).
This value is passed as parameter to a `Tone.Panner` object. 

### Reverb
A reverb is applied to the echo tone of each object, with parameters based on the object's depth (from json def'n).
The depth value is converted to the decay time (in seconds) and the wet ratio ([0,1]), in both cases using the normalization equation defined at the top of this document. Decay time uses the range [0.5, 5], where decay = 0.5s when depth = 0. Wet ratio uses the range [0.5, 0.96], where wet = 0.5 when depth = 0.
These values are passed as the `decay` and `wet` parameters to a `Tone.Reverb` object.
These ranges were chosen by trial and error. For context: common values for reverb decay is between 1-3s, with 3s-5s if you're trying to make something sound far away. In that case, the "wet" ratio is often very extreme, as much as 0% dry 100% wet (many DAWs let you edit these indepently, not just as a ratio as in Tone.js). I didn't use `wet=1` because it didn't sound very good.

### Low pass filter
A low pass filter is applies to the echo tone of each object, with cutoff frequency based on the object's depth. The rolloff is always the same (12dB/octave, default).
The result is passed as the `frequency` parameter of a `Tone.Filter` object with `type="lowpass"`.
The depth value is put through a function that converts it to frequency in hertz (Hz). I used a completely arbitrary function that produced the results I wanted. The important thing is that the cutoff frequency drops off more sharply through the higher frequencies. The higher frequencies sound much closer together to the human ear, which was probably why it sounded like it wasn't getting "far away" fast enough with a linear function. There's a floor of 950Hz, which was arbitrarily chosen as the lowest the cutoff frequency could go, based on trial and error.
```math
f(x) = \begin{cases}
  6000 & 0 <= x < 0.05\\
  950+(-9x+9.5)^{3.5} & \text{otherwise}
\end{cases}
```
<div align="center">
    <img src="cutoff_freq_curve-desmos-pw.png" height="500" alt="Graph of depth vs cutoff frequency, screenshotted from Desmos.com">
</div>

## Echo delay time
The amount of time before the echo sounds is calculated by normalizing the depth value to a different range, in seconds. The range [0.01, 3] was selected, where the echo begins 0.01 seconds after the main tone does, if depth = 0. This was because, when an object is in the extreme foreground, it shouldn't actually have an echo that sounds very far away. This timing prevents the signals from interfering, but they still overlap enough that to most people it would sound like one sound.

## Tone event array
A global array of tone info objects (`toneEvents`) is populated during initialization and forms the basis of playback. The name maybe isn't the best, because these are *not* `Tone.Event` objects. It is so named because it is passed as the `events` array to the `Tone.Part` object, which schedules the tones.

The objects in the array are defined as follows:
```
{
  "name" (string): name of the object (not currently used),
  "tone"(Sampler): the main tone generator,
  "echo" (Sampler): the echo tone generator,
  "echoDelay" (number): number of seconds b/w start of main tone and start of echo tone,
  "time" (TransportTime): start time of the main tone for this object
}
```

## Timing playback
Tones are played in the same order they are given in the json file.

Once the tones and echoes are initialized, and the `toneEvents` array populated, another function is called that iterates over each object in that array and calculates the `time` for each one (see above). This is given by
```math
(0 \lor \text{[start time of previous tone]}) + \text{[echoDelay for this object]} + \text{ECHO\_DURATION} + \text{TONE\_SPACING}
```
where `ECHO_DURATION` and `TONE_SPACING` are global (easily configurable) variables. Their purpose is exactly what the name says.

## Handling user (keyboard) input
There is one `EventListener` for the "keydown" event, which calls a `handleDown()` function. This function checks if the key pressed was `TOGGLE_PLAY`, and exits early if not. Then if the playback is already started, it stops it using `Tone.getTransport().toggle()`. This will not stop playback immediately (as mentioned in the Tone.js supplementary documentation `./tonejs.md`) but will stop at the end of the current tone (another TODO to make this better).

Otherwise, it creates a (new every time) `Tone.Part` object which goes through every element in the `toneEvents` array (this is what it's for) and calls a callback (`playTone()`). The callback plays the main tone (`.tone`) for its set duration (`.echoDelay` or 0.4s whichever is the larger) at its set time (`.time`), then the echo tone (`.echo`) for `ECHO_DURATION` seconds at time `.time + .echoDelay`. By API specification, this callback must take a `time` argument and a `value` argument: however, `value` can be a dict as long as "time" is one of the keys. This is what I did here, to pass items of `toneEvents` as `value`.

Once that's created, it calls `Tone.getTransport().start()` to start the scheduled playback.

## Limitations / Bugs
A specific bug in this prototype is that if you keep playing/pausing, the tones get louder (not immediately but pretty quickly), to the point that after about 3 play/pauses it gets uncomfortably loud and the sound is distorted.

I have absolutely no idea why this is, and have not had the time to look into it (sorry).


# Multiple Echoes (`echo_multiple.js`) - superseded

## Effects
