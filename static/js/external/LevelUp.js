import {API_URL} from "../configs/EndpointConfigs.js";
/**
 * This function is called when the player levels up
 * @param level level of the player
 * @param maxMana maximum mana of the player
 * @param maxHealth maximum health of the player
 * @param buildings
 * @param Spells
 */
export function popUp(level, maxMana, maxHealth, buildings, Spells){ //TODO: rewrite this make it more general

    let modal = document.getElementById("LevelUp");
    let levelContent = document.getElementById("LevelPopupContent");
    let newLevelP = document.createElement("p");
    let levelDetails = document.createElement("p");
    newLevelP.textContent = "Level " + level;
    newLevelP.id = "levelNumber"
    levelContent.prepend(newLevelP);
    modal.style.display = "block";

    setTimeout(function () {
        newLevelP.remove();
        modal.style.display = "none";
    }, 5000);


    let details = document.getElementById("detailsButton");

    let detailsInfo = document.getElementById("LevelDetails")

    let detailsContent = document.getElementById("detailsContent");

    window.onclick = function(event) {
        if (event.target === modal) {
            newLevelP.remove();
            modal.style.display = "none";
        }
        if (event.target === detailsInfo) {
            levelDetails.remove();
            detailsInfo.style.display = "none";
        }
    }



    details.onclick = function() {
        newLevelP.remove();
        modal.style.display = "none";
        levelDetails.id = "levelDetails"
        levelDetails.innerHTML = `MaxMana: ${maxMana} <br>
            MaxHealth: ${maxHealth} <br>
            Buildings: ${arrayStringConverter(buildings)} <br>
            Spells: ${arrayStringConverter(Spells)}
        `;
        detailsContent.appendChild(levelDetails);
        detailsInfo.style.display = "block";
    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
    document.onkeydown = function(event) {
        levelDetails.remove();
        detailsInfo.style.display = "none";
    }
}

let interval = null;
let timeout = null;


function arrayStringConverter(array) {
    let string = "[ ";
    for(let i = 0; i < array.length; i++){
        if (i !== array.length-1){
            string += array[i] + ", ";
        } else{
            string += array[i] + "]";
        }
    }
    return string;
}


/**
 * shows an alert pop up with the given message that disappears after a certain amount of time,
 * when this function is called again before the alert disappears, the pop up content is overwritten
 * @param {string} message - the message to display
 * @param {number} duration - the duration of the alert in milliseconds
 * @param {number} updateInterval - the interval at which the alert updates in milliseconds
 */
export function alertPopUp(message, duration = 3000, updateInterval = 10){
    const alertContainer = document.getElementById("alert-container");
    const alertContent = document.getElementById("alert-content");
    const timeBar = document.getElementById("alert-time-fill");
    alertContent.innerText = message;
    alertContainer.style.display = "flex";
    const decrement = 100*updateInterval/duration;

    if(interval){
        clearInterval(interval);
        interval = null;
    }
    if(timeout){
        clearTimeout(timeout);
        timeBar.style.width = "100%";
        timeout = null;
    }

    let width = 100;

    interval = setInterval(() => {
        width -= decrement;
        console.log(width);
        timeBar.style.width = `${width}%`;
        console.log(timeBar.getBoundingClientRect().width);
    }, updateInterval)

    timeout = setTimeout(function () {
        alertContainer.style.display = "none";
        timeBar.style.width = "100%";
        clearInterval(interval);
    }, duration);
}