// NEW VERSION OF THE JS BREAKING THE SONIFICATION UP INTO SLICES
// STILL USING TONE.JS API

/*
ASSUMPTIONS:
- actions are done on `PLAYERS` together, so can check PLAYERS[0] and assume
  that holds for all of them
*/

// FILE-GLOBAL VARS
// reference global vars: these are just defaults, and are editable
const TRIGGER_UP = 'ArrowUp';
const TRIGGER_DOWN = 'ArrowDown';
const TOGGLE_PLAY = ' '; //space
var NUM_SEGMENTS = 4; //int, number of segments to divide the sonification into
var LOOPS = true; //bool, whether each segment loops or just plays once

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

// init start and end tone Player objs (unsynced w/ TransportTime)
// "start" = segment 0
const startPlayer = new Tone.Player('audio_tracks/start.mp3').toDestination();
// "end" = segment NUM_SEGMENTS + 1
const endPlayer = new Tone.Player('audio_tracks/end.mp3').toDestination();

// region mapper - example-specific
// NOTE: the 'true' refers to checkbox.checked, keeping compatibility w/
// reintroducing that "select regions to play" feature later
var regions_to_play = {
  sky: [sky_real_tone, true],
  water: [water_real_tone, true],
  animal: [animal_real_tone, true],
  ground: [ground_real_tone, true]
}
var sgmt_tracker = 0; //start at 'start' = 0
const PLAYERS = initSounds();


// SETUP FUNCS
// init Player and Channel objs for region tones
function initSounds() {
  var players = [];
  for (const [region, attrs] of Object.entries(regions_to_play)) {
    if (!attrs[1]) { //if not selected for play, skip
      continue;
    }
    const player = new Tone.Player({
      url: attrs[0],
      loop: true, // it breaks after 1 playthrough if this is not set
    });
    if (LOOPS) {
      player.sync().start(0);
    }
    player.name = region; //set name to region name

    const channel = new Tone.Channel().toDestination();
    player.connect(channel);

    players.push(player); //maintain list of active players
  }
  return players;
}


// KEYBINDINGS / PLAYBACK
document.addEventListener('keydown', handleDown);
// document.addEventListener('keyup', handleUp); //not used atm :/

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
      sonify(false, true); //val of movingUp doesn't matter, repeating = true
    }
  }
  // moving up (initial keypress)
  if (e.key == TRIGGER_UP) {
    sonify(true); //movingUp = true
  }
  // moving down (initial keypress)
  if (e.key == TRIGGER_DOWN) {
    sonify(false); //movingUp = false
  }
}

// *not used at the moment* -- we only care abt individual keypresses
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
  // START TONE
  if (sgmt_tracker <= 0) {
    toggleMute(true);
    startPlayer.start();
  }
  // END TONE
  else if (sgmt_tracker > NUM_SEGMENTS) {
    toggleMute(true);
    endPlayer.start();
  }
  // ACTUAL SONIFICATION - "REGIONS"
  else {
    toggleMute(false); //unmute, just in case last key was 'play/pause'
    playRegions(sgmt_tracker)
  }
}

function playRegions(sgmt_tracker) {
  // segment length (duration) computed here bc player buffers not init'ed right away
  var duration = PLAYERS[0].buffer.duration / NUM_SEGMENTS;
  var offset = (sgmt_tracker - 1) * duration; //start playing from this point in the tracks

  for (var i = 0; i < PLAYERS.length; i++) {
    if (LOOPS) {
      PLAYERS[i].loopStart = offset;
      PLAYERS[i].loopEnd = offset + duration;
    }
    else {
      PLAYERS[i].start(0, offset, duration); //start playback as soon as indicated
    }
  }
  Tone.getTransport().start(); //start playback
  // if not looping, stop player after `duration` so that play/pause works right
  if (!LOOPS) {
    Tone.getTransport().stop(Tone.now() + duration);
  }
}

function toggleMute(targetSetting) {
  if (PLAYERS[0].mute != targetSetting) {
    for (var i = 0; i < PLAYERS.length; i++) {
      PLAYERS[i].mute = targetSetting;
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