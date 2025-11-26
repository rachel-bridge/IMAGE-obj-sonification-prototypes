# Concept
**This doc covers design considerations for the "scan" prototypes. For documentation of the technical side of things, see `scan_technical.md`. For usage documentation, see `scan_usage.md`**

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


# Design

Panning: make the source sounds mono before any other editing, b/c having panning built into the sound is confusing whether there's panning in the sonification or not.

This is meant to go alongside the alt-text description.

## Web interface

### Ease of Learning
This design isn't the most intuitive, especially since users\* may be more used to thinking from left-to-right than down-to-up (source: the *one* BLV user we've had look at this so far). To make it easier to parse, users can do the following:

1. Play the unedited sound associated with each region. Literally just play back the stock audio clip that was used in the sonification. No changes made to it except making it mono.
2. Remove and add back regions from the sonification.
e.g. Say the image contains the regions "sky", "water", "animal", "ground". If the "sky" sound is confusing the whole thing for them, a user could play the sonification without that sound. If they want to hear specifically where "animal" is located in the picture, they could mute all but the "animal" region.

At this time, these features are *only* implemented for the static (non-interactive) version. It wouldn't be hard to do it for the interactive versions, I just haven't gotten around to it...

*\*I have a theory that this would be different for users from places where the primary language(s) are written vertically. But this is total conjecture, and largely irrelevant anyway given the expected user base for IMAGE.*

### Layout - UNTESTED!
To work best for screen readers, the page is organized with the most important information at the top and least important at the bottom. All of this is by my own (Rachel's) best judgement or feedback from sighted lab members: *no user tests have been conducted to determine the actual relevance of each feature*.

The instructions are collapsible by interacting with a button, because I figured users would probably be accessing the page multiple times per day and clicking past the instructions every time would be annoying. The button is at the bottom for the same reason.

The buttons to play the individual sounds was judged most important, because it's the first thing users are likely to go to to better understand the sonification.

The "play all regions" vs "play these selected regions: [...]" toggle is next: it's less useful for basic understanding of the sonification, or at least not the first thing people would go for (again, per my best judgement not per user tests).

In the static (non-interactive) version, the "Play/Pause" button is at the top. In the interactive versions, play/pause is activated through the keyboard, so there is no representation of it on the page.

## Interactive controls

In the original prototype, users could control what was in it as described above, but could only play the sonification from start to finish.

Two different versions of interactivity have since been implemented, both of which allow people to play a section multiple times or go backwards (top to bottom).
1. Continuous playback (`scan/scan_continuous.js`)
2. Sonification broken into sections, which users can move through (`scan/scan_segmented.js`)

Both of these use the keyboard. The assumption was that BLV users are likely most comfortable w/ keyboard controls.

### Continuous playback prototype

