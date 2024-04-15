from flask import current_app
from sqlalchemy import Column, BigInteger, ForeignKey, SmallInteger, Boolean, String, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.model.player import Player


class UserSettings(current_app.db.Model):

    player_id: Mapped[int] = mapped_column("Player", ForeignKey("player.user_profile_id"), primary_key=True)
    player: Mapped[Player] = relationship(back_populates="user_settings")

    # The player's settings
    audio_volume: Mapped[int] = Column(SmallInteger, CheckConstraint("audio_volume >= 0 AND audio_volume <= 100"), nullable=False, default=100)
    sound_fx: Mapped[bool] = Column(Boolean, nullable=False, default=True)
    background_music: Mapped[bool] = Column(Boolean, nullable=False, default=True)

    # Keybinds
    move_fwd: Mapped[str] = Column(String(5), nullable=False, default='w')
    move_bkwd: Mapped[str] = Column(String(5), nullable=False, default='s')
    move_left: Mapped[str] = Column(String(5), nullable=False, default='a')
    move_right: Mapped[str] = Column(String(5), nullable=False, default='d')
    jump: Mapped[str] = Column(String(5), nullable=False, default='Space')
    inventory: Mapped[str] = Column(String(5), nullable=False, default='e')
    pause: Mapped[str] = Column(String(5), nullable=False, default='esc')
    attack: Mapped[str] = Column(String(5), nullable=False, default='lmb')

    def __init__(self, player_id: int = None, audio_volume: int = 100, sound_fx: bool = True, background_music: bool = True,
                    move_fwd: str = 'w', move_bkwd: str = 's', move_left: str = 'a', move_right: str = 'd', jump: str = 'Space',
                    inventory: str = 'e', pause: str = 'esc', attack: str = 'lmb'):
            """
            Initialize the UserSettings object
            :param player_id: The id of the player that these settings belong to
            :param audio_volume: The audio volume of the player
            :param sound_fx: Whether sound effects are enabled
            :param background_music: Whether background music is enabled
            :param move_fwd: The keybind for moving forward
            :param move_bkwd: The keybind for moving backward
            :param move_left: The keybind for moving left
            :param move_right: The keybind for moving right
            :param jump: The keybind for jumping
            :param inventory: The keybind for opening the inventory
            :param pause: The keybind for pausing the game
            :param attack: The keybind for attacking
            """
            if audio_volume < 0 or audio_volume > 100:
                raise ValueError("audio_volume must be in the range [0,100]")

            self.player_id = player_id
            self.audio_volume = audio_volume
            self.sound_fx = sound_fx
            self.background_music = background_music
            self.move_fwd = move_fwd
            self.move_bkwd = move_bkwd
            self.move_left = move_left
            self.move_right = move_right
            self.jump = jump
            self.inventory = inventory
            self.pause = pause
            self.attack = attack

    def update(self, data: dict):
        """
        Update the UserSettings with the given data
        :param data: The data to update the UserSettings with
        """
        if data.get('audio_volume', self.audio_volume) < 0 or data.get('audio_volume', self.audio_volume) > 100:
            raise ValueError("audio_volume must be in the range [0,100]")

        self.audio_volume = data.get('audio_volume', self.audio_volume)
        self.sound_fx = data.get('sound_fx', self.sound_fx)
        self.background_music = data.get('background_music', self.background_music)
        self.move_fwd = data.get('move_fwd', self.move_fwd)
        self.move_bkwd = data.get('move_bkwd', self.move_bkwd)
        self.move_left = data.get('move_left', self.move_left)
        self.move_right = data.get('move_right', self.move_right)
        self.jump = data.get('jump', self.jump)
        self.inventory = data.get('inventory', self.inventory)
        self.pause = data.get('pause', self.pause)
        self.attack = data.get('attack', self.attack)


    @staticmethod
    def create_default():
        """
        Create a default UserSettings object
        :return: A default UserSettings object
        """
        return UserSettings()

