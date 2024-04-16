# Spell Casting Test Cases

## Test Case 12: Spell Casting Functionality Test

- **Test Case ID:** SPELL-012
- **Test Case Description:** Verify that players can cast spells, including Fireball, Thunderstorm, Shield, and Ice Wall, by pressing the left mouse button. Each spell should have its own cooldown period and mana cost.
- **Preconditions:** 
  - The game is accessible and functional.
  - The player character is positioned in the game environment.
- **Test Steps:** 
  1. Access Spell Casting Mechanism:
     - Ensure that the spell casting mechanism is accessible to the player.
  2. Verify Spell Cooldown and Mana Cost:
     a. Check the cooldown period and mana cost for each spell:
        - Fireball
        - Thunderstorm
        - Shield
        - Ice Wall
  3. Cast Spells:
     a. Attempt to cast each spell by pressing the left mouse button.
     b. Verify that the spells are cast successfully without errors.
  4. Observe Cooldown:
     - Monitor the cooldown period for each spell after casting.
     - Ensure that the player cannot cast a spell again until its cooldown period has elapsed.
  5. Manage Mana:
     - Verify that the player's mana is appropriately deducted after casting each spell.
     - Ensure that the player cannot cast a spell if they do not have sufficient mana.
- **Expected Results:** 
  - Players should be able to cast spells, including Fireball, Thunderstorm, Shield, and Ice Wall, by pressing the left mouse button.
  - Each spell should have its own cooldown period and mana cost, which are accurately reflected in the game.
  - Spells should be cast successfully without errors, and cooldown periods should be observed before casting the same spell again.
  - The player's mana should be appropriately deducted after casting each spell, and they should not be able to cast spells if they do not have sufficient mana.
- **Postconditions:** 
  - The player should have successfully cast spells in the game environment, managing cooldown periods and mana costs effectively.
- **Notes:** 
  - Test the functionality with different combinations of spells to ensure that each spell behaves as expected.
  - Ensure that appropriate feedback is provided to the player regarding spell cooldowns, mana costs, and casting success.
