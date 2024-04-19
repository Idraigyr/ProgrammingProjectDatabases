// Initiate the socket connection to the server, under the '/forward' namespace
export class ForwardingNameSpace {

    constructor() {
        this.socket = io('/forward');
    }

    registerHandlers() {
        // Get message from the server, under the '/forward' namespace
        this.socket.on('matchFound', (data) => this.handleMatchFound(data));
        this.socket.on('forwarded', (data) => this.handleForwardedMessage(data));

    }

    handleMatchFound(data) {
        // TODO - @Flynn - Implement this method
        console.log(data); // eg { target: <this_user_id>, ... (other custom attributes) }
    }

    handleForwardedMessage(data) {
        // TODO - @Flynn - Implement this method
        const sender = data.sender // sender user id
        const target = data.target // target user id
        if (sender === target) {
            // Another session of our player emitted this message, probably should update our internal state as well
        }

        console.log(data); // eg { target: <this_user_id>, ... (other custom attributes) }
    }

    sendTo(targetId, data) {
        /**
         * Send data (JSON) to the server, under the '/forward' namespace
         * @param {string} targetId - The target userId
         */
        // Cursed way to merge two JSON objects
        this.socket.emit('forward', {...{'target': targetId}, ...data});
    }

}