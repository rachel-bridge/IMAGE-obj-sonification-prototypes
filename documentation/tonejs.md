# Supplemental Tone.js documentation

Because this API is very handy and cool but its documentation is... lacking, at times.

**Github: <https://github.com/Tonejs/Tone.js>**
**Wiki: <https://github.com/Tonejs/Tone.js/wiki>**
**Official documentation: [v15](https://tonejs.github.io/docs/15.1.22/index.html), [v14](https://tonejs.github.io/docs/14.7.77/)**
**Another (unofficial?) up-to-date wiki: <https://deepwiki.com/Tonejs/Tone.js/7-examples-and-tutorials>**

This project uses v15.


## Versioning and navigating the official documentation

The main breaking change made by v15 is "Deprecating singleton variables, use singleton getter instead", which only applies to the list below. With those exceptions, the v15 docs are an exact copy-paste of the v14 docs with different formatting: I've also linked v14 because it actually explains those deprecated classes (I also prefer the formatting, maybe just me).

They've left up years' worth of old documentation, so if you're just Googling a specific part of the API check the URL to make sure it's not from before v14.

Deprecated classes/variables in v15 (only `Destination` and `Transport` are used here):
- `Destination`
- `Draw`
- `Listener`
- `Transport`

In short, anytime you want to access the `Destination` or `Transport` (or the others), which are global, use the getter instead.


## Timing - Tone.Transport / Tone.getTransport()

The Transport class is used a lot in this code because that's what controls timing, and the documentation for it is confusing as all hell.

### Official docs' info

In the interest of not reinventing the wheel...
- Wiki article: <https://github.com/Tonejs/Tone.js/wiki/TransportTime>
- v14 docs for Transport class: <https://tonejs.github.io/docs/14.7.77/Transport>
- v13 docs for Transport class (I have a note to self that this article is better): <https://tonejs.github.io/docs/r13/Transport>
- [useless] v15 docs for `getTransport()`: <https://tonejs.github.io/docs/15.1.22/functions/getTransport.html>

The wiki article is a pretty good conceptual overview. For actual implementation, the docs aren't that helpful (hence the next section). The docs for v15 have a lot of "yep, this sure is a function! ... :D".

### Additional info

- `Tone.getTransport.stop()` restarts the `Transport`, i.e. **sets its time to 0**. Transport.pause() does *not* do this.
  - `.stop()` in the middle of playback means it will pick up again from the beginning next time. `.pause()` means it’ll pick back up where it left off.
- **Once you've scheduled something into `Transport` and started it, you *cannot* stop/cancel the scheduled audio**. It's like you've already sent the signal and you can't un-send it. You can mute the `Transport` until it's done, but that's it.
  - I have not found a way around this. The Scan prototype just mutes the `Transport` to stop midway through, and the next "start" restarts the Transport to fake like you stopped it entirely. Yes this is a crappy workaround.
- The wiki and other docs talk a lot about the distinction between `Transport` time and the absolute clock time as seconds from load. **The way to access "TransportTime"** is: call `Tone.TransportTime().valueOf()`.
  - All variations on `.immediate()` or `.now()` (either `Tone.now()` or on any object that has that function) just get you the absolute clock time (afaik).
- `Tone.getTransport().start()` and `.stop()` start/stop the playback relative to the absolute timer. Other things, like `Tone.Loop().start()`/`.stop()` and Events will (I think) start/stop relative to `TransportTime` ([source](https://github.com/Tonejs/Tone.js/wiki/TransportTime#example)).



## Error messages

The first thing to note is that for all these prototypes, the console is flooded with the following warning "*An AudioContext was prevented from starting automatically. It must be created or resumed after a user gesture on the page.*". This is just indicating that the sounds used in the prototype rely on user input to be played, and do not play automatically: it's not a cause for concern.

Actual error I kept getting: "**buffer is either not set or not loaded**". Inspecting the code with the cosnole debugger showed that the buffer was, in fact, loaded. Mystery!
According to the main developer of Tone.js on a [GitHub issue thread](https://github.com/Tonejs/Tone.js/issues/528), "That error happens if your samples are not loaded before you try to play a note". **To fix**, ensure that the tone generator (e.g. `Tone.Sampler` object) is not created in the same function as you're trying to make it play something. Chaining classes (e.g. a `Sampler` and a `Panner`) that were defined in different contexts can also cause this error.


## Player class

The `Player` class is used to play back an audio file (like an mp3). For generating and manipulating multiple tones from an audio file, much easier to use a `Sampler`.

- You can set `Player.name` but you gotta do it after initialization, b/c for whatever reason, `name` isn't a valid key in `Tone.PlayerOptions`. It won't crash if you put it in there, it'll just get ignored.
- `Player` objects have an associated buffer, which you can access through `Player.buffer` and get useful information like the duration of the associated audio file. However, this is not intialized immediately (no clue why). I could get around this pretty easily so I didn't look far into when exactly that's initialized. Just something to be aware of.
- `Player.onstop()` is called whenever the player stops playing, including pauses where it hasn’t reached the end of the track!
  - I am unsure whether `onstop()` is called when the `Transport` pauses as well, or if it's only when the `Transport` is stopped, because I don't think I'd figured out enough about `Transport` to check that when I wrote this down.
- You can access the duration of a Player audio file by going to player.buffer.duration (this is technically documented but it is not clear).


## Timing of `triggerAttackRelease`
I haven't figured out how to play a tone from the same `Sampler` multiple times with different effects, without just making separate `Sampler` objects for each one. This is because `triggerAttackRelease()` gets invoked with, functionally, the **final state within that context**.  

Here are a few examples using `Channel` objs to pan a simple `Sample`:
```
const basicTone = new Tone.Sampler({ D1: 'D1.mp3' });
const channel1 = new Tone.Channel({ pan: -0.25 });
const channel2 = new Tone.Channel({ pan: 1 });
```
In the following code, `basicTone` is played twice through `channel2`. You hear two tones, both panned hard right. There are two options here: the outcome of both each is the exact same. Apparent execution order is commented.
```
// OPTION 1
basicTone.chain(channel2, Tone.getDestination());   // 1
basicTone.triggerAttackRelease("D1", 0.5, 0);       // 2
basicTone.triggerAttackRelease("D1", 0.5, 1);       // 3

// OPTION 2
basicTone.chain(channel1, Tone.getDestination());   // 1
basicTone.triggerAttackRelease("D1", 0.5, 0);       // 4
basicTone.disconnect(channel1);                     // 2

basicTone.chain(channel2, Tone.getDestination());   // 3
basicTone.triggerAttackRelease("D1", 0.5, 1);       // 5
```
In the following code, `basicTone` is sent through both `channel1` and `channel2`. The result is that the panning overlaps, and you hear two tones, both apparently panned halfway between -0.25 and 1. There's also a bit of distortion from that. Apparent execution order is commented.
```
basicTone.chain(channel1, Tone.getDestination());   // 1
basicTone.triggerAttackRelease("D1", 0.5, 0);       // 3
basicTone.chain(channel2, Tone.getDestination());   // 2
basicTone.triggerAttackRelease("D1", 0.5, 1);       // 4
```
There is probably a way around this, but it would require spending more time on this than I have, so I'm working around it by just making different `Sampler` instances.


## Other (Miscellaneous)

**Destination**: It's the output device, basically. Accessed via `.toDestination()` (at the end of a contrsuctor) or `Tone.getDestination()`. Since we're assuming users just have normal computer speakers or headphones, we can (*I think!!*) pretty much ignore output device.

**'Buffer' = 'ToneAudioBuffer'**. You may see discussion online of the `Buffer` class, because that exists in Web Audio and older versions of Tone.js. From v14 on, that's called `ToneAudioBuffer` ([docs](https://tonejs.github.io/docs/15.1.22/classes/ToneAudioBuffer.html)). Only the name is changed.

**Reverb wet value range**: `Reverb.wet` property is on range [0, 1] (['NormalRange'](https://tonejs.github.io/docs/15.1.22/types/Unit.NormalRange.html))

**Find SequenceOptions**: `SequenceOptions` are only described in the code: see [here](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L76)
  - This isn't the only case of this. If the constructor for a class mentions "[object]Options" but doesn't have it documented, it does always link to the definition in the code and that's generally very readable for quick reference.

**Filters**: The `Filter` class encompasses things like low pass and high pass filters *(this was not obvious to me)*. 

**Volume control & Gain**: For controlling volume (e.g. ramp from x to y in a specific shape): `Tone.Gain`. Specifically, the `[Gain obj].gain` property. It has funcs like `rampTo()`, `exponentialRampTo()`...etc that are not well documented.
  - Links: [docs for Gain](https://github.com/Tonejs/Tone.js/blob/dev/Tone/core/context/Param.ts#L64) > [code for Gain constructor](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Gain.ts#L57) > [code for Param internal](https://tonejs.github.io/docs/15.1.22/classes/Gain.html)
