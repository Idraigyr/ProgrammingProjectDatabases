# Island Building Feature Test Cases (Continued)

## Test Case 5: Building Placement and Interaction Test

- **Test Case ID:** ISL-BUILD-005
- **Test Case Description:** Verify that players can successfully place buildings on their island, interact with them, move them, and rotate them as needed.
- **Preconditions:** 
  - The player has selected a building from the build menu and clicked on the desired location on the island.
- **Test Steps:** 
  1. Confirm Building Placement:
     - Verify that the build menu disappears after selecting the building.
     - Check that the number of crystals decreases as per the building's requirements.
     - Ensure that the building preview is placed on the selected location.
  2. Verify Building Timer:
     - Check that the timer above the building preview shows the remaining time to build the building.
     - Wait until the timer reaches 0 and confirm that the building is placed on the selected location.
  3. Interact with Building:
     - Press the 'E' key to interact with the placed building.
     - Verify that the interaction with the building is successful.
  4. Move Building:
     a. Access Build Spell:
        - Open the player's inventory.
        - Select the build spell.
     b. Select Building:
        - Click on the placed building.
        - Verify that the building is selected and can be moved.
     c. Move Building:
        - Click on the desired location to move the building.
        - Confirm that the building is placed at the new location.
  5. Rotate Building:
     - Click with the right mouse button on the selected building to rotate it.
     - Verify that the building rotates as expected.
- **Expected Results:** 
  - The build menu should disappear after selecting a building, and the number of crystals should decrease accordingly.
  - The building preview should be placed on the selected location.
  - The timer above the building preview should accurately display the remaining time to build the building, and the building should be placed once the timer reaches 0.
  - The player should be able to interact with the placed building by pressing the 'E' key.
  - The player should be able to select the building, move it to a new location, and place it there by clicking on the desired cell.
  - The player should be able to rotate the selected building by clicking with the right mouse button.
- **Postconditions:** 
  - The player should have successfully placed, interacted with, moved, and rotated the building on their island according to their preferences.
- **Notes:** 
  - Verify that the building placement, interaction, movement, and rotation functions smoothly and accurately.
  - Ensure that the building preview is removed once the building is placed on the island.
