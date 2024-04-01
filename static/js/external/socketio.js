let username = "Unknown user";
let userId = 0;

$(document).ready(function(){
   $.ajax({url: '/api/user_profile', type: 'GET'}).done(function(data){
       username = data.username;
       userId = data.id;
       console.log("Logged in as " + username)
   });
});

document.addEventListener('DOMContentLoaded', ()=>{
    let socket = io();

    //get message from the server
    socket.on('message', function(data) {
        const messageContainer = document.createElement('div');
        const messageText = document.createElement('div');
        const span_time = document.createElement('div');

        messageText.textContent = data.message;
        span_time.textContent = data.time_stamp;

            // Add classes for styling
        messageText.classList.add('message');
        span_time.classList.add('time');
           // Conditionally set the alignment based on the username
        if (data.username === username) {
            messageContainer.classList.add('MyMsg');
        } else{
            messageContainer.classList.add('OtherMsg');
            const span_username = document.createElement('div');
            span_username.textContent = data.username;
            span_username.classList.add('user');
            messageContainer.appendChild(span_username);
        }
        messageContainer.appendChild(messageText);
        messageContainer.appendChild(span_time);
        document.querySelector('#chatMessages').appendChild(messageContainer);
        document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;

    });

    //Sends message to the server
    document.querySelector('#sendMessage').onclick = () =>{
        const message = document.querySelector('#chatInput').value;
        const messageData = {'message': message, 'username': username, 'user_id': userId};
        socket.emit('message', messageData);
    }
})