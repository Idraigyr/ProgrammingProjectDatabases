// Login form event listener
$("#loginForm").on("submit", function(event) {
    event.preventDefault();
    let username = $("#username").val();
    let password = $("#password").val();
    $.ajax({url: "/api/auth/login?username=" + username + "&password=" + password, type: "POST", error: function (xhr, ajaxOption, thrownError) {
        if (xhr.status !== 200) {
            if (xhr.status >= 500) {
                alert("Server error. Please try again later.")
            } else {
                                      // Handle error
            // let msg = data.message
            let message = xhr.responseJSON.message
            alert(message)
            }
        }
        }}).done(function (data) {
        if (data.status === 'success') {
            location.href = "/"
        } else {

        }
    })
});


// Register form event listener
let form = document.getElementById("registerForm")
if (form) { // If the form exists, it's not always present like on the login page
    form.addEventListener("submit",function (event){
    event.preventDefault();
    let username = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let firstname = document.getElementById("firstname").value;
    let lastname = document.getElementById("lastname").value;
    $.ajax({url: "/api/auth/register?username=" + username + "&password=" + password + "&firstname=" + firstname + "&lastname=" + lastname,
        type: "POST", error: function (xhr, ajaxOption, thrownError) {
        if (xhr.status !== 200) {
            if(xhr.status === 409){
                let message = xhr.responseJSON.message;
                alert(message);
            } else if (xhr.status >= 500) {
                alert("Server error. Please try again later.")
            }
                      // Handle error
            // let msg = data.message
            else {
                let message = xhr.responseJSON.message
                alert(message)
            }
        }
        }}).done(function (data) {
        if (data.status === 'success') {
            location.href = "/"
        } else {

        }
    })
})
}


// Add Google Sign In button event listener
$("#google-login").on("click", function(event) {
    event.preventDefault(); // Whatever the default action is, just prevent it.
    location.href = "/api/auth/oauth2/login"; // And redirect
});
