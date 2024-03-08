import {
    DownKey, primaryBackwardKey,
    primaryForwardKey,
    primaryLeftKey,
    primaryRightKey, secondaryBackwardKey, secondaryForwardKey,
    secondaryLeftKey,
    secondaryRightKey, slot1Key, slot2Key, slot3Key, slot4Key, slot5Key, sprintKey,
    upKey
} from "../configs/Keybinds.js";

export class InputManager {
    keys = {
        forward: false,
        backward: false,
        left: false,
        right: false,
        up: false,
        down: false,
        spellSlot: 1,
        sprint: false
    }
    mouse = {
        leftClick: false,
        rightClick: false,
        deltaX: 0,
        deltaY: 0,
        x: 0,
        y: 0
    }
    constructor() {
        document.addEventListener("keydown", this.#onKeyDown.bind(this));
        //document.addEventListener("keydown", (e) => this.onKeyDown(e)); better?
        document.addEventListener("keyup", this.#onKeyUp.bind(this));
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

    addMouseMoveListener(callback){
        document.addEventListener("mousemove",callback);
    }

    addScrollListener(callback){
        document.addEventListener("wheel",callback);
    }

    removeMouseMoveListener(callback){
        document.removeEventListener("mousemove",callback);
    }

    removeScrollListener(callback){
        document.removeEventListener("wheel",callback);
    }

    #onKey(KeyBoardEvent, bool){
        switch (event.code){
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
            case slot1Key:
                this.keys.spellSlot = 1;
                break;
            case slot2Key:
                this.keys.spellSlot = 1;
                break;
            case slot3Key:
                this.keys.spellSlot = 1;
                break;
            case slot4Key:
                this.keys.spellSlot = 1;
                break;
            case slot5Key:
                this.keys.spellSlot = 1;
                break;
        }
    }

    #onKeyDown(KeyBoardEvent){
        this.#onKey(KeyBoardEvent,true);
    }
    #onKeyUp(KeyBoardEvent){
        this.#onKey(KeyBoardEvent, false);
    }
}