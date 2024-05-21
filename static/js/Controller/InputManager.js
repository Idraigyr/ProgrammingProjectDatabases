import {
    buildKey, subSpellKey,
    DownKey, eatingKey, primaryBackwardKey,
    primaryForwardKey,
    primaryLeftKey,
    primaryRightKey, secondaryBackwardKey, secondaryForwardKey,
    secondaryLeftKey,
    secondaryRightKey, slot1Key, slot2Key, slot3Key, slot4Key, slot5Key, sprintKey,
    upKey
} from "../configs/Keybinds.js";
import {Subject} from "../Patterns/Subject.js";
import {assert} from "../helpers.js";

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
        sprint: false,
        build: false,
        eating: false
    }
    mouse = {
        leftClick: false,
        rightClick: false,
    }
    #callbacks = {mousemove: [], mousedown: {0: [], 2: []}, spellSlotChange: []};


    /**
     * Constructor that adds event listeners for the input
     * @param {{canvas: HTMLCanvasElement}} params
     */
    constructor(params) {
        super(params);
        this.blockedInput = true;
        this.canvas = params.canvas;
        this.canvas.addEventListener("mousedown", this.requestPointerLock.bind(this));
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

    /**
     * requests pointer lock on canvas if input is not blocked
     * @return {Promise<void>}
     */
    async requestPointerLock(){
        if(!this.blockedInput) return;
        await this.canvas.requestPointerLock();
    }

    /**
     * exits pointer lock and resets input
     */
    exitPointerLock(){
        this.resetKeys();
        document.exitPointerLock();
    }

    /**
     * Resets all input
     */
    resetKeys(){
        for(const key in this.keys){
            this.keys[key] = false;
        }
        this.mouse.leftClick = false;
        this.mouse.rightClick = false;
    }

    /**
     * adds callback to execute for when a keydown event is triggered
     * @param {string} key
     * @param {function} callback
     */
    addKeyDownEventListener(key, callback){
        this.#callbacks[key] = callback;
    }

    /**
     * removes callback from keydown event
     * @param {string} key
     * @param {function} callback
     */
    removeKeyDownEventListener(key, callback){
        this.#callbacks[key] = this.#callbacks[key].filter((cb) => cb !== callback);
    }

    /**
     * Adds callback for mouse move event
     * @param {function} callback
     */
    addMouseMoveListener(callback){
        this.#callbacks["mousemove"].push(callback);
    }

    /**
     * Adds callback for mouse down event
     * @param {Function} callback function to add
     * @param {"left" | "right"} button
     */
    addMouseDownListener(callback, button){
        assert(button === "left" || button === "right", "button must be either 'left' or 'right'");
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

    /**
     * executes added callbacks for mouse move event
     * @param event
     */
    onMouseMoveEvent(event){
        if(this.blockedInput) return;
        this.#callbacks["mousemove"].forEach((callback) => callback(event));
    }

    /**
     * executes added callbacks for mouse down event
     * @param event
     */
    onClickEvent(event){
        if(this.blockedInput) return;
        this.#callbacks["mousedown"][event.button]?.forEach((callback) => callback(event));
    }

    /**
     * creates custom event for spell slot change
     * @param {number} slot - [1,5]
     * @return {CustomEvent<{spellSlot: number}>}
     */
    createSpellSlotChangeEvent(slot){
        return new CustomEvent("spellSlotChange", {detail: {spellSlot: slot}});
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
     * @param {event} KeyBoardEvent event
     * @param {boolean} bool true if key is pressed, false if released
     */

    //TODO: remove all keys that need not be checked within an update function
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
                this.dispatchEvent(this.createSpellSlotChangeEvent(1));
                break;
            case slot2Key:
                this.dispatchEvent(this.createSpellSlotChangeEvent(2));
                break;
            case slot3Key:
                this.dispatchEvent(this.createSpellSlotChangeEvent(3));
                break;
            case slot4Key:
                this.dispatchEvent(this.createSpellSlotChangeEvent(4));
                break;
            case slot5Key:
                this.dispatchEvent(this.createSpellSlotChangeEvent(5));
                break;
            case eatingKey:
                this.keys.eating = bool;
                break;

        }
    }

    /**
     * Updates pressed keys
     * @param {event} KeyBoardEvent event
     */
    #onKeyDown(KeyBoardEvent){
        if(this.blockedInput) return;
        this.#onKey(KeyBoardEvent,true);
        this.#callbacks[KeyBoardEvent.code]?.(KeyBoardEvent);
    }

    /**
     * Updates released keys
     * @param {event} KeyBoardEvent event
     */
    #onKeyUp(KeyBoardEvent){
        if(this.blockedInput) return;
        this.#onKey(KeyBoardEvent, false);
    }

    /**
     * Adds callback for settings button clicked
     * @param callback
     */
    addSettingButtonListener(callback) {
        const settingsButton = document.querySelector('.settings-button');
        settingsButton.addEventListener('click', callback);
    }

    addSettingsCloseButtonListener(callback) {
        const settingsCloseButton = document.querySelector('.close-button');
        settingsCloseButton.addEventListener('click', callback);
    }

    addRespawnButtonListener(callback) {
        const respawnButton = document.querySelector('.respawnButton');
        respawnButton.addEventListener('click', callback);
    }

    addLogoutButtonListener(callback) {
        const logoutButton = document.querySelector('.logOutButton');
        logoutButton.addEventListener('click', callback);
    }

    addLeaveMatchButtonListener(callback) {
        const leaveMatchButton = document.querySelector('.leaveMatchButton');
        leaveMatchButton.addEventListener('click', callback);
    }

    addDeleteAccountButtonListener(callback) {
        const deleteAccountButton = document.querySelector('.deleteAccountButton');
        deleteAccountButton.addEventListener('click', callback);
    }

    addApplyButtonListener(callback) {
        const applyButton = document.querySelector('.applyButton');
        applyButton.addEventListener('click', callback);
    }
}