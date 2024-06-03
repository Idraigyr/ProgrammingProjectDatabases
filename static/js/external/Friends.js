import {API_URL, pendingFriendRequestURI} from "../configs/EndpointConfigs.js";
import {userId} from "./ChatNamespace.js"
import {alertPopUp} from "./LevelUp.js";

export let playerList = [];

$(document).ready(function(){
    try {
        $.ajax({url: `${API_URL}/api/player/list`, type: "GET"}).done(function(data){
             playerList = data;
         });
    } catch (e) {
        console.error(e);
    }

});

/**
 * Sets the player list to the list of players
 * @returns {Promise<void>} the player list
 */
export async function setPlayerList() {
    try {
        playerList = await $.ajax({url: `${API_URL}/api/player/list`, type: "GET"});
        console.log("setting player list");
    } catch (error) {
        console.error(error)
    }
}

/**
 * Sends a friend request to the player with the given ID
 * @param receiverID the id of the player to send the request to
 */
export function sendRequest(receiverID){
    $.ajax({
        url: `${API_URL}/api/friend_request`,
        type: "POST",
        data: JSON.stringify({sender_id: userId, receiver_id:receiverID}),
        dataType: "json",
        contentType: "application/json",
        error: (jqXHR, textStatus, err) => {
            if(jqXHR.status === 409){
                console.error("Friend request already exists");
                alertPopUp("You have already sent a friend request to this player");
            }
        }
    }).done(() => {
        console.log("Sending request");

    }).fail(()=>{
        console.log("Sending failed");
    });
}

/**
 * Get the friend requests of the current player
 * @returns {Promise<*|*[]>} the friend requests of the current player
 */
export async function getFriendRequests() {
    await setPlayerList();
    try {
        return await $.ajax({
            url: `${API_URL}/${pendingFriendRequestURI}?receiver_id=${userId}`,
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        });
    } catch (error) {
        console.error(error);
        // Handle error appropriately, maybe throw it again or return an empty array
        return [];
    }
}

/**
 * Get the playerID of a player given their username
 * make sure the playerList is updated before calling this function
 * @param receiver_username
 * @return {number}
 */
export function getPlayerID(receiver_username)  {
    for (let receiver in playerList){
        if (playerList[receiver].username === receiver_username){
            return playerList[receiver].user_profile_id;
        }
    }
}

/**
 * Get the username of a player given their playerID
 * make sure the playerList is updated before calling this function
 * @param playerID
 * @return {string}
 */
export function getPlayerUsername(playerID){
    for (let usernamePlayer in playerList) {
        if (playerList[usernamePlayer].user_profile_id === playerID) {
            return playerList[usernamePlayer].username;
        }
    }
}

/**
 * Get the friends of the current player
 * @returns {Promise<[]|*>} the friends of the current player
 */
export async function  getFriends() {
    await setPlayerList();
    for (let player in playerList) {
        if (playerList[player].user_profile_id === userId) {
            return playerList[player].friends;
        }
    }
}

/**
 * Get the status of a friend request
 * @param friendRequestID the id of the friend request
 * @returns {Promise<*|*[]>} the status of the friend request
 */
export async function getFriendRequestStatus(friendRequestID){
    try {
        const response = await $.ajax({
            url: `${API_URL}/api/friend_request?id=${friendRequestID}`,
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        });
        return response.status;
    } catch (error) {
        console.error(error);
        // Handle error appropriately, maybe throw it again or return an empty array
        return [];
    }
}

/**
 * Accepts a friend request
 * @param request_id the id of the friend request
 */
export function acceptFriendRequest(request_id) {
        // Handle accepting a friend request here
        try {
            $.ajax({
                url: `${API_URL}/api/friend_request`,
                type: "PUT",
                data: JSON.stringify(formatPUTFriend(request_id, "accepted")),
                dataType: "json",
                contentType: "application/json",
                error: (e) => {
                    console.error(e);
                }
            })
        } catch (err){
            console.error(err);
        }

    }

/**
 * Rejects a friend request
 * @param requestID the id of the friend request
 */
export function rejectFriendRequest(requestID) {
    // Handle rejecting a friend request here
    try {
        $.ajax({
            url: `${API_URL}/api/friend_request`,
            type: "PUT",
            data: JSON.stringify(formatPUTFriend(requestID, "rejected")),
            dataType: "json",
            contentType: "application/json",
            error: (e) => {
                console.error(e);
            }
        })
    } catch (err){
        console.error(err);
    }
}

export function formatPUTFriend(requestID, status) {
    return {id: requestID, status: status};
}