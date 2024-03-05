document.addEventListener('DOMContentLoaded', ()=>{
    let socket = io();

    //get message from the server
    socket.on('message', function(data) {
        const  p = document.createElement('p');
        const span_time = document.createElement('span');
        const br = document.createElement('br');
        span_time.innerHTML = data.time_stamp;

        if (data.usersname === username) {
            p.innerHTML = data.message + br.outerHTML + span_time.outerHTML;
            p.classList.add('MyMsg');
        } else {
            const span_username = document.createElement('span');
            span_username.innerHTML = data.usersname;
            p.innerHTML = span_username.outerHTML + br.outerHTML + data.message + br.outerHTML + span_time.outerHTML;
            p.classList.add('OtherMsg');
        }

        document.querySelector('#chatMessages').appendChild(p);
        document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;

    });

    //Sends message to the server
    document.querySelector('#sendMessage').onclick = () =>{
        const messageData = {message: document.querySelector('#chatInput').value, 'username': username};
        socket.emit('message', messageData);
    }
})