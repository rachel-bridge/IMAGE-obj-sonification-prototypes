# Overview
**This doc covers design considerations for the "scan" prototypes. For documentation of the technical side of things, see `scan_technical.md`. For usage documentation, see `scan_usage.md`**

This design is meant to go alongside the alt-text description, replacing only the sonification of objects/regions in the current IMAGE design.

Main components:
1. Representing height. Focuses on the vertical composition of the picture: relies heavily on the picture being a 2D projection. Therefore, this design is likely to be more useful to late-blind users (past SRL user studies show late-blind people find 2D projections much more intuitive).
2. Use sounds that might go with the semantic regions in real life (sound of waves for water, heartbeat for animal/person...etc). Hopefully, this gives users a richer experience.


## Concept
Each of the regions in this image has an associated sound. Imagine a bar scanning over the image from bottom to top: the sound of a region plays when that region is present under that bar. The volume of the sound is proportional to how much of image it takes up under that bar.

&nbsp;&nbsp;&nbsp;&nbsp;e.g. If the sound for "water" and the sound for "rock" are playing at equal volumes, the image at that height is about half water and half rock.
&nbsp;&nbsp;&nbsp;&nbsp;e.g. If a sound plays for the first quarter of the total sonification and then disappears, that region is only present in the bottom quarter of the image

*If you've ever played the demo for sheet music online and seen the line moving across it to track the place, that's where I got the idea. [Video example](https://www.youtube.com/watch?v=NWEVKyEwi4A&list=PLhkgFCE9DX4PplwDyQrNN_XTedppjjiry&index=1).*

## Limitations
- (Probably!! Not tested!!) mainly useful for late-blind people.
- Finding sounds to represent the regions is *hard*, even with these being long tones and not short sound IDs.
- This is not an intuitive design: I did my best with the instructions and making the experience customizable and parse-able, but there's still some amount of learning curve.


# Web interface

## Ease of Learning
This design isn't the most intuitive, especially since users\* may be more used to thinking from left-to-right than down-to-up (source: the *one* BLV user we've had look at this so far). To make it easier to parse, users can do the following:

1. Play the unedited sound associated with each region. Literally just play back the stock audio clip that was used in the sonification. No changes made to it except making it mono.
2. Remove and add back regions from the sonification.
e.g. Say the image contains the regions "sky", "water", "animal", "ground". If the "sky" sound is confusing the whole thing for them, a user could play the sonification without that sound. If they want to hear specifically where "animal" is located in the picture, they could mute all but the "animal" region.

At this time, these features are *only* implemented for the static (non-interactive) version. It wouldn't be hard to do it for the interactive versions, I just haven't gotten around to it...

*\*I have a theory that this would be different for users from places where the primary language(s) are written vertically. But this is total conjecture, and largely irrelevant anyway given the expected user base for IMAGE.*

## Layout - UNTESTED!
To work best for screen readers, the page is organized with the most important information at the top and least important at the bottom. All of this is by my own (Rachel's) best judgement or feedback from sighted lab members: *no user tests have been conducted to determine the actual relevance of each feature*.

The instructions are collapsible by interacting with a button, because I figured users would probably be accessing the page multiple times per day and clicking past the instructions every time would be annoying. The button is at the bottom for the same reason.

The buttons to play the individual sounds was judged most important, because it's the first thing users are likely to go to to better understand the sonification.

The "play all regions" vs "play these selected regions: [...]" toggle is next: it's less useful for basic understanding of the sonification, or at least not the first thing people would go for (again, per my best judgement not per user tests).

In the static (non-interactive) version, the "Play/Pause" button is at the top. In the interactive versions, play/pause is activated through the keyboard, so there is no representation of it on the page.

# Interactivity

In the original prototype, users could control what was in it as described above, but could only play the sonification from start to finish.

A piece of feedback during the design process was that interactivity and users' control over the sonification are important.

Two different versions of interactivity have since been implemented, both of which allow users to play backwards (top to bottom) or revisit a specific section.
1. Continuous playback (`scan/scan_continuous.js`)
2. Sonification broken into sections, which users can move through (`scan/scan_segmented.js`)

Both of these are controlled via keyboard inputs. The assumption was that BLV users are likely most comfortable w/ keyboard controls.
