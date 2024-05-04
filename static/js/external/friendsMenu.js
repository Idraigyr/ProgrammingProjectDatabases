import * as AllFriends from "./Friends.js"
import {API_URL} from "../configs/EndpointConfigs.js";

document.addEventListener('DOMContentLoaded', (event) => {
    let friendsButton = document.getElementById("FriendsButton");

    let Friends = document.getElementById("Friends");

    let addFriendButton = document.getElementById("friendAddButton");

    let reauestFriendButton = document.getElementById("friendRequestButton");

    let listFriendButton = document.getElementById("friendListButton");

    let addFriend = document.getElementById("addFriend");

    let FriendList = document.getElementById("listFriend");

    let requestList = document.getElementById("listRequests");

    const sendRequestButton = document.getElementById('requestSubmit');

    const usernameFriend = document.getElementById("usernameFriend");

    const acceptRequest = document.getElementById("acceptRequest");

    friendsButton.onclick = function () {
        if (Friends.style.display === "block") {
            Friends.style.display = "none";
            addFriendButton.style.display = "none";
            listFriendButton.style.display = "none";
            reauestFriendButton.style.display = "none";
        } else {
            populateFriends();
            Friends.style.display = "block";
            addFriendButton.style.display = "block";
            listFriendButton.style.display = "block"
            reauestFriendButton.style.display = "block";
        }

    }

    addFriendButton.onclick = function () {
        FriendList.style.display = "none";
        requestList.style.display = "none";
        addFriend.style.display = "block";
    }


    listFriendButton.onclick = function () {
        addFriend.style.display = "none";
        requestList.style.display = "none";
        populateFriends();
        FriendList.style.display = "block";
    }

    reauestFriendButton.onclick = function () {
        addFriend.style.display = "none";
        FriendList.style.display = "none";
        populateRequests();
        requestList.style.display = "block";
    }

    sendRequestButton.onclick = function () {
        let receiver_id = AllFriends.getPlayerID(usernameFriend.value.trim());
        AllFriends.sendRequest(receiver_id);
        usernameFriend.value = '';
    }

    function populateFriends() {

        const listFriend = document.getElementById('listFriend');
        listFriend.innerHTML = '';

        let friendsList = AllFriends.getFriends();

        friendsList.forEach(friends => {
            // add friend
            const friend = document.createElement('div');
            friend.id = friends;
            friend.classList.add('friend');
            friend.innerHTML = `${AllFriends.getPlayerUsername(friends)}`;
            const viewIsland = document.createElement('button');
            viewIsland.id = "viewIsland";
            viewIsland.innerHTML = `View Island`;
            viewIsland.classList.add('View-Island');
            friend.appendChild(viewIsland);
            listFriend.appendChild(friend);
        });
    }

    async function populateRequests() {
        const listRequest = document.getElementById('listRequests');
        listRequest.innerHTML = '';
        let tempRequests = await AllFriends.getFriendRequests();
        for (const request of tempRequests) {
            let status = await AllFriends.getFriendRequestStatus(request.id);
            if(status === "pending"){
                const requestElement = document.createElement('div');
                requestElement.id = request.sender_id; // Assume each request has a unique sender ID
                requestElement.classList.add('request');
                requestElement.innerHTML = `${AllFriends.getPlayerUsername(request.sender_id)}`;

                const acceptButton = document.createElement('button');
                acceptButton.classList.add('Accept-Request');
                acceptButton.onclick = () => acceptFriendRequest(request.id);

                const rejectButton = document.createElement('button');
                rejectButton.classList.add('Reject-Request');
                rejectButton.onclick = () => rejectFriendRequest(request.id);

                requestElement.appendChild(acceptButton);
                requestElement.appendChild(rejectButton);
                listRequest.appendChild(requestElement);
            }
        }
    }

    function acceptFriendRequest(requestID) {
        // Handle accepting a friend request here
        try {
            $.ajax({
                url: `${API_URL}/api/friend_request`,
                type: "PUT",
                data: JSON.stringify(formatPUTFriend(requestID, "accepted")),
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



});