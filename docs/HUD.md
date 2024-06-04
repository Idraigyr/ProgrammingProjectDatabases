# HUD

The HUD (Heads Up Display) is a graphical user interface that displays information to the player. 
The HUD is displayed on the screen and is used to show the player's health, manna, and other important information. 
The HUD is an essential part of the game and helps the player keep track of their progress and status.
The html part of the hud is located in the `index.html` file, and the css is located in the `index.css` file. In practice,
the HUD is basically and overlay of different elements that are displayed on the screen over the 3D world. When the players
pointer is not locked or hovering over a button, the mouse will have the appearance of a magic wand.
For a higher level overview of the HUD and its utility,
please refer to the [user manual](USER_MANUAL.md). In this document, 
we will focus more on the technical implementation of the HUD. The HUD uses a lot of images, which are all credited in 
the [credits](../static/credits.txt) file. We will not go into detail about the different elements of the HUD.

## Hotbar

The hotbar is made up of different flexbox items that are displayed horizontally, and has different layers.
The lowest layer are the empty boxes, which are always displayed. These boxes are all images, and these images are
changed using javascript to display a golden variant when that box is selected, or back to the default when switched to 
a different slot. The second layer are the spells equipped by the player. These are displayed as images, and are also
changed using javascript to display the equipped spell in the correct slot. The equipped spells and position in the 
hotbar are persistent and are stored in the database, by using the 'player spells' table. The third layer are the spell
cooldowns. These are normally not displayed, but when a spell is cast, the cooldown of the cast spell is displayed in the
correct slot by a decreasing number, and by making the lower two layers have a higher opacity.
These cooldowns are updated every delta time, and are hidden when the cooldown is over.

## Health and Manna bars
The health and mana of the player are displayed by the red and blue potions respectively, displayed to the left and right
of the hotbar. On these potions, the current and maximum health/mana are displayed. The potions themselves are images,
and have two layers. The bottom layer is the potion in a gray colour, and the top layer is the potion in colour. The top
layer is resized based on the current health/mana, and the bottom layer is always displayed. This way, the potion is
filled with the current percentage of health/mana. The health and mana numbers and the percentage of the potion that is full
are both updated using event listeners that listen when the health/mana of the player is updated.

## Friends menu
Please refer to the [friends documentation](FRIENDS.md) for more information about the friends menu.

## Level, experience and player name

The level, experience and player name are displayed at the top of the screen. The bar shows the percentage of xp you have 
towards the next level. The level and experience are updated when the player gains experience. When this happens, a little 
animation is played where the bar fills up with the new experience. This is done using a combination of css and javascript.
Below that, the precise amount of current xp and the xp needed for the next level are displayed. The player name is displayed
above the level bar. This name is the same as the username of the player, and is retrieved from the database when the player
logs in. The players experience is stored in the database, and retrieved when the player logs in. The level is calculated
based on the experience by the front end, and therefore is not stored in the database.

## Settings menu
The settings menu is displayed when the player clicks on the settings icon in the top left corner of the screen. The setting icon
changes when the player hovers over it, and when the player clicks on it. This is done by using different images for the `:hover`
and `:active` states of the icon.
In the settings menu the player can change the horizontal and vertical sensitivity of the camera, which changes a variable
in the config file so the camera moves faster or slower when moving you mouse. They can also the change the performance of 
the game in case they have a slower computer. There are three options: low, medium and high. On low performance, the game
doesn't render shadows or grass. On medium performance, the game renders grass but not shadows. On high performance, the game
renders both shadows and grass. The cursor that helps the player aim can also be switched to different types of cursors.
Based on the selected cursor, a different image will be displayed at the middle of the screen. The biggest part of the settings
is changing the keybindings. The player can change the keybindings of the spell slots, the movement keys, eating, etc.
When a player changes a keybinding and clicks apply, that keybind is changed in the keybinds config file, and therefore
impacts the game. The keys work with codes and values. The code is the relative position of the key on the keyboard, and thus is 
independent of azerty or qwerty. The value what is on the key that is presses. If I press the first letter key on my keyboard,
the code will always be KeyQ, but the value will be Q on a qwerty keyboard and A on an azerty keyboard. We mostly use the key codes,
that way the default keybinds are independent of the keyboard layout and are therefore always intuitive. All these settings are 
gathered in a JSON object and sent to the backend at the endpoint `/api/settings`  using a `PUT` request when the player clicks apply. 
Both the code and the value of the keybinds are stored in the database. The settings are retrieved from the database 
using a `GET` request when the player logs in,
then visually put in the settings menu (this is where the values of the keys get used) and the menu then does an apply of the settings.
This uses the same function that is called when the player presses apply, except with an extra parameter that blocks the `PUT` request
and prevents unnecessary requests to the backend. This way when a player logs in, the settings the user are instantly applied.
At the bottom of the settings menu, there are some buttons with different options. The first button is the 'reload world' button.
When the player clicks this button, the world is reloaded. This is useful when the player is stuck in a wall for example.
The second button is the 'leave match' button. Depending on the situation of the player, this button will either take the player
out of a match, out of friend visit mode, or just out of the menu. The third button is the 'logout' button. When the player clicks 
this button, the player is logged out and redirected to the landing page.
This is done by redirecting the player to the `/logout` endpoint. The fourth button is the 'fullscreen' button. When the player clicks
this button, the game goes fullscreen, as it would when you press F11. This is simply done by calling the `requestFullscreen()` function.
There is also the help button, which opens a help menu. This menu displays aims to help the player with the game, and contains
information about the game, the controls, the spells, etc. This menu also features images to make it more visually appealing and clear, 
as wel as an image with the default layout of the keybinds marked on a keyboard. This menu was partially made by converting the 
`USER_MANUAL.md` file to html, and then adding some extra styling and changing the text a bit. It also includes an overview of everything you unlock and at which level, 
which gets dynamically made based on the config file, so it doesn't need to be changed when the levels get balanced differently.
The last button is the 'delete account' button.
When the player clicks this button, the player is asked to confirm the deletion of the account. When the player confirms, the account is permanently
deleted from the database. This is done by sending a `DELETE` request to the `/api/user_profile` endpoint. 
The player is then redirected to the landing page.
