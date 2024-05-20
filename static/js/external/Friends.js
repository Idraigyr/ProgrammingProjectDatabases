import {API_URL} from "../configs/EndpointConfigs.js";
import {userId} from "./ChatNamespace.js"

export let playerList = [];

$(document).ready(function(){
    try {
        $.ajax({url: '/api/player/list', type: "GET"}).done(function(data){
             playerList = data;
         });
    } catch (e) {
        console.error(e);
    }

});

async function setPlayerList() {
    try {playerList = await $.ajax({url: '/api/player/list', type: "GET"}); } catch (error) {console.error(error)}
}

export function sendRequest(receiverID){
    $.ajax({
        url: '/api/friend_request',
        type: "POST",
        data: JSON.stringify({sender_id: userId, receiver_id:receiverID}),
        dataType: "json",
        contentType: "application/json",
        error: (e) => {
            console.error(e);
        }
    }).done(() => {
        console.log("Sending request");

    }).fail(()=>{
        console.log("Sending failed");
    })
}

export async function getFriendRequests() {
    try {
        const response = await $.ajax({
            url: `${API_URL}/api/friend_request/list?receiver_id=${userId}`,
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
        });

        // Assuming response is an array, you can directly return it
        return response;
    } catch (error) {
        console.error(error);
        // Handle error appropriately, maybe throw it again or return an empty array
        return [];
    }
}

export async function getPlayerID(receiver_username)  {
    await setPlayerList();
    for (let receiver in playerList){
        if (playerList[receiver].username === receiver_username){
            return playerList[receiver].user_profile_id;
        }
    }
}

export async function getPlayerUsername(playerID){
    await setPlayerList();
    for (let usernamePlayer in playerList) {
        if (playerList[usernamePlayer].user_profile_id === playerID) {
            return playerList[usernamePlayer].username;
        }
    }
}

export async function  getFriends() {
    await setPlayerList();
    for (let player in playerList) {
        if (playerList[player].user_profile_id === userId) {
            return playerList[player].friends;
        }
    }
}

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