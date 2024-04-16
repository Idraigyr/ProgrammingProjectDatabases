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
    let builds = "";
    for(let i = 0; i < buildings.length; i++){
        if(i !== buildings.length-1){
            builds += buildings[i] +", " ;
        }
        else{
            builds += buildings[i];
        }
    }
    let title = "Level " + level.toString();
    let contentHTML = `
    MaxMana : ${maxMana} <br>
    MaxHealth: ${maxHealth} <br> 
    MaxGemAttribute: ${maxGemAttribute} <br>
    MaxBuildings: ${maxBuildings} <br>
    Buildings: ${builds}`;
    Swal.fire({
        position: "top",
        confirmButtonText: "Show Features",
        timer: 5000,
        timerProgressBar: true,
        title: title,
        icon: "success"

    }).then((result) =>{
        Swal.fire({
            html: contentHTML,
            showConfirmButton: false

        })
    });
}