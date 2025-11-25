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

The parameters of effects are computed based on the json definition it receives, typically by normalizing some value (e.g. depth) onto a different range. This is done using the following equation, where the initial range (of the value in the json schema) is $[a,b]$ and the new range is $[c,d]$, and given that $b > a$:
```math
f(x) = c + \left(\frac{d-c}{b-a}\right) (x - a)
```

The order of objects in that JSON file is the order they are played in.


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
The main tone is passed through the **panner**, and then to output. The echo is passed in series through the **reverb**, **low pass filter**, **panner**, and finally to output.

#### Panning
For each object, the original tone and its echo are both panned to the same location.
The x coordinate of the object centroid (from json def'n) is normalized to the [-1, 1] range (instead of [0, 1] original range).
This value is passed as parameter to a `Tone.Panner` object. 

#### Reverb
A reverb is applied to the echo tone of each object, with parameters based on the object's depth (from json def'n).
The depth value is converted to the decay time (in seconds) and the wet ratio ([0,1]), in both cases using the normalization equation defined at the top of this document. Decay time uses the range [0.5, 5], where decay = 0.5s when depth = 0. Wet ratio uses the range [0.5, 0.96], where wet = 0.5 when depth = 0.
These values are passed as the `decay` and `wet` parameters to a `Tone.Reverb` object.
These ranges were chosen by trial and error. For context: common values for reverb decay is between 1-3s, with 3s-5s if you're trying to make something sound far away. In that case, the "wet" ratio is often very extreme, as much as 0% dry 100% wet (many DAWs let you edit these indepently, not just as a ratio as in Tone.js). I didn't use `wet=1` because it didn't sound very good.

#### Low pass filter
A low pass filter is applies to the echo tone of each object, with cutoff frequency based on the object's depth. The rolloff is always the same (12dB/octave, default).
The result is passed as the `frequency` parameter of a `Tone.Filter` object with `type="lowpass"`.
The depth value is put through a function that converts it to frequency in hertz (Hz). I used a completely arbitrary function that produced the results I wanted. The important thing is that the cutoff frequency drops off more sharply through the higher frequencies. The higher frequencies sound much closer together to the human ear, which was probably why it sounded like it wasn't getting "far away" fast enough with a linear function.
```math
f(x) = \begin{cases}
  6000 & 0 <= x < 0.05\\
  950+(-9x+9.5)^{3.5} & \text{otherwise}
\end{cases}
```
<div align="center">
    <img src="cutoff_freq_curve-desmos-pw.png" height="500" alt="Graph of depth vs cutoff frequency, screenshotted from Desmos.com">
</div>

### Echo delay time
The amount of time before the echo sounds is calculated by normalizing the depth value to a different range, in seconds. The range [0.01, 3] was selected, where the echo begins 0.01 seconds after the main tone does, if depth = 0. This was because, when an object is in the extreme foreground, it shouldn't actually have an echo that sounds very far away. This timing prevents the signals from interfering, but they still overlap enough that to most people it would sound like one sound.

### Tone event array
A global array of tone info objects (`toneEvents`) is populated during initialization and forms the basis of playback. The name maybe isn't the best, because these are *not* `Tone.Event` objects. It is so named because it is passed as the `events` array to the `Tone.Part` object, which schedules the tones.

The objects in the array are defined as follows:
```
{
  "name": string, name of the object (not currently used);
  "tone": Sampler, the main tone;
  "echo": Sampler, the echo tone;
  "echoDelay": number (seconds), num. seconds b/w start of main tone and start of echo tone;
  "time": TransportTime, start time of the main tone;
}
```

### Timing playback
Tones are played in the same order they are given in the json file.

Once the tones and echoes are initialized, and the `toneEvents` array populated, another function is called that iterates over each object in that array and calculates the `time` for each one (see above). This is given by
```math
(0 \or \text{[`time` of previous tone]}) + \text{echoDelay} + \text{ECHO_DURATION} + \text{TONE_SPACING}
```
where `ECHO_DURATION` and `TONE_SPACING` are global (easily configurable) variables. Their purpose is exactly what the name says.


## Multiple Echoes (`echo_multiple.js`) - superseded

### Effects
