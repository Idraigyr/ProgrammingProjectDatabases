console.log($)
$("#loginForm").on("submit", function (event) {
    event.preventDefault();
    var username = $("#username").val();
    var password = $("#password").val();
    $.ajax({url: "/api/auth/login?username=" + username + "&password=" + password, type: "POST", error: function (xhr, ajaxOption, thrownError) {
        if (xhr.status !== 200) {
                      // Handle error
            // let msg = data.message
            let message = xhr.responseJSON.message
            alert(message)
        }
        }}).done(function (data) {
        if (data.status === 'success') {
            location.href = "/"
        } else {

        }
    })
})
