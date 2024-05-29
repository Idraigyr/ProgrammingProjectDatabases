// Initiate the socket connection to the server, under the '/forward' namespace
import {API_URL} from "../configs/EndpointConfigs.js";
import {Subject} from "../Patterns/Subject.js";

export class ForwardingNameSpace extends Subject{

    constructor() {
        super();
        this.socket = io('/forward');
    }

    /**
     * Register the handlers for the socket events
     * @param {{handleMatchFound: function, handleMatchStart: function, handleMatchAbort: function,
     * processReceivedState: function, updateMatchTimer: function, handleMatchEnd: function, processIslandVisitEvent: function,
     * alreadyConnected: function, processOnlineStatus: function}} params - The object containing the handlers
     * @param params
     */
    registerHandlers(params) {
        // Get message from the server, under the '/forward' namespace
        this.socket.on('match_found', (data) => params.handleMatchFound(data));
        this.socket.on('match_start', (data) => params.handleMatchStart(data));
        this.socket.on('match_end', (data) => params.handleMatchEnd(data));
        this.socket.on('match_abort', (data) => params.handleMatchAbort(data));
        this.socket.on('forwarded', (data) =>params.processReceivedState(data));
        this.socket.on('match_timer', (data) => params.updateMatchTimer(data));
        this.socket.on('already_connected', this.dispatchAbortSignal.bind(this));
        this.socket.on('island_visit', (data) => params.processIslandVisitEvent(data));
        this.socket.on('online_status', (data) => params.processOnlineStatus(data));
    }

    /**
     * is called when the server fires the 'already_connected' event
     */
    dispatchAbortSignal(){
        this.dispatchEvent(new CustomEvent('abort'));
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

    /**
     * Send a message to the server that the player is ready to start the match
     * @param {number} matchId
     */
    sendPlayerReadyEvent(matchId) {
        this.socket.emit('player_ready', {'match_id': matchId});
    }

    /**
     * Send a message to the server that the player is leaving the match
     * @param {number} matchId
     */
    sendPlayerLeavingEvent(matchId) {
        this.socket.emit('player_leaving', {'match_id': matchId});
    }

    /**
     * Send a message to the server that the player has won the match
     * @param {number} matchId
     */
    sendAltarDestroyedEvent(matchId) { //TODO: maybe add the time of destruction otherwise event that reaches the server first will be the winner
        this.socket.emit('altar_destroyed', {'match_id': matchId});
    }

    /**
     * Send a message to the server that the player wants to visit/leave a friend's island or accept/reject that friend's visit request
     * or kick out a friend that is visiting the player's island
     * @param {number} userId
     * @param {"accept" | "reject" | "visit" | "leave" | "kick" | "cancel"} request
     */
    sendIslandVisitEvent(userId, request) {
        console.log(`sending island visit event type: ${request} to user: ${userId}`);
        this.socket.emit('island_visit', {'target': userId, 'request': request});
    }

    /**
     * Send a message to the server that the player wants to check the online status of player with given userId
     * @param {number} userId
     */
    sendCheckOnlineStatusEvent(userId) {
        this.socket.emit('check_online_status', {'target': userId});
    }
}