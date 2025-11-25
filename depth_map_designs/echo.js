// JS FOR THE DEPTH-MAP ECHO IDEA - ONE ECHO W/ MORE DISTACE = MORE DELAY

/*
IDEA:
Like the depth muffle idea, but the first tone is always clear and just
has an echo. The echo takes longer to sound and sounds "farther", the
greater the depth of the object.

USEFUL NOTES:
- map interval [a,b] -> [c,d] : f(t) = c + (d-c/b-a) * (t - a)
  https://math.stackexchange.com/questions/914823/shift-numbers-into-a-different-range
- depth is normalized to [0,1] where 0 is closest and 1 is farthest!
- if you open the console while running this, you'll see a bajillion
  of the following warning:
    "An AudioContext was prevented from starting automatically. It must
     be created or resumed after a user gesture on the page."
  This just means that the sounds don't autoplay on load. It's on purpose!

LIMITATIONS:
- not configurable from the web page (need to edit code)
- no narration/labelling of tones

DEPENDENCIES:
- Tone.js v15.1.22 (any v15 would work)
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
const TONE_SPACING = 0.5; //in seconds, shouldn't be less than max delay
const ECHO_DURATION = 0.7; //in seconds, how long the echoes last

var toneEvents = []; //list of tone event objs used in playback, populate during loading


// SETUP -- GET OBJECT DATA AND GENERATE TONES
// ==== invoked at build ====
const response = await fetch(schema_url);
const jsonData = await response.json(); //json blob from object detection

generateTonesFromObjects(jsonData);
setStartTimes();
// ==========================


// TONE SETUP FUNCTIONS
// run through object data and create the tone + echo for each one
function generateTonesFromObjects(data) {
  for (const [index, obj] of Object.entries(data)) {
    var objName = `${obj.type}${obj.ID}`;
    var x = obj.centroid[0];
    var depth = obj.depth;
    // create the main tone and echo samplers: diff objs bc diff effects on them
    // NOTE: the main tone is identical for all: unique objs bc different panning
    var newTone = new Tone.Sampler({
      urls: {
          D1: D_URL, //not actually octave 1 but doesn't matter for this
      },
      baseUrl: "audio_tracks/",
      release: 0.3,
    });
    var echo = new Tone.Sampler({
      urls: {
          D1: D_URL,
      },
      baseUrl: "audio_tracks/",
      release: 0.5, //longer release for the echo
    });
    // set 2D pan using x coordinate of centroid
    var panner = new Tone.Panner(normalizePanX(x));
    // find the time between the intial tone and the echo
    var delayTime = normalizeDepthToDelay(depth)
    // create effects for the echo
    var r_decay, r_wet = normalizeDepthToReverb(depth);
    var reverb = new Tone.Reverb({
      decay: r_decay,
      wet: r_wet
    });
    var lowPassFilter = new Tone.Filter({
      type: "lowpass",
      frequency: normalizeDepthToFilter(depth)
    });
    // apply those effects to the echo, and the panning to both
    newTone.chain(panner, Tone.Destination);
    echo.chain(reverb, lowPassFilter, panner, Tone.Destination)

    // save essential info in an event array that can be passed to Part or Sequence
    toneEvents.push({
      name: objName,
      tone: newTone,
      echo: echo,
      echoDelay: delayTime,
      time: 0 //set later! as in, literally the next thing...
    });
  }
}

// normalize from centroid x coord on [0, 1] to Tone.Panner input on [-1, 1]
function normalizePanX(x) {
  // function for this in the comment block at the top of the file
  return -1 + 2 * x;
}

// get echo delay time in seconds, from obj depth num [0,1]
function normalizeDepthToDelay(depth) {
  // [0,1] -> [c,d] : f(t) = c + (d-c/1-0) * (t - 0)
  var delay_min = 0.01; //seconds when depth = 0
  var delay_max = 3; //seconds when depth = 1
  return delay_min + (delay_max - delay_min) * depth;
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
  var freq_min = 950; //Hz when depth = 0
  var freq = freq_min + Math.pow((-9 * depth + 9.5), 3.5);
  // ^sets max cutoff ~3600, but want no discernible EQ on extremely close objs
  if (depth < 0.05) {
    freq = 6000
  }
  return freq;
}

// set the start times for each tone in the toneEvents array
// increase next start time by (this one + its length + echo duration + spacing)
function setStartTimes() {
  var curTime = 0;
  for (var i = 0; i < toneEvents.length; i++) {
    toneEvents[i].time = curTime;
    curTime = curTime + toneEvents[i].echoDelay + ECHO_DURATION + TONE_SPACING;
  }
}


// KEYBINDING
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
    const tonePart = new Tone.Part(playTone, toneEvents).start(0);
    Tone.getTransport().start();
  }
}

// the callback for the Tone.Part that plays all the tones
// args MUST be (time, value) (API requirement)
function playTone(time, value) {
  // value contains `name` for the 'captioning', not implemented yet
  var duration = value.echoDelay < 0.4 ? 0.4 : value.echoDelay;
  value.tone.triggerAttackRelease("D1", duration, time);
  value.echo.triggerAttackRelease("D1", ECHO_DURATION, time + value.echoDelay);
}


// TEST/MISC
// this holds my experimental messing around, you may disregard :)
// function playbackTester() {
//   const basicTone = new Tone.Sampler({
//     urls: {
//         D1: D_URL,
//     },
//     baseUrl: "audio_tracks/",
//     release: 0.3,
//   }).toDestination();
//   // const freeverb = new Tone.Freeverb().toDestination();
//   // freeverb.dampening = 1000;
//   // basicTone.connect(freeverb);
//   // basicTone.triggerAttackRelease("D1", 0.9);

//   // const vol1 = new Tone.Volume(-20).toDestination();
//   // const osc = new Tone.Oscillator().connect(vol1).start(0);
//   // console.log(tones)
//   // tones[1].triggerAttackRelease("D1", 0.8)
// }