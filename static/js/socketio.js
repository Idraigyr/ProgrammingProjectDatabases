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
        if (data.usersname === username) {
            messageContainer.classList.add('MyMsg');
        } else{
            messageContainer.classList.add('OtherMsg');
            const span_username = document.createElement('div');
            span_username.textContent = data.usersname;
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
        const messageData = {message: document.querySelector('#chatInput').value, 'username': username};
        socket.emit('message', messageData);
    }
})