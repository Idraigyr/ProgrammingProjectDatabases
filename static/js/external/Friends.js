import {API_URL} from "../configs/EndpointConfigs.js";

let playerList = [];
let username = "Unknown user"
let userID = 0;

//TODO: Link username to socketIO
$(document).ready(function(){
     $.ajax({url: '/api/player/list', type: "GET"}).done(function(data){
         playerList = data;
     });
     $.ajax({url: '/api/user_profile', type: "GET"}).done(function(data){
       username = data.username;
       userID = data.id;
   });
});

export function sendRequest(receiverID){
    $.ajax({
        url: '/api/friend_request',
        type: "POST",
        data: JSON.stringify({sender_id: userID, receiver_id:receiverID}),
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
            url: `${API_URL}/api/friend_request/list?receiver_id=${userID}`,
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

export function getPlayerID(receiver_username)  {
    for (let receiver in playerList){
        if (playerList[receiver].username === receiver_username){
            return playerList[receiver].user_profile_id;
        }
    }
}

export function getPlayerUsername(playerID){
    for(let usernamePlayer in playerList){
        if (playerList[usernamePlayer].user_profile_id === playerID ){
            return playerList[usernamePlayer].username;
        }
    }
}

export function  getFriends() {
    for(let player in playerList){
        if(playerList[player].user_profile_id === userID){
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