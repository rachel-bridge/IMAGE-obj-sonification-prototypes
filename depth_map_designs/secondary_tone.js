// PRIMARY TONE FOR GROUNDING + SECONDARY TONE W/ 3D SPATIALIZATION INFO

/*
IDEA:
Like the echo idea, but the "echo" has no additional processing, and
serves only to reinforce how long the initial tone is.

LIMITATIONS:
- not configurable from the web page (need to edit code)
- no narration/labelling of tones

DEPENDENCIES:
- Tone.js v15.1.22 (any v15 would work)
- KeyboardEvents API (https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent)
- https://github.com/Shared-Reality-Lab/IMAGE-server/blob/2945b52da77bf74b1307e7e2286c6297ebef6157/preprocessors/object-detection.schema.json

schema - toneEvents, ungrouped:
list of objects w/ this schema...
{
  "name" (string): name of the object (not currently used),
  "primaryTone"(Sampler): the main tone generator,
  "secondaryTone" (Sampler): the echo tone generator,
  "offset" (number): number of seconds b/w start of main tone and start of echo tone,
  "time" (TransportTime): start time of the main tone for this object
}
schema - toneEvents, grouped:
list of objects w/ this schema...
{
  "name" (string): name of the semantic category (not currently used),
  "primaryTones"(Sampler list): the main tone generators,
  "secondaryTones" (Sampler list): the echo tone generators,
  "offset" (number list): number of seconds b/w start of main tone and start of echo tones,
  "time" (TransportTime): start time of the main tones for this object
}
*/

// FILE-GLOBAL VARS
// version control
// T to play tones in one semantic category at once, F to play tones individually
const GROUP_TONES = true;
// T to put the 'distancing' effects on the secondary tones so they sound like
// echoes, F to have just the raw sound in the secondary tone.
const ECHOLOCATION_MODE = true;

// sonification generation URLs
const D_URL = "clean_d_str_pick.mp3";
const SECONDARY_URL = "tennis_ball_hit.mp3";
const schema_url = "json_schemas/city_street.json"
// const schema_url = "json_schemas/test.json"

// keybinds
const TOGGLE_PLAY = ' '; //key to toggle play/pause

// sonification timing parameters
const TONE_SPACING = 0.3; //in seconds, time between end of one tone and start of next
const SECONDARY_DURATION = 0.14; //in seconds, how long the secondary tone lasts

var toneEvents = []; //list of tone event objs used in playback, populate during loading
var toneGroupEvents = []


// SETUP -- GET OBJECT DATA AND GENERATE TONES
// ==== invoked at build ====
const response = await fetch(schema_url);
const jsonData = await response.json(); //json blob from object detection

if (GROUP_TONES) { // grouped by category
  generateToneGroupsFromObjects(jsonData);
} else { // played individually
  generateTonesFromObjects(jsonData);
}
// ==========================


// TONE SETUP FUNCTIONS
// run through object data and create the tone + echo for each one
function generateTonesFromObjects(data) {
  for (const obj of Object.values(data)) {
    var objName = `${obj.type}${obj.ID}`;
    var x = obj.centroid[0];
    var depth = obj.depth;
  
    // create the main tone and secondary tones
    // NOTE: both are the same sound for all objs, multiple instances for unique panning
    var primary = new Tone.Sampler(
      { D1: D_URL }, //not actually octave 1 but doesn't matter for this
      {
        baseUrl: "audio_tracks/",
        release: 0.3,
      }
    );
    // secondary tone doesn't need to be Sampler, just easier if they're the same.
    // its pitch name is totally meaningless, just use same one as primary tone
    var secondary = new Tone.Sampler({
        D1: "audio_tracks/" + SECONDARY_URL,
    });
    // Set 2D pan using x coordinate of centroid. It gets sent to destination
    // automatically because it's always the last thing in the chain regardless
    // of other effects.
    var panner = new Tone.Panner(normalizePanX(x)).toDestination();

    // Add only the panning effect to the primary tone.
    primary.connect(panner);

    // Apply panning and additional effects to the secondary tone, additional
    // effects depending on mode (echolocation vs duration-only).
    if (ECHOLOCATION_MODE) {
      const echo_effects = createEcholocationEffects(depth);
      secondary.chain(echo_effects[0], echo_effects[1], panner);
    } else { // duration-only mode
      // the secondary tone is pretty loud, reduce vol to pull focus away
      const volume = new Tone.Volume(-14);
      secondary.chain(volume, panner, Tone.getDestination());
    }
  
    // save essential info in an event array that can be passed to Part or Sequence
    toneEvents.push({
      name: objName,
      category: obj.type,
      primaryTone: primary,
      primaryDuration: normalizeDepthToTime(depth),
      secondaryTone: secondary,
      time: 0 //set later! as in, literally the next thing...
    });
  }

  // set correct times now that array is fully populated
  setStartTimes(toneEvents);
}

// repeat of generateTonesFromData but for GROUP_TONES = true.
function generateToneGroupsFromObjects(data) {
  for (const toplvl_obj of Object.values(data)) {
    // If obj is of a semantic category that's already been covered, skip it.
    if (toneGroupEvents.map((x) => x.groupName).includes(toplvl_obj.type)) {
      continue;
    }
    // Get all the objects in this semantic category (group).
    const objects = Object.values(data).filter((x) => x.type == toplvl_obj.type);
    // Create the primary (group-wide) tone.
    var primary = new Tone.Sampler({
      urls: { D1: D_URL }, //not actually octave 1 but doesn't matter for this
      baseUrl: "audio_tracks/",
      release: 0.3,
    }).toDestination();
    // Start lists of the secondary tones and their offsets.
    var secondaryTones = [];
    var offsets = [];

    // Now iterate over the semantic category (group) objects.
    for (const obj of objects) {
      var x = obj.centroid[0];
      var depth = obj.depth;

      // Create the secondary (object-specific) tone for this group. Reduce
      // the volume bc the sound I grabbed for this is kinda loud.
      var secondary = new Tone.Sampler({
        urls: { D1: "audio_tracks/" + SECONDARY_URL }
      });
      // Get the pan for this object, using x coordinate of centroid.
      const pan = normalizePanX(x);
      // Create the panner object for the secondary tone and connect it.
      // Panner gets sent to destination automatically because it's always
      // the last thing in the chain regardless of other effects.
      const panner = new Tone.Panner(pan).toDestination();

      // Connect panning to secondary tone, along with additional effects
      // as mode (echo vs duration-only) demands.
      if (ECHOLOCATION_MODE) {
        const echo_effects = createEcholocationEffects(depth);
        secondary.chain(echo_effects[0], echo_effects[1], panner);
      } else { // duration-only mode
        secondary.connect(panner);
      }

      // Add this tone and it's depth-based offset to the lists.
      secondaryTones.push(secondary);
      offsets.push(normalizeDepthToTime(depth));
    }

    toneGroupEvents.push({
      groupName: toplvl_obj.type,
      primaryTone: primary,
      primaryDuration: Math.max(...offsets), // has to last until the last sec. tone
      secondaryTones: secondaryTones,
      offsets: offsets,
      time: 0 // set in next step
    });
  }

  // set correct times now that array is fully populated
  setGroupStartTimes(toneGroupEvents);
}

// set the start times for each tone in the toneEvents array
// increase next start time by (this one + its length + secondary tone duration + spacing)
function setStartTimes(tonesArray) {
  var curTime = 0;
  for (var i = 0; i < tonesArray.length; i++) {
    tonesArray[i].time = curTime; //0 when i = 0
    curTime = curTime + tonesArray[i].primaryDuration + SECONDARY_DURATION + TONE_SPACING;
  }
}

// Create the effects that are specific to "echolocation" mode, i.e. the
// effects designed to make the secondary tone sound far away. Return them.
function createEcholocationEffects(depth) {
  var r_decay, r_wet = normalizeDepthToReverb(depth);
  var reverb = new Tone.Reverb({
    decay: r_decay,
    wet: r_wet
  });
  var lowPassFilter = new Tone.Filter({
    type: "lowpass",
    frequency: normalizeDepthToFilter(depth)
  });
  return [reverb, lowPassFilter];
}

// normalize from centroid x coord on [0, 1] to Tone.Panner input on [-1, 1]
function normalizePanX(x) {
  // function for this in the comment block at the top of the file
  return -1 + 2 * x;
}

// get offset of secondary tone start time, in secs, from obj depth num [0,1]
function normalizeDepthToTime(depth) {
  // [0,1] -> [c,d] : f(t) = c + (d-c/1-0) * (t - 0)
  var delay_min = 0.3; //seconds when depth = 0
  var delay_max = 2; //seconds when depth = 1
  return delay_min + (delay_max - delay_min) * depth; //linear
}

// get the params for reverb (`decay`, `wet`) from obj depth num [0,1]
function normalizeDepthToReverb(depth) {
  var decay_min = 0.5; //seconds, when depth = 0
  var decay_max = 5; //seconds, when depth = 1
  var decay = decay_min + (decay_max - decay_min) * depth;

  var wet_min = 0.5; //wet-dry balance when depth = 0
  var wet_max = 0.96; //wet-dry balance when depth = 1
  var wet = wet_min + (wet_max - wet_min) * depth;

  return decay, wet;
}

// get the cutoff frequency of the low pass filter from obj depth num [0,1]
function normalizeDepthToFilter(depth) {
  // I went on desmos until I got a func that looked the right shape... see docs
  var freq_min = 1050; //Hz when depth = 0
  var freq = freq_min + Math.pow((-9 * depth + 9.5), 3.5);
  // ^sets max cutoff ~3600, but want no discernible EQ on extremely close objs
  if (depth < 0.05) {
    freq = 6000
  }
  return freq;
}

// // LEAVING THIS IN CASE IT BECOMES USEFUL
// // get volume reduction of secondary tone in decibels, from depth [0,1]
// // NOTE: this is not meant to be meaningful, but rather to blend the secondary
// //       tone into the end of the primary tone as it decays, and avoid confusion
// // NOTE: the volume is reduced at baseline bc the stock tone is pretty loud
// function normalizeDepthToVolume(depth) {
//   var reduce_min = -9; //decibel change when depth = 0 (min)
//   var reduce_max = -14; //decibel change when depth = 1 (max)
//   return reduce_min + (reduce_max - reduce_min) * depth; //linear
// }


// // convert toneEvents array to the right format for grouping
// function groupToneEvents() {
//   var newToneEvents = [];

//   // for every element of toneEvents, check its category
//   for (var category of toneEvents.map((x) => x.category)) {
//     // if it's one we've already dealth with, skip
//     if (newToneEvents.map((obj) => obj.groupName).includes(category)) {
//       continue;
//     }
//     // else, get *all elements* of toneEvents that are of that category
//     const cat_objs = toneEvents.filter((obj) => obj.category == category);
//     newToneEvents.push({
//       groupName: category,
//       primaryTone: cat_objs.map((obj) => obj.primaryTone)[0], //only use the 1st primary tone!
//       primaryDuration: Math.max(...cat_objs.map((obj) => obj.offset)),
//       secondaryTones: cat_objs.map((obj) => obj.secondaryTone),
//       offsets: cat_objs.map((obj) => obj.offset),
//       time: 0 // set start time later!
//     })
//   }

//   return newToneEvents;
// }


// KEYBINDINGS / PLAYBACK
document.addEventListener('keydown', handleDown);
// no listener for keyup, since only working w/ single keypresses

function handleDown(e) {
  if (e.key != TOGGLE_PLAY) {
    return;
  }
  if (Tone.getTransport().state == "started") {
    Tone.getTransport().toggle();
  }
  else {
    // play all the tones in sequence, without narration so far
    if (GROUP_TONES) {
      const tonePart = new Tone.Part(playToneGroup, toneGroupEvents).start(0);
    } else {
      const tonePart = new Tone.Part(playTone, toneEvents).start(0);
    }
    Tone.getTransport().start();
  }
}

// callback for the Tone.Part that plays tones: tones play individually
// args MUST be (time, value) (API requirement)
function playTone(time, value) {
  // value contains `name` for the 'captioning', not implemented yet
  value.primaryTone.triggerAttackRelease("D1", value.primaryDuration, time);
  value.secondaryTone.triggerAttackRelease("D1", SECONDARY_DURATION, time + value.primaryDuration);
}

// callback for the Tone.Part that plays tones: tones grouped by semantic category
function playToneGroup(time, value) {
  // value contains `groupName` for the 'captioning', not implemented yet
  value.primaryTone.triggerAttackRelease("D1", value.primaryDuration, time);
  for (var i = 0; i < value.secondaryTones.length; i++) {
    value.secondaryTones[i].triggerAttackRelease("D1", SECONDARY_DURATION, time + value.offsets[i])
  }
}


// TEST/MISC
// this holds my experimental messing around, you may disregard :)
// LICENSING NOTE: some of the code in this block may be copied directly from
// the Tone.js documentation examples.
// function playbackTester() {
//   const channel1 = new Tone.Channel({
//     pan: -0.25
//   }).toDestination();
//   const channel2 = new Tone.Channel({
//     pan: 1
//   }).toDestination();
//   console.log(channel1.numberOfInputs)
//   console.log(channel1.numberOfOutputs)

//   // const autoPanner = new Tone.AutoPanner({depth: 1, frequency: 2}).toDestination().start();
//   // basicTone.connect(autoPanner);

//   const panner1 = new Tone.Panner(-1).toDestination();
//   const panner2 = new Tone.Panner(-1).toDestination();

//   const signal1 = new Tone.Signal({
//       value: 0,
//       units: "number"
//   }).connect(panner1.pan);
//   signal1.rampTo(-1, 1.75);
//   const signal2 = new Tone.Signal({
//       value: 0,
//       units: "number"
//   }).connect(panner2.pan);
//   signal2.rampTo(1, 1);

//   const split = new Tone.Split(4)


//   tone1.connect(split, 0, 0)
//   tone2.connect(split, 0, 0)

//   split.connect(panner1, 1, 0)
//   split.connect(panner2, 2, 0)

//   tone1.triggerAttackRelease("D1", 2);
//   tone2.triggerAttackRelease("D1", 2);
// }

// const tone1 = new Tone.Sampler({
//   urls: {D1: 'audio_tracks/clean_d_str_pick.mp3'}
// });
// const tone2 = new Tone.Sampler({
//   urls: {D1: 'audio_tracks/clean_d_str_pick.mp3'}
// });
// const basicTone = new Tone.Sampler({
//   urls: {
//       D1: 'audio_tracks/clean_d_str_pick.mp3',
//   },
//   release: 0.3,
//   onload: () => {
//     // console.log('pluck loaded')
//     // basicTone.triggerAttackRelease("D1", 0.6);
//   }
// });

// const sampler = new Tone.Sampler(
//   {
//     A1: "audio_tracks/tennis_ball_hit.mp3",
//     D1: 'audio_tracks/clean_d_str_pick.mp3'
//   }
// ).toDestination();

// document.querySelector("button").addEventListener("click", () => {
//   sampler.triggerAttackRelease("A1", 0.5, 1);
//   sampler.triggerAttackRelease("D1", 1, 0);
// });
