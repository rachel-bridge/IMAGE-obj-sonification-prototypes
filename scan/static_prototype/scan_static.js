const start_ping = new Audio('audio_tracks/start.mp3')
const stop_ping = new Audio('audio_tracks/stop.mp3')

const sky_real_ping = new Audio('audio_tracks/sky-truelen-mono-w.mp3');
const water_real_ping = new Audio('audio_tracks/water-truelen-mono-w.mp3');
const animal_real_ping = new Audio('audio_tracks/animal-truelen-mono-w.mp3');
const ground_real_ping = new Audio('audio_tracks/ground-truelen-mono-w.mp3');

const sky_eg_ping = new Audio('audio_tracks/example_tone-sky_wind.mp3');
const water_eg_ping = new Audio('audio_tracks/example_tone-water_lake.mp3');
const animal_eg_ping = new Audio('audio_tracks/example_tone-animal_gallop.mp3');
const ground_eg_ping = new Audio('audio_tracks/example_tone-ground_rocks.mp3');

const sky_play_button = document.getElementById("sky-play-pause");
const water_play_button = document.getElementById("water-play-pause");
const animal_play_button = document.getElementById("animal-play-pause");
const ground_play_button = document.getElementById("ground-play-pause");

const sky_checkbox = document.getElementById("sky-checkbox");
const water_checkbox = document.getElementById("water-checkbox");
const animal_checkbox = document.getElementById("animal-checkbox");
const ground_checkbox = document.getElementById("ground-checkbox");

var regions_to_play = {}


function updateRegionsToPlay() {
  regions_to_play = {
    sky: [sky_real_ping, sky_checkbox.checked],
    water: [water_real_ping, water_checkbox.checked],
    animal: [animal_real_ping, animal_checkbox.checked],
    ground: [ground_real_ping, ground_checkbox.checked]
  }
}

// play the sonification, checked elements only
function sonify() {
  console.log("sonifying!")
  updateRegionsToPlay()
  // if anything is playing, pause all
  if (
    (!sky_real_ping.paused && !sky_real_ping.ended)
    || (!water_real_ping.paused && !water_real_ping.ended)
    || (!animal_real_ping.paused && !animal_real_ping.ended)
    || (!ground_real_ping.paused && !ground_real_ping.ended)
  ) {
    for (const [region, attrs] of Object.entries(regions_to_play))
      attrs[0].pause() //AudioElement object
  }
  // else, play all checked
  else {
    start_ping.addEventListener("ended", (e) => {
      for (const [region, attrs] of Object.entries(regions_to_play)) {
        if (attrs[1]) { //is checked
          attrs[0].play() //AudioElement object
          console.log(attrs[0])
        }
      }
    })
    start_ping.play()
    // regions_entries = Object.entries(regions_to_play)
    // any_sound = regions_entries[regions_entries.length - 1][1][0]
    // any_sound.addEventListener("ended", (e) => {
    //   stop_ping.play()
    // })
  }
}

// event listeners for play/pause individual sound playback
sky_play_button.addEventListener("click", (e) => {
  if (sky_eg_ping.paused || sky_eg_ping.ended) {
    sky_eg_ping.play();
  } else {
    sky_eg_ping.pause();
  }
});
water_play_button.addEventListener("click", (e) => {
  if (water_eg_ping.paused || water_eg_ping.ended) {
    water_eg_ping.play();
  } else {
    water_eg_ping.pause();
  }
});
animal_play_button.addEventListener("click", (e) => {
  if (animal_eg_ping.paused || animal_eg_ping.ended) {
    animal_eg_ping.play();
  } else {
    animal_eg_ping.pause();
  }
});
ground_play_button.addEventListener("click", (e) => {
  if (ground_eg_ping.paused || ground_eg_ping.ended) {
    ground_eg_ping.play();
  } else {
    ground_eg_ping.pause();
  }
});

// toggle all checkboxes w/ "All"
function toggleAll(source) {
  checkboxes = document.getElementsByName("region");
  for(var checkbox in checkboxes)
    checkboxes[checkbox].checked = source.checked;
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