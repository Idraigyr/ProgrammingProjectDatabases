import {assert} from "../helpers.js";

/**
 * Class to manage the loading screen
 */
class LoadingScreen{
    #loadingScreen;
    #progressBar;
    constructor(params) {
        this.#loadingScreen = document.querySelector('.loading-animation');
        this.#progressBar = document.getElementById('progress-bar');
    }

    /**
     * Render the loading screen
     * @return {Promise<void>}
     */
    async render(){
        this.#loadingScreen.style.display = 'block';
    }

    /**
     * Set the progress bar text
     * @param {string} text
     * @return {Promise<void>}
     */
    async setText(text){
        this.#progressBar.labels[0].innerText = text;

    }

    /**
     * Set the amount the progress bar is filled
     * @param {number} value - between 0 and 100
     * @return {Promise<void>}
     */
    async setValue(value){
        assert(value >= 0 && value <= 100, 'Value must be between 0 and 100');
        this.#progressBar.value = value;
    }

    /**
     * hide the loading screen
     * @return {Promise<void>}
     */
    async hide(){
        this.#loadingScreen.style.display = 'none';
        await this.setValue(0);
    }

}

export const loadingScreen = new LoadingScreen();