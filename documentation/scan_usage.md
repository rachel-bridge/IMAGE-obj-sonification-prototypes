# Introduction
This page assumes an understanding of the idea behind these prototypes: see `/documentation/scan_design.md`. For technical details, see `/documentation/scan_technical.md`. All code is found in the folder `/scan/`.

There are three prototypes in this group: static, continuous (interactive), and segmented (interactive). See `guide.md` for descriptions. 

If you want to take a look at this idea, **I strongly recommend using the segmented prototype** (`scan_segmented.js`, `scan.html`). It is by far the most complete of the three, and you should have no issues.

Continuous (`scan_continuous.js`, `scan.html`) has some pretty major problems with timing of backwards playback, and breaking when you reach the end of the sonification. If anything weird happens, **reload the page to reset**. However, it will give you an idea of what that might look like.

The static prototype (`static_prototype/scan_static.js`, `static_prototype/scan_static.html`) was partially updated with breaking changes to the UI before I switched focus to the interactive prototypes. As a result, it might be buggy, and the region selection UI feature doesn't work. Basic playback, and the "hear region individually" buttons, should work as intended. 
Bear in mind that this is an earlier iteration of the idea.

# Opening the prototype UI --- HTML

Set up a localhost (I used the VSCode LiveServer extension) to view the HTML page for the prototype.

There is **one html page for both interactive prototypes**: `/scan/scan.html`. By default, it is linked to `scan_segmented.js`, because that is the more complete prototype. If you wish to see/use the continuous prototype, scroll to the very bottom of the file and swap which `<script>` tag is commented out:
```
<!--UNCOMMENT LINE BELOW FOR "CONTINUOUS" PROTOTYPE: -->
<!-- <script src="scan_continuous.js"></script> -->
<!--UNCOMMENT LINE BELOW FOR "SEGMENTED" PROTOTYPE - default: -->
<script src="scan_segmented.js"></script>
  ```

All code for the static prototype is separate and in **its own subfolder: `scan/static_prototype/`**. The HTML page is `scan_static.html`, and is linked only to `scan_static.js` --- no configuration necessary.

# Default Controls

## Interactive --- Segmented & Continuous
For both interactive prototypes, the default controls to move "up" and "down" through the sonification (i.e. through the picture) are the **up and down arrow keys**. **There is no button** in the UI to control playback.

### Segmented
Single press on up or down arrow moves you up or down a "segment". Spacebar stops and restarts playback on the current segment. 

When you are on a segment, it will play on loop --- see below to disable looping --- until stopped (spacebar). If you are on the "start" or "end", a text-to-voice clip of the word "start" or "end" will play once, followed by silence until you interact again (up/down arrow, spacebar).

### Continuous
Press and hold the up and down arrows to play "up" and "down" the image. Release the key to stop playback, press again to resume from the same point. Since releasing the key stops playback, there is no play/pause control.

Backwards playback has timing issues: it will not start from the same point you stopped. Instead, say you played "up" until 3 seconds into a 9 second sonification, then press and hold the down arrow: it will start playing from 6 seconds into the sonification --- 3 seconds into the sonification *when reversed*.

## Static
The static prototype is controlled by the big yellow button at the top with the play/pause icons. Press that button to play from the beginning (bottom), press again to pause, press again to resume playback. When the sonification reaches the end, it automatically loops back to the beginning.

The static prototype uses pretty basic and clunky HTML `AudioElements` instead of Tone.js, so the timing is not as well-controlled as in the segmented prototype.

There are four buttons immediately below that with the names of regions: click those to hear the stock sound for that region, on its own and unedited. Some of the stock sounds are spatialized (esp. "ground"): they came this way, and I set this up before I remembered I could make them mono. Try to ignore it, I guess...

# Changing settings
The static prototype has no configurable settings. Ease of configuration was more of a concern over time, so segmented is the most configurable.

### Changing the keybinds
Both interactive prototypes (segmented and continuous) have global variables at the top of the JS file (`/scan/scan_segmented.js`, `/scan/scan_continuous.js`) specifying the keybinds. The keyboard input was handled using javascript's built-in Keyboard Events API, and the values of the variables should be set to the **name strings ("values") of the desired key in that API**. Here is a [list of key values](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values#navigation_keys) and a [list of code values](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values) in the API --- the latter may be easier to search through.

The variables are called `TRIGGER_UP` to move up/forward, `TRIGGER_DOWN` to move down/backwards, and `TOGGLE_PLAY` to play/pause in the segmented version.

NOTE: the name of the spacebar is just the space character (`" "`).

## Segmented-only settings
Again, the file for this is `/scan/scan_segmented.js`. 

There is a global variable `NUM_SEGMENTS` which controls how many segments the sonification is split into. It's `4` by default. Set it to any integer (a decimal number would probably work, but I'm not sure why you'd want that).

The global variable `LOOPS` is a boolean value determining whether the playback on a segment loops forever until changed, or plays once and stops. Default is `true`.

## Changing the audio clips
All the files have a list of global variables at the top with the paths to the audio files to play in the appropriate contexts. If you want to make a version of any of them (again, I suggest segmented), change what files/urls those point to --- and probably also the names, they're named after the regions in the one example I made.

```
// region tracks (rendered and example versions) - example-specific
const sky_real_tone = 'audio_tracks/sky-truelen-mono-w.mp3'
const water_real_tone = 'audio_tracks/water-truelen-mono-w.mp3'
const animal_real_tone = 'audio_tracks/animal-truelen-mono-w.mp3'
const ground_real_tone = 'audio_tracks/ground-truelen-mono-w.mp3'

// NOTE: example tones have not had the panning from the source clip removed
const sky_eg_tone = 'audio_tracks/example_tone-sky_wind.mp3'
const water_eg_tone = 'audio_tracks/example_tone-water_lake.mp3'
const animal_eg_tone = 'audio_tracks/example_tone-animal_gallop.mp3'
const ground_eg_tone = 'audio_tracks/example_tone-ground_rocks.mp3'
```

NOTE: the interactive prototypes still have the example tones linked, because I do/did plan to implement the full UI features for those, at which point they'll be needed again.
<!--stackedit_data:
eyJoaXN0b3J5IjpbLTI4NTA1MzUyMywtODMxNTM2MDkwXX0=
-->