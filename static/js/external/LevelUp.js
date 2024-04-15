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