document.addEventListener('DOMContentLoaded', (event) => {
    Swal.fire({
        position: "top",
        confirmButtonText: "Show Features",
        timer: 5000,
        timerProgressBar: true,
        title: "LevelUP",
        icon: "success"

    }).then((result) =>{
        Swal.fire({
            html: "Features: ",
            showConfirmButton: false

        })
    });
});
