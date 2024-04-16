# User manual
___

This document is intended to provide a high-level overview of the project, with links to more detailed technical documentation. 

# Historical setting
___

The player will be an “Ordinary” wizard. Someone without the inherent ability to cast magic. 
However, through a certain event the player is transported to a magical island where, on arrival, 
they discover crystals that grant magical abilities when eaten. Excited by their newfound power the 
player will want to grow their power by mining for those crystals.

# Goal of the game
___

The goal of the game is to mine for crystals and grow your power. 
The player will be able to use different spells and gems to improve the speed of mining and the amount of crystals mined. 
Besides mining, the player will also be able to explore the islands of other players and fight them in a combat system.

# Landing page
___

![Landing page image](/docs/img/landing-page.png)

The landing page is the first page the player will see when they visit the website.
The page is optimized for mobile and desktop users.
It contains the name of the game and buttons to register or login. Also, desktop users get a magic wand as a cursor.

# Register page
___

Upon arrival of the landing page, the player has the option to create a new island, this will redirect the player to the register page.
Here, the player can create a new account and get a new island by filling in the following fields:
- Username
- Password
- First name
- Last name

# Login page
___

If the player already has an account, they can log in by clicking "I have already eaten some gems" which refers to
the crystals that grant magical abilities when eaten which the player already has if they have an island.
For the login the player needs to fill in their username and password.
There is also an option to log in with Google.

# Index page
___

![Loading Screen image](/docs/img/loading-screen.png)

Level popup: TODO Aaditya

After logging in, the player will be redirected to the index page. First at all, the loading screen will appear, after which the player will be redirected to the game.
The loading screen consists of a progress bar showing the amount of the game that is loaded, some text displaying what part of the game is
being loaded, and an animation of a wizard casting a spell to keek it visually interesting.


![Game screen image](/docs/img/game.png)

The index page is the main page of the game. It contains the following elements:

- Settings button: opens settings menu
- Chat button: opens chat menu
- Crystal counter: shows the amount of crystals the player has
- Health bar (red potion): shows the health of the player
- Mana bar (blue potion): shows the mana of the player
- Inventory: shows the equipped spells
- Game screen: shows the game

### Settings menu

By clicking the top left icon, the player can open the settings menu. Here, the player can change
some basic settings about the game, such as audio, graphics and controls.

### Chat

TODO: Aaditya

### Inventory

At the bottom of the screen are 5 boxes, that all provide a space for an equipped spell. The first spell cant be changed and 
will always be the build spell, with which the player can build buildings on his island. The other 4 equipped spells can be changed
in the altar menu, and will be displayed in the inventory hot-bar. The player always has one spell selected, which is shown by gold
highlighting of the selected spell slot. Each individual spell has a unique icon, which is then shown on its equipped spot on the hot-bar.

# Game
___

## Basic player movements

The player can move around the game using the following keys (can be changes in the settings menu):

- W: move forward
- A: move left
- S: move backward (rolling back)
- D: move right
- F: Toggle fps counter
- Space: jump
- Shift: sprint
- CTRL: toggle chat
- 1-5: select a spell slot
- E: interact with objects
- Mouse: look around
- Left mouse button: cast spell
- Q: eat

## Collision detection

TODO: Flynn

# In-game menus
___

The buildings can be accessed through menus. Here you can interact
with the buildings and use their functionalities and upgrade them.
Most buildings can be upgraded by using gems and enhancing their abilities.
Opening a menu is done by default by pressing the `E` key when the player is
aiming at the building.

### Altar menu

In the altar menu the player can configure their inventory and equip spells.
They can also select stakes to start a multiplayer battle.

### Mine menu

The mine menu passively generates crystals for the player and also has
a small chance of generating gems.

### Fusion table menu

In the fusion table the player can use crystals and fuse them into gems.
This will take some time.

### Tower menu

The tower is used for combat and displays its health and damage.

# Spells
___

TODO: Flynn

# Eating
___

By eating, the player will consume crystals in exchange for mana, health and experience.

# Building system
___

TODO: Daria

## Currency

The general currency in the game are the crystals. These can be mined by the player and are used
for most actions in the game. There are also different gems with attributes that can be used to
upgrade buildings.

# Optimizations
___

## Asset caching

TODO: Aaditya



