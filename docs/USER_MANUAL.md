# User manual
___

This document is intended to provide a high-level overview of the project, with some technical details. 

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

If the player already has an account, they can log in by clicking "I have already eaten some crystals" which refers to
the crystals that grant magical abilities when eaten which the player already has if they have an island.
For the login the player needs to fill in their username and password.
There is also an option to log in with Google and reset the password.

# Index page
___

![Loading Screen image](/docs/img/loading-screen.png)

Level popup: After the player has gained some experience playing the game (e.g. for eating crystal or placing buildings), the player can level up. When the level increases
the player gets a popup message saying "Level {currentLevel}". If the player clicks on "Show Features", the player
can view the features of current Level.

![Level up image](/docs/img/levelUP.png)

After logging in, the player will be redirected to the index page. First at all, the loading screen will appear, after which the player will be redirected to the game.
The loading screen consists of a progress bar showing the amount of the game that is loaded, some text displaying what part of the game is
being loaded, and an animation of a wizard casting a spell to keep it visually interesting.


![Game screen image](/docs/img/game.png)

The index page is the main page of the game. It contains the following elements:

- Settings button: opens settings menu
- Chat button: opens chat menu
- Crystal counter: shows the amount of crystals the player has
- Health bar (red potion): shows the health of the player
- Mana bar (blue potion): shows the mana of the player
- Inventory: shows the equipped spells
- Username: shows the username of the player
- Current level: shows the current level and the progress bar of the player
- Game screen: shows the game

### Settings menu

By clicking the top left icon, the player can open the settings menu. Here, the player can change
some basic settings about the game, such as audio, graphics and controls.

### Chat

By clicking on the bottom left icon, the player can open the chat. The chat is a global chat where every
player can chat with each other. The chat is implemented with Socket.IO library.

### Cheats

If the player has the right to use cheats, the player can open the chat menu and type the following commands:

- \level(level): set the level of the player
- \xp(xp): increase the xp of the player
- \crystal(crystals): increase the crystals of the player

### Inventory

![Spell inventory image](/docs/img/spell-inventory.png)

At the bottom of the screen are 5 boxes, that all provide a space for an equipped spell. The first spell can't be changed and 
will always be the build spell, with which the player can build buildings on his island. The other 4 equipped spells can be changed
in the altar menu, and will be displayed in the inventory hot-bar. The player always has one spell selected, which is shown by gold
highlighting of the selected spell slot. Each individual spell has a unique icon, which is then shown on its equipped spot on the hot-bar.
After using a spell, that spell becomes transparant for the cooldown period, and a timer is shown on the spell icon,
displaying the exact remaining cooldown time. The spell can't be used for that period of time.

# Game
___

## Basic player movements

![Player sprinting forward image](/docs/img/sprint-forward.png)

The player can move around the game using the following keys (can be changes in the settings menu):

- W: move forward
- A: move left
- S: move backward (rolling back)
- D: move right
- F: Toggle fps counter
- Space: jump
- Shift: sprint
- C: toggle chat
- 1-5: select a spell slot
- E: interact with objects
- Mouse: look around
- Left mouse button: cast spell
- Q: eat

## Collision detection

![Collision detection animation](/docs/gif/collision-detection.gif)

The player can't walk through buildings or other objects. Collision detection in the game is always done via basic axis aligned bounding box intersection tests. However for the static geometry (= island + buildings) there is an extra optimisation: 

We use a library to add a bounding volume hierarchy (=bvh) which allows us to optimally test collision between the entities in our game and the individual polygons in our static geometry. This way we can let our entities move smoothly over every terrain in our game.

Spell to entity, spell to spell and entity to entity collision does not make use of this optimisation and may appear more “clunky” (for example player movement when moving along an icewall spell). 

# In-game menus
___

The buildings can be accessed through menus. Here you can interact
with the buildings and use their functionalities and upgrade them.
Most buildings can be upgraded by using gems and enhancing their abilities.
Opening a menu is done by default by pressing the `E` key when the player is
aiming at the building.

### Altar menu

![Altar menu image](/docs/img/altar-menu.png)

In the altar menu the player can configure their inventory and equip spells.
They can also select stakes to start a multiplayer battle.

### Mine menu

![Mine menu image](/docs/img/mine-menu.png)

The mine menu passively generates crystals for the player and also has
a small chance of generating gems.

You can collect the crystals by clicking on the collect button. The number of crystals will be added to the player's inventory.

### Fusion table menu

In the fusion table the player can use crystals and fuse them into gems.
This will take some time.

### Tower menu

The tower is used for combat and displays its health and damage.

# Eating
___

By eating, the player will consume crystals in exchange for mana, health and experience.

# Spells
___

Fireball: creates a fireball projectile that will damage enemies on hit. 

![Fireball spell image](/docs/gif/fire-spell.gif)

Thundercloud: creates a thundercloud above the position the player is looking at. 

![Thunderstorm spell image](/docs/gif/thunder-spell.gif)

Shield: creates 3 rotating shields around the player 

![Shield spell image](/docs/gif/shield.gif)

Icewall: conjures an ice wall out of the ground, blocking entities movement.

![Ice wall spell image](/docs/gif/ice-wall-spell.gif)

Each spell has own cooldown period and mana cost. The player can cast a spell by pressing the left mouse button.

The first spell is the build spell, which is used to build buildings on the island.

# Building system
___

BuildSpell is used to build and move buildings. Will always be present in slot 1 in the hotbar.

![Build spell icon](/docs/img/build-spell-icon.png)

You can fully customize your island by building different buildings. Each building has its own functionality. To place a building, the player have to select the build spell in the inventory and click on the desired location. Then the build menu will appear, where the player can select the building he/she wants to place. 

![Build menu image](/docs/img/build-menu.png)

The build menu has three tabs:
- Combat: buildings that are used for combat (e.g. tower)
- Resources: buildings that are used to generate resources (e.g. mine)
- Decorations: buildings that are used for decoration (e.g. tree)
In each item cell you can see the required number of crystals and time in seconds to build the building. Also, there is an icon and the description of the building.
After you select the building you want to place, the build menu will disappear, the number of crystals will decrease and the building preview will be placed on the selected location.

![Building preview image](/docs/img/building-green-preview.png) 

Above the building preview you can see the timer that shows the remaining time to build the building. When the timer reaches 0, the building will be placed on the selected location.

After that, you can interact with the building by pressing the `E` key. 

If you want to move the building, you have to select the build spell in the inventory and click on the building. Then the building will be selected and you can move it to the desired location. To place the selected object on the new place, click on the desired cell. If you want to rotate the building, you have to click with the right mouse button.

## Currency

The general currency in the game are the crystals. These can be mined by the player and are used
for most actions in the game. There are also different gems with attributes that can be used to
upgrade buildings.

# Optimizations
___

## Asset caching

![Asset caching image](/docs/img/index-db.png)

When player logs in for the first time certain 3D-models and images are stored in cache. This makes the process of loading 
assets faster every time the player opens the game. To store the models we use IndexedDB.



