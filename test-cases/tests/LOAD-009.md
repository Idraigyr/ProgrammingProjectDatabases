# Loading Screen and Redirection Test Cases

## Test Case 9: Loading Screen and Redirection Test

- **Test Case ID:** LOAD-009
- **Test Case Description:** Verify that after logging in, the player is redirected to the index page where a loading screen is displayed. The loading screen should consist of a progress bar showing the amount of the game that is loaded, text indicating what part of the game is being loaded, and an animation of a wizard casting a spell for visual appeal. Once the loading is complete, the player should be redirected to the game.
- **Preconditions:** 
  - The game login process is accessible and functional.
- **Test Steps:** 
  1. Login:
     - Log in to the game with valid credentials.
  2. Verify Redirection:
     - Ensure that after logging in, the player is redirected to the index page.
  3. Verify Loading Screen:
     - Check that a loading screen is displayed upon redirection to the index page.
     - Verify that the loading screen contains a progress bar showing the amount of the game loaded.
     - Ensure that text is displayed indicating what part of the game is being loaded.
     - Confirm that an animation of a wizard casting a spell is present for visual appeal.
  4. Wait for Loading Completion:
     - Monitor the loading progress until it reaches 100%.
  5. Verify Redirection to Game:
     - Once the loading is complete, ensure that the player is automatically redirected to the game.
- **Expected Results:** 
  - After logging in, the player should be redirected to the index page where a loading screen is displayed.
  - The loading screen should include a progress bar, text indicating loading progress, and a wizard animation.
  - Once the loading is complete, the player should be redirected to the game automatically.
- **Postconditions:** 
  - The player should have successfully logged in and been redirected to the game after the loading process is complete.
- **Notes:** 
  - Test the loading process with different network speeds and ensure that the loading screen functions smoothly.
  - Verify that the loading progress accurately reflects the loading status of the game assets.
  - Ensure that the redirection to the game occurs seamlessly after the loading is complete.
