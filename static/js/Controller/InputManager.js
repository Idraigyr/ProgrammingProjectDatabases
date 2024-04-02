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
import {Subject} from "../Patterns/Subject.js";

/**
 * Class that manages the input from the user
 */
export class InputManager extends Subject{
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
    }
    #callbacks = {mousemove: [], mousedown: {0: [], 2: []}, spellSlotChange: []};


    /**
     * Constructor that adds event listeners for the input
     */
    constructor(params) {
        super(params);
        this.blockedInput = true;
        this.canvas = params.canvas;
        this.canvas.addEventListener("mousedown", async (e) => {
            if(!this.blockedInput) return;
            await this.canvas.requestPointerLock();
        });
        document.addEventListener("mousedown", this.onClickEvent.bind(this));
        document.addEventListener("pointerlockchange", (e) => {
            this.blockedInput = !this.blockedInput;
            if(this.blockedInput) this.resetKeys();
        });
        document.addEventListener("mousemove", this.onMouseMoveEvent.bind(this));

        document.addEventListener("keydown", this.#onKeyDown.bind(this));
        document.addEventListener("keyup", this.#onKeyUp.bind(this));

        //for animation purposes only
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

    resetKeys(){
        for(const key in this.keys){
            if(key === "spellSlot") continue;
            this.keys[key] = false;
        }
        this.mouse.leftClick = false;
        this.mouse.rightClick = false;
    }

    addKeyDownEventListener(key, callback){
        this.#callbacks[key] = callback;
    }

    removeKeyDownEventListener(key){
        this.#callbacks[key] = this.#callbacks[key].filter((cb) => cb !== callback);
    }

    /**
     * Adds event listener for mouse move
     * @param callback function to add
     */

    addMouseMoveListener(callback){
        this.#callbacks["mousemove"].push(callback);
    }

    /**
     * Adds event listener for mouse down
     * @param {Function} callback function to add
     * @param {"left" | "right"} button
     */
    addMouseDownListener(callback, button){
        this.#callbacks["mousedown"][button === "left" ? 0 : 2].push(callback);
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
        this.#callbacks["mousemove"] = this.#callbacks["mousemove"].filter((cb) => cb !== callback);
    }

    onMouseMoveEvent(event){
        if(this.blockedInput) return;
        this.#callbacks["mousemove"].forEach((callback) => callback(event));
    }

    onClickEvent(event){
        if(this.blockedInput) return;
        this.#callbacks["mousedown"][event.button].forEach((callback) => callback(event));
    }

    createSpellSlotChangeEvent(){
        return new CustomEvent("spellSlotChange", {detail: {spellSlot: this.keys.spellSlot}});
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

    //TODO: remove all keys that need not be checked within an update function
    #onKey(KeyBoardEvent, bool){
        if(this.blockedInput) return;
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
                this.dispatchEvent(this.createSpellSlotChangeEvent());
                break;
            case slot2Key:
                this.keys.spellSlot = 2;
                this.dispatchEvent(this.createSpellSlotChangeEvent());
                break;
            case slot3Key:
                this.keys.spellSlot = 3;
                this.dispatchEvent(this.createSpellSlotChangeEvent());
                break;
            case slot4Key:
                this.keys.spellSlot = 4;
                this.dispatchEvent(this.createSpellSlotChangeEvent());
                break;
            case slot5Key:
                this.keys.spellSlot = 5;
                this.dispatchEvent(this.createSpellSlotChangeEvent());
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

    addSettingButtonListener(callback) {
        const settingsButton = document.querySelector('.settings-button');
        settingsButton.addEventListener('click', callback);
    }
}