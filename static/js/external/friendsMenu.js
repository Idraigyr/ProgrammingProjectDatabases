import * as AllFriends from "./Friends.js"
import {getFriendRequestStatus} from "./Friends.js";

export class FriendsMenu {

    constructor() {
        this.friendsButton = document.getElementById("FriendsButton");

        this.Friends = document.getElementById("Friends");

        this.addFriendButton = document.getElementById("friendAddButton");

        this.requestFriendButton = document.getElementById("friendRequestButton");

        this.listFriendButton = document.getElementById("friendListButton");

        this.addFriend = document.getElementById("addFriend");

        this.FriendList = document.getElementById("listFriend");

        this.requestList = document.getElementById("listRequests");

        this.sendRequestButton = document.getElementById('requestSubmit');
        this.usernameFriend = document.getElementById("usernameFriend");

        this.usernameExist = document.getElementById("UsernameExist");

        this.listFriend = document.getElementById('listFriend');

        this.listRequest = document.getElementById('listRequests');

        this.friends =  [];

        this.requests = [];

        this.inMatch = false;

        if(!this.inMatch){
            this.friendsButton.onclick = this.toggleFriendsDisplay.bind(this);
            this.addFriendButton.onclick = this.toggleAddFriendButton.bind(this);
            this.listFriendButton.onclick = this.toggleListFriendButton.bind(this);
            this.requestFriendButton.onclick = this.toggleRequestFriendButton.bind(this);
            this.sendRequestButton.onclick = this.toggleSendRequestButton.bind(this)
            window.addEventListener('click', this.toggleWindowbutton.bind(this));
        }

    }


    async toggleFriendsDisplay() {
        if(!this.inMatch){
            if (this.Friends.style.display === "block") {
                this.Friends.style.display = "none";
                this.addFriendButton.style.display = "none";
                this.listFriendButton.style.display = "none";
                this.requestFriendButton.style.display = "none";
            } else {
                this.FriendList.style.display = "none";
                await this.populateFriends();
                this.Friends.style.display = "block";
                this.addFriendButton.style.display = "block";
                this.listFriendButton.style.display = "block"
                this.requestFriendButton.style.display = "block";
                this.FriendList.style.display = "block";
            }
        }
    }

    toggleAddFriendButton() {
        this.FriendList.style.display = "none";
        this.requestList.style.display = "none";
        this.addFriend.style.display = "block";
        this.usernameExist.style.display = "none";
    }
    async toggleListFriendButton(){
        this. FriendList.style.display = "none";
        this.addFriend.style.display = "none";
        this.requestList.style.display = "none";
        await this.populateFriends();
        this.FriendList.style.display = "block";

    }
    async toggleRequestFriendButton(){
        this.addFriend.style.display = "none";
        this.FriendList.style.display = "none";
        await this.populateRequests();
        this.requestList.style.display = "block";
    }
    async toggleSendRequestButton() {
        this.usernameExist.style.display = "none";
        let exists = false;
        await AllFriends.setPlayerList();
        for (let player of AllFriends.playerList) {
            if (player.username === this.usernameFriend.value.trim()) {
                exists = true;
                break;
            }
        }
        let requestExists = false;
        for (let request of this.requests){
            if(request.sender_id === await AllFriends.getPlayerID(this.usernameFriend.value.trim())){
                requestExists = true;
                break;
            }
        }

        if (exists && !requestExists) {
            let receiver_id = await AllFriends.getPlayerID(this.usernameFriend.value.trim());
            AllFriends.sendRequest(receiver_id);
            this.usernameFriend.value = '';
        }
        else if(requestExists){
            this.usernameExist.innerHTML = `Check incoming requests.`;
            this.usernameExist.style.display = "block";
            this.usernameFriend.value = '';

        }
        else {
            this.usernameExist.style.display = "block";
            this.usernameFriend.value = '';

        }
    }



    async populateFriends() {
        let tempFriends = await AllFriends.getFriends();
        if (this.friends.length !== tempFriends.length){
            const unique = tempFriends.filter(element => !this.friends.includes(element));
            for(let u of unique){
                await this.addFriendMenu(u);
            }
            this.friends = tempFriends;
            return true;
        }
        return false;
    }


    async populateRequests() {
        let tempRequests = await AllFriends.getFriendRequests();
        if (this.requests.length !== tempRequests.length){
            const unique = this.findUniqueRequests(this.requests, tempRequests);
            for(let r of unique){
                await this.addRequestMenu(r);
            }
            this.requests = tempRequests;
            return true;
        }
        return false;
    }
    async addFriendMenu(playerId) {
        const friend = document.createElement('div');
        friend.id = playerId;
        friend.classList.add('friend');
        friend.innerHTML = `${await AllFriends.getPlayerUsername(playerId)}`;
        const viewIsland = document.createElement('button');
        viewIsland.id = "viewIsland";
        viewIsland.innerHTML = `View Island`;
        viewIsland.classList.add('View-Island');
        friend.appendChild(viewIsland);
        this.listFriend.appendChild(friend);
    }

    async addRequestMenu(request){
        let status = await AllFriends.getFriendRequestStatus(request.id);
        if (status === "pending") {
            const requestElement = document.createElement('div');
            requestElement.id = "Request-bar"; // Assume each request has a unique sender ID
            requestElement.classList.add('request');
            requestElement.innerHTML = `${await AllFriends.getPlayerUsername(request.sender_id)}`;

            const acceptButton = document.createElement('button');
            acceptButton.classList.add('Accept-Request');
            acceptButton.setAttribute('data-request-id', request.id);
            acceptButton.onclick = async function () {
                AllFriends.acceptFriendRequest(request.id);
                this.requests = await AllFriends.getFriendRequests();
                requestElement.remove()

            }

            const rejectButton = document.createElement('button');
            rejectButton.classList.add('Reject-Request');
            rejectButton.setAttribute('data-request-id', request.id);
            rejectButton.onclick = async function () {
                AllFriends.rejectFriendRequest(request.id);
                this.requests = await AllFriends.getFriendRequests();
                requestElement.remove()

            }
            requestElement.appendChild(acceptButton);
            requestElement.appendChild(rejectButton);
            this.listRequest.appendChild(requestElement);
        }

    }
    toggleWindowbutton() {
        if (!this.Friends.contains(event.target) && event.target !== this.friendsButton && !event.target.classList.contains('Accept-Request') && !event.target.classList.contains('Reject-Request')) {
            this.Friends.style.display = 'none';
        }
    }

    mapsAreEqual(obj1, obj2) {
        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        // First, check if the objects have the same number of keys
        if (keys1.length !== keys2.length) {
            return false;
        }

        // Then, check if all keys and values are the same in both objects
        for (let key of keys1) {
            if (obj1[key] !== obj2[key]) {
                return false;
            }
        }

        return true;
    }

     findUniqueRequests(arrayA, arrayB) {
        const uniqueMaps = [];

        arrayB.forEach(mapB => {
            let isUnique = true;

            arrayA.forEach(mapA => {
                if (this.mapsAreEqual(mapA, mapB)) {
                    isUnique = false;
                }
            });

            if (isUnique) {
                uniqueMaps.push(mapB);
            }
        });

        return uniqueMaps;
    }
}