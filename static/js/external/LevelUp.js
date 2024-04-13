export function popUp(level, maxMana, maxHealth, maxGemAttribute){
    let title = "Level " + level.toString();
    let contentHTML = `
    MaxMana : ${maxMana} <br>
    MaxHealth: ${maxHealth} <br> 
    MaxGemAttribute: ${maxGemAttribute} <br>
    MaxBuildings: `;
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

export function popUpBuilding(level, levelUpTime, gemSlots){
    let title = "Building Upgraded to Level " + level.toString();
    let contentHTML = `
    Level Up Time : ${levelUpTime} <br>
    Gem Slots: ${gemSlots}`;
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