// Initiate the socket connection to the server, under the '/forward' namespace
export class ForwardingNameSpace {

    constructor() {
        this.socket = io('/forward');
    }

    registerHandlers() {

        // Get message from the server, under the '/forward' namespace
        this.socket.on('positionUpdate', (data) => this.handlePositionUpdate(data));
        // Etc, etc 

    }

    handlePositionUpdate(data) {
        // TODO - @Flynn - Implement this method
        console.log(data);
    }

}