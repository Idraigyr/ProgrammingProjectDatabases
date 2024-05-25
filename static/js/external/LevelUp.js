import {API_URL} from "../configs/EndpointConfigs.js";
/**
 * This function is called when the player levels up
 * @param level level of the player
 * @param maxMana maximum mana of the player
 * @param maxHealth maximum health of the player
 * @param buildings
 * @param Spells
 */
export function popUp(level, maxMana, maxHealth, buildings, Spells){

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