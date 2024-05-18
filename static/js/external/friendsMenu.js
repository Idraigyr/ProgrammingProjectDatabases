import * as AllFriends from "./Friends.js"

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

    const usernameExist = document.getElementById("UsernameExist");


    friendsButton.onclick = async function () {
        if (Friends.style.display === "block") {
            Friends.style.display = "none";
            addFriendButton.style.display = "none";
            listFriendButton.style.display = "none";
            requestFriendButton.style.display = "none";
        } else {
            FriendList.style.display = "none";
            await populateFriends();
            Friends.style.display = "block";
            addFriendButton.style.display = "block";
            listFriendButton.style.display = "block"
            requestFriendButton.style.display = "block";
            FriendList.style.display = "block";
        }

    }

    addFriendButton.onclick = function () {
        FriendList.style.display = "none";
        requestList.style.display = "none";
        addFriend.style.display = "block";
        usernameExist.style.display = "none";
    }


    listFriendButton.onclick = async function () {
        FriendList.style.display = "none";
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
        //check if the username exists
        usernameExist.style.display = "none";
        let exists = false;
        await AllFriends.setPlayerList();
        for(let player of AllFriends.playerList){
            if(player.username === usernameFriend.value.trim()){
                exists = true;
                break;
            }
        }

        if(exists){
            let receiver_id = await AllFriends.getPlayerID(usernameFriend.value.trim());
            AllFriends.sendRequest(receiver_id);
            usernameFriend.value = '';
        } else{
            usernameExist.style.display = "block";
            usernameFriend.value = '';

        }

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
                    AllFriends.acceptFriendRequest(request);
                    requestElement.remove()
                }

                const rejectButton = document.createElement('button');
                rejectButton.classList.add('Reject-Request');
                rejectButton.onclick = function (){
                    AllFriends.rejectFriendRequest(request.id);
                    requestElement.remove()
                }
                requestElement.appendChild(acceptButton);
                requestElement.appendChild(rejectButton);
                listRequest.appendChild(requestElement);
            }
        }
    }

    window.onclick = function(event) {
        if (!Friends.contains(event.target) && event.target !== friendsButton  && !event.target.classList.contains('Accept-Request') && !event.target.classList.contains('Reject-Request')){
            Friends.style.display = 'none';
        }
    }



});