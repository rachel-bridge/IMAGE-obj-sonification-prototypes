// JEFF'S VARIATION ON ECHO: SONIFY TRAJECTORY OF BALL HITTING OBJECTS

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
*/

// FILE-GLOBAL VARS
// sonification generation URLs
const D_URL = 'clean_d_str_pick.mp3';
const schema_url = "json_schemas/city_street.json"
// const schema_url = "json_schemas/test.json"

// keybinds
const TOGGLE_PLAY = ' '; //key to toggle play/pause

// sonification timing parameters
const TONE_SPACING = 0.5; //in seconds, time between end of one tone and start of next
const STOP_DURATION = 0.3; //in seconds, how long the "stop" tone lasts

var toneEvents = []; //list of tone event objs used in playback, populate during loading


// SETUP -- GET OBJECT DATA AND GENERATE TONES
// ==== invoked at build ====
const response = await fetch(schema_url);
const jsonData = await response.json(); //json blob from object detection

generateTonesFromObjects(jsonData);
// ==========================


// TONE SETUP FUNCTIONS
// run through object data and create the tone + echo for each one
function generateTonesFromObjects(data) {
  for (const [index, obj] of Object.entries(data)) {
    var objName = `${obj.type}${obj.ID}`;
    var x = obj.centroid[0];
    var depth = obj.depth;
  
    // create the main tone and the panned "stop" tone
    // NOTE: both are the same sound for all objs, multiple instances for unique panning
    var objTone = new Tone.Sampler(
      { D1: D_URL }, //not actually octave 1 but doesn't matter for this
      {
        baseUrl: "audio_tracks/",
        release: 0.3,
      }
    );
    // stop tone doesn't need to be Sampler, but easier if they're the same.
    // its pitch name is totally meaningless, just use same one as object tone
    var stopTone = new Tone.Sampler({
        D1: "audio_tracks/tennis_ball_hit.mp3",
    });
    // set 2D pan using x coordinate of centroid
    var panner = new Tone.Panner(normalizePanX(x));
    // the "stop" tone I picked is pretty loud, bring it down to pull focus away
    var volume = new Tone.Volume(-14)
    // apply those effects to the echo, and the panning to both
    objTone.chain(panner, Tone.Destination);
    stopTone.chain(volume, panner, Tone.Destination);
  
    // save essential info in an event array that can be passed to Part or Sequence
    toneEvents.push({
      name: objName,
      objTone: objTone,
      stopTone: stopTone,
      duration: normalizeDepthToTime(depth),
      time: 0 //set later! as in, literally the next thing...
    });
  }

  // set correct times now that array is fully populated
  setStartTimes();
}

// normalize from centroid x coord on [0, 1] to Tone.Panner input on [-1, 1]
function normalizePanX(x) {
  // function for this in the comment block at the top of the file
  return -1 + 2 * x;
}

// get duration of object tone in seconds, from obj depth num [0,1]
function normalizeDepthToTime(depth) {
  // [0,1] -> [c,d] : f(t) = c + (d-c/1-0) * (t - 0)
  var delay_min = 0.3; //seconds when depth = 0
  var delay_max = 3; //seconds when depth = 1
  return delay_min + (delay_max - delay_min) * depth; //linear
}

// LEAVING THIS IN CASE IT BECOMES USEFUL
// // get volume reduction of "stop" tone in decibels, from depth [0,1]
// // NOTE: this is not meant to be meaningful, but rather to blend the "stop"
// //       tone into the end of the object tone as it decays, and avoid confusion
// // NOTE: the volume is reduced at baseline bc the stock tone is pretty loud
// function normalizeDepthToVolume(depth) {
//   var reduce_min = -9; //decibel change when depth = 0 (min)
//   var reduce_max = -14; //decibel change when depth = 1 (max)
//   return reduce_min + (reduce_max - reduce_min) * depth; //linear
// }

// set the start times for each tone in the toneEvents array
// increase next start time by (this one + its length + echo duration + spacing)
function setStartTimes() {
  var curTime = 0;
  for (var i = 0; i < toneEvents.length; i++) {
    toneEvents[i].time = curTime; //0 when i = 0
    curTime = curTime + toneEvents[i].duration + STOP_DURATION + TONE_SPACING;
  }
}


// KEYBINDINGS / PLAYBACK
document.addEventListener('keydown', handleDown);
// no listener for keyup, since only working w/ single keypresses

function handleDown(e) {
  if (e.key != TOGGLE_PLAY) {
    return;
  }
  if (Tone.getTransport().state == "started") {
    Tone.getTransport().toggle();
    // NOTE: this doesn't stop the playback once it's started, but
    // it at least lets you play it again.
    // TODO: make it stop playback once it's started
  }
  else {
    playAllTones();
    // playbackTester();
  }
}

// play all the tones in sequence, without narration so far
function playAllTones() {
  const tonePart = new Tone.Part(playTone, toneEvents).start(0);
  Tone.getTransport().start();
}

// the callback for the Tone.Part that plays all the tones
// args MUST be (time, value) (API requirement)
function playTone(time, value) {
  // value contains `name` for the 'captioning', not implemented yet
  value.objTone.triggerAttackRelease("D1", value.duration, time);
  value.stopTone.triggerAttackRelease("D1", STOP_DURATION, time + value.duration);
}


// TEST/MISC
// this holds my experimental messing around, you may disregard :)
function playbackTester() {
  const channel1 = new Tone.Channel({
    pan: -0.25
  });
  const channel2 = new Tone.Channel({
    pan: 1
  });

  // basicTone.chain(channel1, Tone.getDestination());
  // basicTone.triggerAttackRelease("D1", 0.5, 0);
  // // basicTone.disconnect(channel1);
  // // basicTone.toDestination()

  // basicTone.chain(channel2, Tone.getDestination());
  // basicTone.triggerAttackRelease("D1", 0.5, 1);
  // // basicTone.disconnect(channel2);
}

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