# Concept
Past user studies at SRL have shown that BLV users --- especially early-blind users for whom a 2D projection is not intuitive --- find depth information very useful. 

The way IMAGE currently communicates object detection data is playing "labelled" spatialized tones (e.g. "two trees" \*tone\* \*tone\*). The idea for this group of prototypes is to **add depth information to those object tones**.

IMAGE has a depth map generator already, which can presumably be integrated with the object detection schema relatively easily. The spatialization is preserved, although these prototypes use 1D (simple left-right) spatialization for simplicity of execution.

# Prototype list & evolution
There are several prototypes in this group, ordered chronologically below.

1. **Not a prototype on here --- Muffling**:
	In real life, sounds coming from farther away sound different than sounds originating closer to the listener. This prototype just applied effects (*see technical docs*) to the original tone to make it sound intuitively far away.
	Problem: If the object is too far away, the tone risks sounding so distant as to be easy to miss. Avoiding this risks not having enough contrast between tones in the middle distance.
2. **Echoes draft 1 --- Multiple Echoes**:
	Take the similar idea of echolocation: instead of the tone originating from the object, the tones originates with the listener and echoes off the object. The first try at executing this was to have multiple, increasingly "distant" (-sounding) echoes.
	Problem 1: Confusing. The multiple echoes of the same base tone "muddied the waters" on how many objects were present. Exacerbated by the fact that very near objects didn't have an echo at all (inconsistent expectations). 
	Problem 2: Unnecessary loss of nuance. Since "number of echoes" is a discrete quantity, object distances had to be grouped together. Then, objects of different depth but in the same group (say, 0.3 and 0.45 on a scale [0,1]) sound the same distance away
3. **Echoes draft 2 --- Single Echo**:
	Have one echo, and just have it take longer to "come back" (greater time between primary tone and echo) for more distant objects. More distant echoes still have stronger "distancing" effects. *This is the first fully fleshed-out prototype in this group*.
	Problem 1: Still confusing for the same reason, though an improvement.
	Problem 1.5: Preliminary feedback suggested just the time between primary tone and echo (duration of primary tone) was enough to communicate distance.
4. **Duration**:
	Remove the effects to make the echo sound far away, and use a completely different sound at the end of the primary tone, just to clearly mark the duration. Longer primary tone = object farther away.
	Analogy-wise, this builds on the tone "bouncing off" the object, but with a physical object thrown (primary tone) and hitting the object (secondary tone). 
	No problems raised in preliminary feedback, but suggestions were made building on it, which have yet to be implemented. These are:
	1. Add information about the size of the object to the secondary tone. Size as share of the picture.
	2. Play all objects in a semantic category simultaneously (e.g. "5 people", "3 cars" are categories).

# UI considerations
Customizability and interactivity are good things that we should aim for. Here are some ways these are... *planned to be* taken into consideration. None of them are actually implemented in any of the prototypes yet.

### Customizable playback speed
Original idea: ability to change the spacing between object tones (primary-secondary pair).

Requested in feedback: ability to **change the speed of the overall sonification**, including the durations of the primary and secondary tones. Change range of possible durations for primary tone, so relative duration is preserved while speeding up/slowing down overall. 
Different users have different speed preferences, which are also likely to change as they get familiar with this particular program.

### Keyboard-controlled playback
BLV users are more likely to be comfortable with a keyboard than a mouse, and *much* more likely to own one than a haptic device. Have playback started/stopped by keyboard input (as opposed to, e.g. clicking a button).

**TODO**: Ensure the trigger keys do not conflict with common screen reader inputs.

#### Configurable keyboard inputs
In order to make absolutely sure that the trigger keys do not conflict anything in a user's particular setup, let them customize what key triggers play/pause...etc.

The standard way to do this is to have a way to enter "key selection" mode (e.g. click button on screen), and ask the user to click the key they want to set that function to.

### Individually playable tones
Instead of play/pause on a pre-queued playlist of object tones, let users play tones individually. 

e.g. [spacebar] \*object 1 tone\* -> [spacebar] \*object 2 tone\* -> [SHIFT + spacebar] \*object 1 tone\* 

This could allow users to replay particular areas of interest, and also fills a similar function to the customizable playback speed, letting users move through the sonification at their own pace. For the latter point, this should probably still go with the ability to change the overall sonification speed (primary and secondary tone durations).
