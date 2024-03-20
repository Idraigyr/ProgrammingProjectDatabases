import {
    buildKey,
    DownKey, primaryBackwardKey,
    primaryForwardKey,
    primaryLeftKey,
    primaryRightKey, secondaryBackwardKey, secondaryForwardKey,
    secondaryLeftKey,
    secondaryRightKey, slot1Key, slot2Key, slot3Key, slot4Key, slot5Key, sprintKey,
    upKey
} from "../configs/Keybinds.js";

/**
 * Class that manages the input from the user
 */
export class InputManager {
    keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false,
        spellSlot: 1,
        sprint: false,
        build: false
    }
    mouse = {
        leftClick: false,
        rightClick: false,
        deltaX: 0,
        deltaY: 0,
        x: 0,
        y: 0
    }
    #callbacks = {};
    spellSlotChangeCallbacks = [];


    /**
     * Constructor that adds event listeners for the input
     */
    constructor() {
        document.addEventListener("keydown", this.#onKeyDown.bind(this));
        document.addEventListener("keyup", this.#onKeyUp.bind(this));
        // Add event listener for mouse down
        document.addEventListener("mousedown", (e) => {
            switch (e.button){
                case 0:
                    this.mouse.leftClick = true;
                    break;
                case 2:
                    this.mouse.rightClick = true;
                    break;
                default:
                    break;
            }
        });
        // Add event listener for mouse up
        document.addEventListener("mouseup", (e) => {
            switch (e.button){
                case 0:
                    this.mouse.leftClick = false;
                    break;
                case 2:
                    this.mouse.rightClick = false;
                    break;
                default:
                    break;
            }
        });
    }

    addKeyDownEventListener(key, callback){
        this.#callbacks[key] = callback;
    }

    removeKeyDownEventListener(key){
        delete this.#callbacks[key];
    }

    /**
     * Adds event listener for mouse move
     * @param callback function to add
     */

    addMouseMoveListener(callback){
        document.addEventListener("mousemove",callback);
    }

    /**
     * Adds event listener for mouse down
     * @param callback function to add
     */
    addMouseDownListener(callback){
        document.addEventListener("mousedown",callback);
    }

    /**
     * Adds event listener for mouse scroll
     * @param callback function to add
     */
    addScrollListener(callback){
        document.addEventListener("wheel",callback);
    }

    /**
     * Removes event listener for mouse move
     * @param callback function to remove
     */
    removeMouseMoveListener(callback){
        document.removeEventListener("mousemove",callback);
    }

    /**
     * Removes event listener for mouse down
     * @param callback function to remove
     */
    removeScrollListener(callback){
        document.removeEventListener("wheel",callback);
    }

    /**
     * Updates pressed keys
     * @param KeyBoardEvent event
     * @param bool true if key is pressed, false if released
     */

    #onKey(KeyBoardEvent, bool){
        switch (KeyBoardEvent.code){
            case upKey:
                this.keys.up = bool;
                break;
            case DownKey:
                this.keys.down = bool;
                break;
            case primaryLeftKey:
            case secondaryLeftKey:
                this.keys.left = bool;
                break;
            case primaryRightKey:
            case secondaryRightKey:
                this.keys.right = bool;
                break;
            case primaryForwardKey:
            case secondaryForwardKey:
                this.keys.forward = bool;
                break;
            case primaryBackwardKey:
            case secondaryBackwardKey:
                this.keys.backward = bool;
                break;
            case sprintKey:
                this.keys.sprint = bool;
                break;
            case buildKey:
                this.keys.build = bool;
                break;
            case slot1Key:
                this.keys.spellSlot = 1;
                this.invokeSpellSlotChangeCallbacks();
                break;
            case slot2Key:
                this.keys.spellSlot = 2;
                this.invokeSpellSlotChangeCallbacks();
                break;
            case slot3Key:
                this.keys.spellSlot = 3;
                this.invokeSpellSlotChangeCallbacks();
                break;
            case slot4Key:
                this.keys.spellSlot = 4;
                this.invokeSpellSlotChangeCallbacks();
                break;
            case slot5Key:
                this.keys.spellSlot = 5;
                this.invokeSpellSlotChangeCallbacks();
                break;
        }

        this.#callbacks[KeyBoardEvent.code]?.(KeyBoardEvent);
    }

    /**
     * Updates pressed keys
     * @param KeyBoardEvent event
     */
    #onKeyDown(KeyBoardEvent){
        this.#onKey(KeyBoardEvent,true);
    }

    /**
     * Updates released keys
     * @param KeyBoardEvent event
     */
    #onKeyUp(KeyBoardEvent){
        this.#onKey(KeyBoardEvent, false);
    }
        /**
     * Listener for when the spell slot changes
     *
     */
    addSpellSlotChangeListener(callback) {
        this.spellSlotChangeCallbacks.push(callback);
    }

    /**
     * Invokes all spell slot change callbacks
     */
    invokeSpellSlotChangeCallbacks() {
        this.spellSlotChangeCallbacks.forEach(callback => callback());
    }

    addSettingButtonListener(callback) {
        const settingsButton = document.querySelector('.settings-button');
        settingsButton.addEventListener('click', callback);
    }
}