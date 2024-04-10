# Game Controls Test Cases

## Test Case 3: Controls Functionality Test

- **Test Case ID:** CTRL-003
- **Test Case Description:** Verify that the game controls function as expected, allowing the player to navigate, interact, and cast spells seamlessly.
- **Preconditions:** 
  - The game is launched and accessible.
  - The player character is loaded into the game environment.
- **Test Steps:** 
  1. Test Movement Controls:
     a. Press 'W' key.
     b. Press 'A' key.
     c. Press 'S' key.
     d. Press 'D' key.
  2. Test Additional Movement Controls:
     a. Press 'Space' key.
     b. Press 'Shift' and 'W' keys together.
  3. Test Spell Controls:
     a. Press keys '1' through '5' to select different spell slots.
     b. Press left mouse button to cast a spell.
  4. Test Interaction Controls:
     a. Look in the direction of the altar and press 'E'.
  5. Test Other Controls:
     a. Press 'F' key two times to toggle FPS counter.
     b. Press 'CTRL' key two times to toggle chat.
  6. Test Mouse Controls:
     a. Move the mouse to look around.
- **Expected Results:** 
  - When 'W' key is pressed, the character should move forward.
  - When 'A' key is pressed, the character should move left.
  - When 'S' key is pressed, the character should move backward (roll back).
  - When 'D' key is pressed, the character should move right.
  - When 'Space' key is pressed, the character should jump.
  - When 'Shift' and 'W' keys are pressed, the character should sprint forward.
  - Pressing keys '1' through '5' should select the respective spell slots.
  - Pressing the left mouse button should cast the selected spell.
  - Pressing 'E' key should allow the character to interact with objects.
  - Pressing 'F' key should toggle the FPS counter.
  - Pressing 'CTRL' key should toggle the chat.
  - Moving the mouse should allow the player to look around.
- **Postconditions:** 
  - The player should be able to navigate the game environment, cast spells, interact with objects, and toggle features using the specified keys without any issues.
- **Notes:** 
  - Verify that the character's movement is smooth and responsive.
  - Ensure that spells are cast accurately based on the selected spell slot.
  - Test interaction with various types of objects to ensure functionality.
  - Check that the FPS counter toggles correctly when 'F' key is pressed.
  - Ensure that the chat window toggles appropriately when 'CTRL' key is pressed.
