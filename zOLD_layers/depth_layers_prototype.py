#!../venv/bin/python3.13
# pylint: disable=missing-module-docstring
# pylint: disable=missing-class-docstring
# pylint: disable=missing-function-docstring
# pylint: disable=import-error
# pylint: disable=consider-using-f-string
# pylint: disable=global-statement

import os

import vlc
import keyboard

# Common vertical sounds (paths), reused
SKY = os.path.abspath("./audio_tracks/sky-ai.mp3")
CLOUDS = os.path.abspath("./audio_tracks/clouds-ai.mp3")
CLOUD_PING = os.path.abspath("./audio_tracks/ping-clouds-prototype_1.mp3")
NO_VERTICAL = os.path.abspath("./audio_tracks/no_vertical_layers-ai.mp3")


# One layer of perspective in an image
class Layer:
    def __init__(
            self,
            base_description,
            base_ping = None,
            vertical_sound_pairs = None
        ):
        self.base_dsc = base_description # path to sound
        self.base_ping = base_ping or '' # ik this whole thing is hacky but None seems bad
        self.vert_counter = 0 # always starts at bottom
        # more navigation within layer. descriptions and pings. If no ping, empty string.
        if vertical_sound_pairs is not None:
            self.vert_sounds = [
                (self.base_dsc, self.base_ping)
            ]
            self.vert_sounds.extend(vertical_sound_pairs)
        else:
            self.vert_sounds = []

    def play_base(self):
        instance = vlc.Instance()
        media_list = vlc.MediaList()
        media_list.add_media(self.base_dsc)
        # don't add ping if not included
        if self.base_ping:
            media_list.add_media(self.base_ping)
        # set up player to play
        list_player = instance.media_list_player_new()
        list_player.set_media_list(media_list)
        # play any clips added, sequentially
        list_player.play()

        # dsc = vlc.MediaPlayer(self.base_dsc)
        # ping = vlc.MediaPlayer(self.base_ping) if self.base_ping else ''
        # dsc.play()
        # if ping:
        #     ping.play()

    def play_vertical(self):
        if self.vert_sounds:
            self.norm_vert_counter()
            mp3_tuple = self.vert_sounds[self.vert_counter]
            instance = vlc.Instance()
            media_list = vlc.MediaList()
            # add description at right level, ping if applicable
            media_list.add_media(mp3_tuple[0])
            if mp3_tuple[1]:
                media_list.add_media(mp3_tuple[1])
            # set up player to play
            list_player = instance.media_list_player_new()
            list_player.set_media_list(media_list)
            # play clips, sequentially if incl. ping
            list_player.play()

        # if self.vert_sounds:
        #     self.norm_vert_counter()
        #     mp3_tuple = self.vert_sounds[self.vert_counter]
        #     dsc = vlc.MediaPlayer(mp3_tuple[0])
        #     ping = vlc.MediaPlayer(mp3_tuple[1]) if mp3_tuple[1] else ''
        # else: # defaults (dsc = 'no vertical layer', no ping)
        #     dsc = vlc.MediaPlayer(NO_VERTICAL)
        #     ping = ''
        # dsc.play()
        # if ping:
        #     ping.play()

    def norm_vert_counter(self):
        if self.vert_counter >= len(self.vert_sounds):
            self.vert_counter = len(self.vert_sounds) - 1
        if self.vert_counter <= 0:
            self.vert_counter = 0


# Absolutely there is a better way to keep track of this but it works for this
CUR_LAYER = 0
LAYERS = [
    Layer(os.path.abspath("./audio_tracks/foreground-press_up-ai.mp3")),
    Layer(
        os.path.abspath("./audio_tracks/grass-ai.mp3"),
        base_ping=os.path.abspath("./audio_tracks/ping-grass-prototype_1.mp3")
    ),
    Layer(
        os.path.abspath("./audio_tracks/trees-ai.mp3"),
        base_ping=os.path.abspath("./audio_tracks/ping-trees-prototype_1.mp3"),
        vertical_sound_pairs=[(CLOUDS, CLOUD_PING)]
    ),
    Layer(
        os.path.abspath("./audio_tracks/mountains-close-ai.mp3"),
        base_ping=os.path.abspath("./audio_tracks/ping-mountain_close-prototype_1.mp3"),
        vertical_sound_pairs=[(SKY, ''), (CLOUDS, CLOUD_PING)]
    ),
    Layer(
        os.path.abspath("./audio_tracks/mountain-snowy_far-ai.mp3"),
        base_ping=os.path.abspath("./audio_tracks/ping-mountain_snowy_far-prototype_1.mp3"),
        vertical_sound_pairs=[(SKY, '')]
    ),
    Layer(os.path.abspath("./audio_tracks/background-press_down-ai.mp3")),
]


# Normalize layer: don't increment/decrement past [zero, # layers]
def norm_cur_layer():
    global CUR_LAYER
    if CUR_LAYER >= len(LAYERS):
        CUR_LAYER = len(LAYERS) - 1
    if CUR_LAYER <= 0:
        CUR_LAYER = 0

# Get the current layer from the global vars. Doesn't need to exist actually hm
def get_layer():
    return LAYERS[CUR_LAYER]


# Keystroke callbacks
def on_up():
    print('~~~~~~~~\nup was pressed. Doing things...')
    # move a layer deeper (farther from viewer)
    global CUR_LAYER
    CUR_LAYER += 1
    norm_cur_layer()
    # play its base sound
    get_layer().play_base()
keyboard.add_hotkey('up', on_up)

def on_down():
    print('~~~~~~~~\ndown was pressed. Doing things...')
    # move a layer closer to viewer
    global CUR_LAYER
    CUR_LAYER -= 1
    norm_cur_layer()
    # play its base sound
    get_layer().play_base()
keyboard.add_hotkey('down', on_down)

def on_shift_up():
    print('~~~~~~~~\nshift+up was pressed. Doing things...')
    layer = get_layer()
    layer.vert_counter += 1
    # play the vertical sound at its current counter
    layer.play_vertical()
keyboard.add_hotkey('shift+up', on_shift_up)

def on_shift_down():
    print('~~~~~~~~\nshift+down was pressed. Doing things...')
    layer = get_layer()
    layer.vert_counter -= 1
    # play the vertical sound at its current counter
    layer.play_vertical()
keyboard.add_hotkey('shift+down', on_shift_down)

def on_esc():
    print('\nExiting...')
    # exit_sound = os.path.abspath("./audio_tracks/ping-clouds-prototype_1.mp3")
    # vlc.MediaPlayer(exit_sound).play() #this doesn't run in time to get through before the exit
keyboard.add_hotkey('esc', on_esc)

# Set up instructions to play on startup
# Not directly in the main() b/c putting this much related code together
# not in a function, in python?, felt cursed.
def instructions_player():
    instance = vlc.Instance()
    media_list = vlc.MediaList()
    media_list.add_media(
        os.path.abspath("./audio_tracks/instructions-ai.mp3")
    )
    media_list.add_media(
        os.path.abspath("./audio_tracks/esc_to_exit-ai-diff_voice.mp3")
    )
    list_player = instance.media_list_player_new()
    list_player.set_media_list(media_list)
    # play both clips back to back
    list_player.play()


# The main() block
if __name__ == '__main__':
    print("PRESS ESC TO EXIT")
    instructions_player()
    keyboard.wait('esc')
