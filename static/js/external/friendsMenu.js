import * as AllFriends from "./Friends.js"
import {API_URL} from "../configs/EndpointConfigs.js";

document.addEventListener('DOMContentLoaded', (event) => {
    let friendsButton = document.getElementById("FriendsButton");

    let Friends = document.getElementById("Friends");

    let addFriendButton = document.getElementById("friendAddButton");

    let requestFriendButton = document.getElementById("friendRequestButton");

    let listFriendButton = document.getElementById("friendListButton");

    let addFriend = document.getElementById("addFriend");

    let FriendList = document.getElementById("listFriend");

    let requestList = document.getElementById("listRequests");

    const sendRequestButton = document.getElementById('requestSubmit');

    const usernameFriend = document.getElementById("usernameFriend");


    friendsButton.onclick = async function () {
        if (Friends.style.display === "block") {
            Friends.style.display = "none";
            addFriendButton.style.display = "none";
            listFriendButton.style.display = "none";
            requestFriendButton.style.display = "none";
        } else {
            await populateFriends();
            Friends.style.display = "block";
            addFriendButton.style.display = "block";
            listFriendButton.style.display = "block"
            requestFriendButton.style.display = "block";
        }

    }

    addFriendButton.onclick = function () {
        FriendList.style.display = "none";
        requestList.style.display = "none";
        addFriend.style.display = "block";
    }


    listFriendButton.onclick = async function () {
        addFriend.style.display = "none";
        requestList.style.display = "none";
        await populateFriends();
        FriendList.style.display = "block";
    }

    requestFriendButton.onclick = async function () {
        addFriend.style.display = "none";
        FriendList.style.display = "none";
        await populateRequests();
        requestList.style.display = "block";
    }

    sendRequestButton.onclick = async function () {
        let receiver_id = await AllFriends.getPlayerID(usernameFriend.value.trim());
        AllFriends.sendRequest(receiver_id);
        usernameFriend.value = '';
    }

    async function populateFriends() {

        const listFriend = document.getElementById('listFriend');
        listFriend.innerHTML = '';

        let friendsList = await AllFriends.getFriends();

        for (const friends of friendsList){
            // add friend
            const friend = document.createElement('div');
            friend.id = friends;
            friend.classList.add('friend');
            friend.innerHTML = `${await AllFriends.getPlayerUsername(friends)}`;
            const viewIsland = document.createElement('button');
            viewIsland.id = "viewIsland";
            viewIsland.innerHTML = `View Island`;
            viewIsland.classList.add('View-Island');
            friend.appendChild(viewIsland);
            listFriend.appendChild(friend);
        }
    }

    async function populateRequests() {
        const listRequest = document.getElementById('listRequests');
        listRequest.innerHTML = '';
        let tempRequests = await AllFriends.getFriendRequests();
        for (const request of tempRequests) {
            let status = await AllFriends.getFriendRequestStatus(request.id);
            if(status === "pending"){
                const requestElement = document.createElement('div');
                requestElement.id = "Request-bar"; // Assume each request has a unique sender ID
                requestElement.classList.add('request');
                requestElement.innerHTML = `${await AllFriends.getPlayerUsername(request.sender_id)}`;

                const acceptButton = document.createElement('button');
                acceptButton.classList.add('Accept-Request');
                acceptButton.onclick = function (){
                    acceptFriendRequest(request);
                    requestElement.remove()
                }

                const rejectButton = document.createElement('button');
                rejectButton.classList.add('Reject-Request');
                rejectButton.onclick = function (){
                    rejectFriendRequest(request.id);
                    requestElement.remove()
                }
                requestElement.appendChild(acceptButton);
                requestElement.appendChild(rejectButton);
                listRequest.appendChild(requestElement);
            }
        }
    }

    function acceptFriendRequest(request) {
        // Handle accepting a friend request here
        try {
            $.ajax({
                url: `${API_URL}/api/friend_request`,
                type: "PUT",
                data: JSON.stringify(formatPUTFriend(request.id, "accepted")),
                dataType: "json",
                contentType: "application/json",
                error: (e) => {
                    console.error(e);
                }
            }).done( function (){
                $.ajax({
                    url: `${API_URL}/api/friend_request?id=${request.id}`,
                    type: "DELETE",
                    contentType: "application/json",
                    error: (e) => {
                        console.error(e);
                    }
                })

            });
            for (let player in AllFriends.playerList){
                if(AllFriends.playerList[player].user_profile_id === request.receiver_id){
                    AllFriends.playerList[player].friends.push(request.sender_id);
                }
            }
        } catch (err){
            console.error(err);
        }

    }

    function rejectFriendRequest(requestID) {
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
            }).done( function (){
                $.ajax({
                    url: `${API_URL}/api/friend_request?id=${requestID}`,
                    type: "DELETE",
                    contentType: "application/json",
                    error: (e) => {
                        console.error(e);
                    }
                })
            });
        } catch (err){
            console.error(err);
        }
    }

    function formatPUTFriend(requestID, status) {
        return {id: requestID, status: status};
    }

    window.onclick = function(event) {
        if (!Friends.contains(event.target) && event.target !== friendsButton  && !event.target.classList.contains('Accept-Request') && !event.target.classList.contains('Reject-Request')){
            Friends.style.display = 'none';
        }
    }



});