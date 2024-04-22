import {API_URL} from "../configs/EndpointConfigs.js";
/**
 * This function is called when the player levels up
 * @param level level of the player
 * @param maxMana maximum mana of the player
 * @param maxHealth maximum health of the player
 * @param maxGemAttribute maximum number of gem attributes of the player
 * @param maxBuildings maximum number of buildings of the player
 * @param buildings buildings of the player
 */
export function popUp(level, maxMana, maxHealth, maxGemAttribute, maxBuildings, buildings){

    let modal = document.getElementById("LevelUp");
    let levelContent = document.getElementById("LevelPopupContent");
    let newLevelP = document.createElement("p");
    let levelDetails = document.createElement("p");
    newLevelP.textContent = "Level " + level;
    newLevelP.id = "levelNumber"
    levelContent.prepend(newLevelP);
    modal.style.display = "block";


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
        let buildingSS = "";
        for(let i = 0; i < buildings.length; i++){
            if(i !== buildings.length - 1){
                buildingSS += buildings[i] + ", ";
            } else{
                buildingSS += buildings[i];
            }
        }
        levelDetails.innerHTML = `MaxMana: ${maxMana} <br>
            MaxHealth: ${maxHealth} <br>
            MaxGemAttribute: ${maxGemAttribute} <br>
            maxBuildings: ${maxBuildings} <br>
            buildings: ${buildings} <br>
        `;
        detailsContent.appendChild(levelDetails);
        detailsInfo.style.display = "block";
    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
    document.onkeydown = function(event) {
        newLevelP.remove();
        modal.style.display = "none";
        levelDetails.remove();
        detailsInfo.style.display = "none";
    }

}