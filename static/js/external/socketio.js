export let username = "Unknown user";
let admin = false;
export let userId = 0;

// TODO - @Flynn - This is a hacky way to get the username and admin status, link it to the PlayerInfo class
$(document).ready(function(){
   $.ajax({url: '/api/user_profile', type: 'GET'}).done(function(data){
       username = data.username;
       admin = data.admin;
       userId = data.id;
       console.log("Logged in as " + username)
   });
});

let regex = {
    "mana": /\\mana\((0*[0-9]\d*)\)/,
    "level": /\\level\((0*[0-9]\d*)\)/,
    "xp": /\\xp\((0*[0-9]\d*)\)/,
    "position": /\\position\(([+-]?\d+(\.\d+)?),([+-]?\d+(\.\d+)?),([+-]?\d+(\.\d+)?)\)/,
    "crystal": /\\crystal\((0*[1-9]\d*)\)/,
    "shieldCooldown": /\\shieldCooldown\((0*[0-9]\d*)\)/,
    "fireCooldown": /\\fireCooldown\((0*[0-9]\d*)\)/,
    "thunderCloudCooldown": /\\thunderCloudCooldown\((0*[0-9]\d*)\)/,
    "buildCooldown": /\\buildCooldown\((0*[0-9]\d*)\)/,
    "health": /\\health\((0*[0-9]\d*)\)/,
    "forceSpells": /\\forceSpells/,
    "forceBuild": /\\forceBuild/
}
export class ChatNamespace {


    constructor(app) {
        this.socket = io('/chat');
        this.app = app;
    }

    registerHandlers() {

        //get message from the server, under the '/chat' namespace
        this.socket.on('message', (data) => this.handleMessage(data));
        //Sends message to the server
        document.querySelector('#sendMessage').onclick = () => this.handleSendMessage()
    }


    handleMessage(data) {
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
        } else {
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
    }

    handleSendMessage() {
        const message = document.querySelector('#chatInput').value;
        const messageData = {'message': message, 'username': username, 'user_id': userId};
        //add cheats
        if (admin) {
            if (message.match(regex["mana"])) {
                this.app.playerInfo.updateMana({detail: {
                    current: Number(message.match(regex["mana"])[1]),
                    total: this.app.playerInfo.maxMana
                    }});
            } else if (message.match(regex["level"])) {
                if (Number(message.match(regex["level"])[1]) < 5 && Number(message.match(regex["level"])[1]) >= 0) {
                    this.app.playerInfo.changeLevel(Number(message.match(regex["level"])[1]));
                } else {
                    this.socket.emit('message', messageData);
                }
            } else if (message.match(regex["xp"])) {
                this.app.playerInfo.changeXP(Number(message.match(regex["xp"])[1]));
            } else if (message.match(regex["crystal"])) {
                this.app.playerInfo.changeCrystals(Number(message.match(regex["crystal"])[1]));
            } else if (message.match(regex["health"])) {
                this.app.worldManager.updatePlayerStats({detail:
                        {
                            type: ["health"],
                            params: {
                                health: Number(message.match(regex["health"])[1])
                            }
                        }
                })
            } else if (message.match(regex["position"])) {
                this.app.playerController.tempPosition.x = Number(message.match(regex["position"])[1]);
                this.app.playerController.tempPosition.y = Number(message.match(regex["position"])[3]);
                this.app.playerController.tempPosition.z = Number(message.match(regex["position"])[5]);
            } else if (message.match(regex["shieldCooldown"])) {
                this.app.spellCaster.changeCooldown("shield", Number(message.match(regex["shieldCooldown"])[1]));
            } else if (message.match(regex["fireCooldown"])) {
                this.app.spellCaster.changeCooldown("fireball", Number(message.match(regex["fireCooldown"])[1]));

            } else if (message.match(regex["buildCooldown"])) {
                this.app.spellCaster.changeCooldown("build", Number(message.match(regex["buildCooldown"])[1]));

            } else if (message.match(regex["forceSpells"])) {
                this.app.spellCaster.changeSpellCost();
            } else if (message.match(regex["thunderCloudCooldown"])) {
                this.app.spellCaster.changeCooldown("thundercloud", Number(message.match(regex["thunderCloudCooldown"])[1]));
            } else if (message.match(regex["forceBuild"])){
                this.app.worldManager.cheats = true;
            }
            else if (message !== "" && !message.startsWith("\\")){
                this.socket.emit('message', messageData);
            }
        } else if (!message.startsWith("\\")) { // Don't send the message if it starts with a backslash (cheat)
            this.socket.emit('message', messageData);
        } else{
            if (message !== ""){
                this.socket.emit('message', messageData);
            }
        }
    }
}