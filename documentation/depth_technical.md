# Dependencies
- Tone.js v15.3.5 ([here](https://tonejs.github.io/))
- KeyboardEvent API (built-in) (docs [here](https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent))
- IMAGE object detection pre-processor schema ([here](https://github.com/Shared-Reality-Lab/IMAGE-server/blob/2945b52da77bf74b1307e7e2286c6297ebef6157/preprocessors/object-detection.schema.json))
- IMAGE depth map generator schema ([here](https://github.com/Shared-Reality-Lab/IMAGE-server/blob/2945b52da77bf74b1307e7e2286c6297ebef6157/preprocessors/depth-map-generator.schema.json))

pes all involve adding depth information to 



# General (all variations)
At a basic level, these prototypes all involve adding depth information to the simple spatialized tones that currently represent objects detected in an image.

## Potential integration w/ IMAGE
In order to (hopefully) make it easier to integrate into IMAGE, these prototypes all generate, edit, time, and play back the tones for all objects using a JSON file following an existing IMAGE schema. Specifically, the object detection schema (linked above). I haven't yet set this up to work with the [semantic segmentation schema](https://github.com/Shared-Reality-Lab/IMAGE-server/blob/2945b52da77bf74b1307e7e2286c6297ebef6157/preprocessors/segmentation.schema.json).

These prototypes obviously depend on the depth map, which is not currently integrated into any other schemas. I therefore added a "depth" parameter to the schema, setting it to a value between 0 and 1 inclusive, where 0 is closest and 1 is farthest. This is a pretty trivial normalization from the values in the depth map generator schema (also linked above).

It doesn't really matter what that depth value refers to (e.g. depth value of pixel closest to centroid, average value across bounding box, ...). I've been imagining it to be the average value within the outline of the object.

The parameters of effects are computed based on the json definition it receives, typically by normalizing some value (e.g. depth) onto a different range. This is done using the following equation, where the initial range (of the value in the json schema) is $[a,b]$ and the new range is $[c,d]$, and given that $b > a$:
```math
f(x) = c + \left(\frac{d-c}{b-a}\right) (x - a)
```

The order of objects in that JSON file is the order they are played in.

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

## Limitations
The main glaring limitation of all these prototypes is that the tones are not labelled. There are audio clips from an online free text-to-speech service that can be played in advance of tones, and there's space in the main config object (similar across all prototypes described here) for that info, it just hasn't been implemented yet.

As noted in more detail in the documentation for Tone.js (`./tonejs.md`), I have not figured out how to apply different effects to different calls on the same `ToneAudio` object (`Sampler`, `Player`, ...etc). Thus, even when the same sound is used for every object, a separate instance of the tone generator (probably a `Sampler`) was created for each one to allow for different effects (at minimum, different panning).



# Single Secondary Tone - Prototypes
This section describes two prototypes that are very similar. The core idea is for each object in the image to be represented by
1. a primary long tone whose duration maps to the depth (distance from viewer) of that object; and
2. a secondary tone that marks the end of the main tone, and may reinforce the "depth"

The variations on this idea are:
- "echo" prototype - `depth_map_designs/echo.js`: The secondary tone is a synthesized echo of the first one. It uses the same "base" sound as the primary tone. The secondary tone for different objects has different degrees of effects applied depending on depth.
- "duration" prototype - `depth_map_designs/duration.js`: The secondary tone is exclusively to mark the end of the primary tone. It uses a different "base" sound than the primary tone, but is exactly the same for every object.

## Configuration / Globals
There are a few global variables for parameters that should be easy to change. These are:
- `D_URL`: URL (assuming already inside the `audio_tracks/` folder) of the object tone base sound.
- `schema_url`: URL of the JSON schema to build the sonification off of. In a real implementation, this would be removed.
- `TOGGLE_PLAY`: name (in KeyboardEvents API) of the key that should toggle play/pause of the sonification. Set to spacebar (`" "`; yes, actually) by default bc that most intuitive to me.
- `TONE_SPACING`: number of seconds (can be decimal) of dead space between the end of the echo of one tone and the start of the main tone of the next.
- `SECONDARY_DURATION`: duration of the secondary tone, in seconds.

There's also a global `toneEvents` array, which is global because it needs to be instantiated at load time: if it's instantiated during user input handling, even if in a separate function call before the playback, the `Sample` buffers aren't loaded in time and it crashes. Haven't worked out a fix for that yet.

### Tone event array
A global array of tone info objects (`toneEvents`) is populated during initialization and forms the basis of playback. The name maybe isn't the best, because these are *not* `Tone.Event` objects. It is so named because it is passed as the `events` array to the `Tone.Part` object, which schedules the tones.

The objects in the array are defined as follows:
```
{
  "name" (string): name of the object (not currently used),
  "primaryTone"(Sampler): the main tone generator,
  "secondaryTone" (Sampler): the echo tone generator,
  "offset" (number): number of seconds b/w start of main tone and start of echo tone,
  "time" (TransportTime): start time of the main tone for this object
}
```

## On-load initialization
At load, the fetch API is used to read the contents of the specified (above) JSON file. That is passed to a function that interprets it, and populates the `toneEvents` array with the primary (object/main tone) and secondary ("stop") tones and timing information.

## Timing the playback
Tones are played in the same order they are given in the json file.

Once the tones and echoes are initialized, and the `toneEvents` array populated, another function is called that iterates over each object in that array and calculates the `time` for each one (see above). This is given by
```math
(0 \lor \text{[start time of previous tone]}) + \text{[offset for this object]} + \text{SECONDARY\_DURATION} + \text{TONE\_SPACING}
```
where `STOP_DURATION` and `TONE_SPACING` are global (easily configurable) variables. Their purpose is exactly what the name says.

## Handling user (keyboard) input
There is one `EventListener` for the "keydown" event, which calls a `handleDown()` function. This function checks if the key pressed was `TOGGLE_PLAY`, and exits early if not. Then if the playback is already started, it stops it using `Tone.getTransport().toggle()`. 

> [!NOTE]
> This will not stop playback immediately (as mentioned in the Tone.js supplementary documentation `./tonejs.md`) but will stop at the end of the current tone (another TODO to make this better).

Otherwise, create a (new every time) `Tone.Part` object with `events = toneEvents` (this is what it's for). A custom callback (`playTone()`) plays the primary tone (`.primaryTone`) for the offset (`.offset`) or 0.4s whichever is the larger, Starting at its set time (`.time`). Then, it schedules the secondary tone (`.secondaryTone`) to play for `STOP_DURATION` seconds, starting at `TransportTime` `.time + .offset`. 

By API specification, this callback must take a `time` argument and a `value` argument: however, `value` can be a dict as long as "time" is one of the keys. This is what I did here, to pass items of `toneEvents` as `value`.

Once that's created, it calls `Tone.getTransport().start()` to start the scheduled playback.

## Calculating offset
This value serves two purposes: the **duration** of the primary tone, and the secondary tone's **start time offset** wrt the primary tone. This is because the secondary tone should start at the same moment the primary tone ends.

> [!NOTE]
> If the object is in the extreme foreground, the offset can be as low as 0.01 seconds. In this case, there is a minimum duration for the primary tone of 0.4 seconds, because 0.01 seconds is impractically short (i.e. it sounds weird).

It's calculated by normalizing the depth value to the range [0.01, 3], where the secondary tone plays 0.01 seconds after the primary tone when depth = 0. That range was selected because an object in the extreme foreground shouldn't really have an "echo" of any kind. An offset of 0.01 seconds is enough that the signals don't interfere with one another, while still overlapping enough that to most people it seems like one sound.

## Limitations / Bugs
A specific bug in this prototype is that if you keep playing/pausing, the tones get louder (not immediately but pretty quickly), to the point that after about 3 play/pauses it gets uncomfortably loud and the sound is distorted.

I have absolutely no idea why this is, and have not had the time to look into it (sorry).

## Effects
Different effects are applied in the two variations.

### Panning - both
Panning is applied and calculated the same way in both variations.

For each object, the main and secondary tone are both panned to the same location.
The x coordinate of the object centroid (from json def'n) is normalized to the [-1, 1] range (instead of [0, 1] original range).
This value is passed as parameter to a `Tone.Panner` object. 

### "Echo" Effects
The main tone is passed through the **panner**, and then to output. The echo is passed in series through the **reverb**, **low pass filter**, **panner**, and finally to output.

If you want to change any of these parameters, you can generally change the normalized min and max and see what that does to it, and go from there.

#### Reverb
A reverb is applied to the echo tone of each object, with parameters based on the object's depth (from json def'n).
The depth value is converted to the decay time (in seconds) and the wet ratio ([0,1]), in both cases using the normalization equation defined at the top of this document. Decay time uses the range [0.5, 5], where decay = 0.5s when depth = 0. Wet ratio uses the range [0.5, 0.96], where wet = 0.5 when depth = 0.
These values are passed as the `decay` and `wet` parameters to a `Tone.Reverb` object.
These ranges were chosen by trial and error. For context: common values for reverb decay is between 1-3s, with 3s-5s if you're trying to make something sound far away. In that case, the "wet" ratio is often very extreme, as much as 0% dry 100% wet (many DAWs let you edit these indepently, not just as a ratio as in Tone.js). I didn't use `wet=1` because it didn't sound very good.

#### Low pass filter
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

### "Duration" Effects
The main tone is passed through the **panner**, and then to output. The secondary ("stop") tone is passed in series through the **volume**, **panner**, and then to output.

> [!WARNING]
> Passing the "stop" tone through the panner and *then* the volume editor does not work: volume gets skipped.

#### Volume
A `Tone.Volume` object is used to lower the volume of the secondary "stop" tone, just because the stock sound I picked is a bit loud. It's lowered by 14 decibels (14dB). **If a different stock sound is picked, this should be adjusted or removed.**

> [!NOTE]
> This could be done with a single `Volume` instance that is connected to every "stop" tone using `send()`/`receive()` instead of `connect()`. I have no time right now though.



# OLD - Multiple Echoes (`echo_multiple.js`)
This was the first draft of this idea, where depth of an object is communicated by a series of receding echoes. A more detailed discussion can be found in the design documentation for the depth map designs (`depth_design_usage.md`).

The documentation here is going to be much worse because it's not as good an idea as those above and I am prioritizing brutally with the time I have! :D

> [!CAUTION]
> This prototype has been broken in a number of ways by changes while working on the other two prototypes (e.g. it imports json data as `DATA` global var from another file, which I deleted bc the fetch API was a better way to do it). This prototype is *very* much a first draft.

## Configuration / Globals
Many of the same globals as the other prototypes, but also lists of 4 increasingly intense variations for each type of effect. Also has the `toneEffects` array, but it's just an array of the `Sampler` objects and the other information needs to be added later before using it as the `Part.events` (`Sequence.events`, in this case - see below) array.

## Initialization / Setup
The difference between this and the previous prototypes is that instead of generating unique effects based on the depth of an object, the depth range ([0,1]) is divided into 5 subdivisions and for each effect, the intensity (version) of it is selected fromo the global list based on where the object depth falls in that. It's 5 subdivisons because one (extreme foreground) has no echo at all, so no effects are needed.

e.g. If an object falls in subdivision 2, the echo will be send to delay at index 0, which gets sent through all the other effects (vol > reverb > EQ > output) with the objects at index 0. Then, it also gets sent through all of those but for the objects (delay, vol, reverb...) at index 1. Since each of these is sent to output, they all sound, and different effects get added to the different delays.

**This is *not* a good way to do this**. It's a pain to deal with because things can get mixed up very easily, and a pain to schedule.

## Effects
Panning is done the same way. 

Low pass filter is clumsily implemented with a `Tone.EQ3` object, because at time of creation I hadn't found the `Filter` object.

The effects used are: delay, volume, reverb, EQ (for low pass filter effect)

The four options for each effect are as follows:
```
const delays = [
  new Tone.Delay(0.7, MAX_DELAY),
  new Tone.Delay(1.4, MAX_DELAY),
  new Tone.Delay(2.1, MAX_DELAY),
  new Tone.Delay(2.8, MAX_DELAY)
];
const vols = [
  new Tone.Volume(-8),
  new Tone.Volume(-10),
  new Tone.Volume(-10),
  new Tone.Volume(-11)
]
const reverbs = [
  new Tone.Reverb({decay: 1.1, wet: 0.65}),
  new Tone.Reverb({decay: 1.23, wet: 0.76}),
  new Tone.Reverb({decay: 1.3, wet: 0.85}),
  new Tone.Reverb({decay: 1.4, wet: 0.95})
]
const lowPassFilters = [
  new Tone.EQ3({high: -14, highFrequency: 4000}),
  new Tone.EQ3({high: -15, highFrequency: 1500}),
  new Tone.EQ3({high: -16, highFrequency: 1000}),
  new Tone.EQ3({high: -18, highFrequency: 600})
]
```

Volume reduction is necessary because the `EQ3` object class does not do what I was looking for as well as `Filter`.

### Delay
In the other prototypes, a separate `Sampler` object is used for the secondary tone or echo. Here, instead, multiple delays are passed to the `Sampler` object for the primary tone.

## Handling user (keyboard) input
Very similar to other prototypes above, but uses a `Tone.Sequence` instead of a `Tone.Part` object for scheduling. Also, additional information like name, timing...etc is added at time of keydown handling, instead of during object construction.

## Limitations
Most or all of these I know how to fix / would now do differently, but have not gone back to fix because this prototype is not as good as the others in this document. It's mostly up for historical/process documentation.

- No pausing
- doesn't read the JSON file itself, outsources it to another file that no longer exists (that's what the `DATA` variable is): **this would a fatal exception if run!**
- Also no tone labelling (names)
- `toneEvents` array is initialized half during `Sampler` (tone) initialization and half during keydown handling: hadn't figured out how best to do this yet.
- For adding the same effect object to multiple `Sampler` objects, I should have used `send()` and `receive()` with `Tone.Channel` objects. I did not know this existed at the time.
- uses `Tone.Sequence` instead of `Tone.Part` to schedule the tones: this is a worse way to do it!
- puts multiple delays on the main tone instead of using separate `Sampler` objects for the echoes: more complicated to time, pain the neck!