# Supplemental Tone.js documentation

Because this API is very handy and cool but its documentation is... lacking, at times.

**Github: <https://github.com/Tonejs/Tone.js>**
**Wiki: <https://github.com/Tonejs/Tone.js/wiki>**
**Official documentation: [v15](https://tonejs.github.io/docs/15.1.22/index.html), [v14](https://tonejs.github.io/docs/14.7.77/)**

This project uses v15.


## Versioning and navigating the official documentation

The main breaking change made by v15 is "Deprecating singleton variables, use singleton getter instead", which only applies to the list below. With those exceptions, the v15 docs are an exact copy-paste of the v14 docs with different formatting: I've also linked v14 because it actually explains those deprecated classes (I also prefer the formatting, maybe just me).

They've left up years' worth of old documentation, so if you're just Googling a specific part of the API check the URL to make sure it's not from before v14.

Deprecated classes/variables in v15 (only `Destination` and `Transport` are used here):
- `Destination`
- `Draw`
- `Listener`
- `Transport`


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
- Once you've scheduled something into `Transport`, you *cannot* stop it. It's like, you've already sent the signal and you can't un-send it. You can mute the `Transport` until it's done, but that's it.
  - I have not found a way around this. The Scan prototype just mutes the `Transport` to stop midway through, and the next "start" restarts the Transport to fake like you stopped it entirely. Yes this is a crappy workaround.
- The wiki and other docs talk a lot about the distinction between `Transport` time and the absolute clock time as seconds from load. **The way to access "TransportTime"** is: call `Tone.TransportTime().valueOf()`.
  - All variations on `.immediate()` or `.now()` (either `Tone.now()` or on any object that has that function) just get you the absolute clock time (afaik).
- `Tone.getTransport().start()` and `.stop()` start/stop the playback relative to the absolute timer. Other things, like `Tone.Loop().start()`/`.stop()` and Events will (I think) start/stop relative to `TransportTime` ([source](https://github.com/Tonejs/Tone.js/wiki/TransportTime#example)).


## Everything else

I have beef with Tone.Transport. Everything else combined is about the same amount of notes lol. 

- **'Buffer' = 'ToneAudioBuffer'**. You may see discussion online of the `Buffer` class, because that exists in Web Audio and older versions of Tone.js. From v14 on, that's called `ToneAudioBuffer` ([docs](https://tonejs.github.io/docs/15.1.22/classes/ToneAudioBuffer.html)). Only the name is changed.
- `Reverb.wet` property is on range [0, 1] (['NormalRange'](https://tonejs.github.io/docs/15.1.22/types/Unit.NormalRange.html))
- `SequenceOptions` are only described in the code: see [here](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/event/Sequence.ts#L76)
  - This isn't the only case of this. If the constructor for a class mentions "[object]Options" but doesn't have it documented, it does always link to the definition in the code and that's generally very readable for quick reference.
- The `Filter` class encompasses things like low pass and high pass filters *(this was not obvious to me)*. 
- For controlling volume (e.g. ramp from x to y in a specific shape): `Tone.Gain`. Specifically, the `[Gain obj].gain` property. It has funcs like `rampTo()`, `exponentialRampTo()`...etc that are not well documented.
  - Links: [docs for Gain](https://github.com/Tonejs/Tone.js/blob/dev/Tone/core/context/Param.ts#L64) > [code for Gain constructor](https://github.com/Tonejs/Tone.js/blob/d2d52ffa8803b35debd9f19f2da08ad1c3540de0/Tone/core/context/Gain.ts#L57) > [code for Param internal](https://tonejs.github.io/docs/15.1.22/classes/Gain.html)

### Player class

The `Player` class is used to play back an audio file (like an mp3). For generating and manipulating multiple tones from an audio file, much easier to use a `Sampler`.

- `Player.onstop()` is called whenever the player stops playing, including pauses where it hasn’t reached the end of the track!
  - I am unsure whether `onstop()` is called when the `Transport` pauses as well, or if it's only when the `Transport` is stopped, because I don't think I'd figured out enough about `Transport` to check that when I wrote this down.
- You can access the duration of a Player audio file by going to player.buffer.duration (this is technically documented but it is not clear).

### StackOverflow links
- "Buffer is either not set or not loaded": [this StackOverflow answer](https://stackoverflow.com/a/57527608) seems like the solution, but it's from v13 and for me, it actually *caused* the issue it's trying to solve. This might be because of a weird setup on my end?
  - Avoid this issue is by not chaining Tone classes (e.g. a Sampler and a Panner) that were defined in different scopes.