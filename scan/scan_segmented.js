// NEW VERSION OF THE JS BREAKING THE SONIFICATION UP INTO SLICES
// STILL USING TONE.JS API

/*
ASSUMPTIONS:
- actions are done on `players` together, so can check players[0] and assume
  that holds for all of them
*/

// FILE-GLOBAL VARS
// reference global vars: these are just defaults, and are editable
const MOVE_UP = 'ArrowUp';
const MOVE_DOWN = 'ArrowDown';
const TOGGLE_PLAY = ' '; //space
var NUM_SEGMENTS = 4;
var LOOPS = true;

// start, end pings - constant
const START_PING = 'audio_tracks/start.mp3' //segment 0
const END_PING = 'audio_tracks/end.mp3' //segment NUM_SEGMENTS + 1

// region tracks (rendered and example versions) - example-specific
const sky_real_ping = 'audio_tracks/sky-truelen-mono-w.mp3'
const water_real_ping = 'audio_tracks/water-truelen-mono-w.mp3'
const animal_real_ping = 'audio_tracks/animal-truelen-mono-w.mp3'
const ground_real_ping = 'audio_tracks/ground-truelen-mono-w.mp3'

// NOTE: example tones have not had the panning from the source clip removed
const sky_eg_ping = 'audio_tracks/example_tone-sky_wind.mp3'
const water_eg_ping = 'audio_tracks/example_tone-water_lake.mp3'
const animal_eg_ping = 'audio_tracks/example_tone-animal_gallop.mp3'
const ground_eg_ping = 'audio_tracks/example_tone-ground_rocks.mp3'

// region mapper - example-specific
// NOTE: the 'true' refers to checkbox.checked, keeping compatibility w/
// reintroducing that "select regions to play" feature later
var regions_to_play = {
  sky: [sky_real_ping, true],
  water: [water_real_ping, true],
  animal: [animal_real_ping, true],
  ground: [ground_real_ping, true]
}
var players = [];
var sgmt_tracker = 0; //start at 'start' = 0


// SETUP
// init Player and Channel objs for region tones
for (const [region, attrs] of Object.entries(regions_to_play)) {
  const channel = new Tone.Channel().toDestination();
  const player = new Tone.Player({
    url: attrs[0],
    loop: true, // it breaks after 1 playthrough if this is not set
  });
  if (LOOPS) {
    player.sync().start(0);
  }
  player.name = region; //set name to region name
  player.connect(channel);

  players.push(player); //maintain list of active players
}
// init start and end tone Player objs
// unsynced w/ TransportTime rn...
const startPlayer = new Tone.Player(START_PING).toDestination();
const endPlayer = new Tone.Player(END_PING).toDestination();


// KEYBINDINGS
document.addEventListener('keydown', handleDown);
document.addEventListener('keyup', handleUp);

function handleDown(e) {
  // if user holding down key, do nothing w/ keypresses after first
  if (e.repeat) {
    return;
  }
  // play/pause
  else if (e.key == TOGGLE_PLAY) {
    var transport = Tone.getTransport();
    // the sounds have been queued, so the only way to stop them is to just
    // mute playback. It's not elegant, but I did make it so it can't be unmuted
    // by anything except stuff that overrides it, so user shouldn't notice.
    if (transport.state == 'started') {
      toggleMute(true);
      Tone.getTransport().stop();
    }
    else if (transport.state == 'stopped') {
      sonify(false, true); //val of movingUp doesn't matter
    }
  }
  // moving up (initial keypress)
  if (e.key == MOVE_UP) {
    sonify(true);
  }
  // moving down (initial keypress)
  if (e.key == MOVE_DOWN) {
    sonify(false);
  }
}

function handleUp(e) {
  return;
}

// helper function to play START and END at appropriate times
function sonify(movingUp, repeating = false) {
  // increment before playing unless outside bounds (start/end)
  if (!repeating
      && ((sgmt_tracker > 0 && !movingUp)
          || (sgmt_tracker <= NUM_SEGMENTS && movingUp))) {
    movingUp ? sgmt_tracker++ : sgmt_tracker--;
  }
  // START PING
  if (sgmt_tracker <= 0) {
    toggleMute(true);
    startPlayer.start();
  }
  // END PING
  else if (sgmt_tracker > NUM_SEGMENTS) {
    toggleMute(true);
    endPlayer.start();
  }
  // ACTUAL SONIFICATION - "REGIONS"
  else {
    toggleMute(false); //unmute, just in case last key was 'play/pause'
    playRegions()
  }
}

function playRegions() {
  // segment length (duration) computed here bc player buffers not init'ed right away
  var duration = players[0].buffer.duration / NUM_SEGMENTS;
  var offset = (sgmt_tracker - 1) * duration; //start playing from this point in the tracks

  for (var i = 0; i < players.length; i++) {
    if (LOOPS) {
      players[i].loopStart = offset;
      players[i].loopEnd = offset + duration;
    }
    else {
      players[i].start(0, offset, duration); //start playback as soon as indicated
    }
  }
  Tone.getTransport().start(); //start playback
  // if not looping, stop player after `duration` so that play/pause works right
  if (!LOOPS) {
    Tone.getTransport().stop(Tone.now() + duration);
  }
}

function toggleMute(targetSetting) {
  if (players[0].mute != targetSetting) {
    for (var i = 0; i < players.length; i++) {
      players[i].mute = targetSetting;
    }
  }
}


// HTML UTILITY
// toggle display of region selector checkboxes
function toggleRegionSelect() {
  var toToggle = document.getElementById("checkboxes");
  if (document.getElementById("play-selected").checked) {
    toToggle.style.display = "block";
  } else {
    toToggle.style.display = "none";
  }
}

// toggle display of instructions
function toggleText() {
  var text = document.getElementById("instructions");
  if (text.style.display === "none") {
    text.style.display = "block";
  } else {
    text.style.display = "none";
  }
}