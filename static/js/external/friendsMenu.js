import * as AllFriends from "./Friends.js"
import {userId} from "./ChatNamespace.js"
import {getFriendRequestStatus} from "./Friends.js";
import {addFriendNotification, removeFriendNotification} from "./LevelUp.js";

export class FriendsMenu {

    constructor() {
        this.friendsButton = document.getElementById("friends-button");

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

        this.initial = true;


        this.inMatch = false;

        this.forwardingNameSpace = null;

        this.friendsButton.onclick = this.toggleFriendsDisplay.bind(this);
        this.addFriendButton.onclick = this.toggleAddFriendButton.bind(this);
        this.listFriendButton.onclick = this.toggleListFriendButton.bind(this);
        this.requestFriendButton.onclick = this.toggleRequestFriendButton.bind(this);
        this.sendRequestButton.onclick = this.toggleSendRequestButton.bind(this)
        window.addEventListener('click', this.toggleWindowbutton.bind(this));

    }

    setForwardingNameSpace(nameSpace){
        this.forwardingNameSpace = nameSpace;
    }


    async toggleFriendsDisplay() {
        if (this.Friends.style.display === "block") {
            this.Friends.style.display = "none";
            this.addFriendButton.style.display = "none";
            this.listFriendButton.style.display = "none";
            this.addFriend.style.display = "none";
            this.requestFriendButton.style.display = "none";
        } else if(!this.inMatch) {
            this.populateFriends(); //don't use await here will delay the display of the friends list
            this.Friends.style.display = "block";
            this.addFriendButton.style.display = "block";
            this.listFriendButton.style.display = "block"
            this.requestFriendButton.style.display = "block";
            this.addFriend.style.display = "none";
            this.FriendList.style.display = "block";
            this.listRequest.style.display = "none";
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
        this.populateFriends(); //don't use await here will delay the display of the friends list
        this.FriendList.style.display = "block";

    }
    async toggleRequestFriendButton(){
        this.addFriend.style.display = "none";
        this.FriendList.style.display = "none";
        this.populateRequests(); //don't use await here will delay the display of the friends list
        this.requestList.style.display = "block";
    }
    async toggleSendRequestButton() {
        this.usernameExist.style.display = "none";
        let exists = false;
        await AllFriends.setPlayerList();
        await this.updateRequests();
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
        let friendsExists = false;
        for (let friend of this.friends)
        {
            if(await AllFriends.getPlayerUsername(friend) === this.usernameFriend.value.trim()){
                friendsExists = true;
                break;
            }
        }
        if (exists && !requestExists && !friendsExists) {
            let receiver_id = await AllFriends.getPlayerID(this.usernameFriend.value.trim());
            AllFriends.sendRequest(receiver_id);
            this.usernameFriend.value = '';
        }
        else if(requestExists){
            this.usernameExist.innerHTML = `Check incoming requests.`;
            this.usernameExist.style.display = "block";
            this.usernameFriend.value = '';

        } else if(friendsExists){
            this.usernameExist.innerHTML = `Friend already exists.`;
            this.usernameExist.style.display = "block";
            this.usernameFriend.value = '';
        }
        else {
            this.usernameFriend.value = '';
            this.usernameExist.style.display = "block";

        }
    }

    async populateFriends() {
        console.log("Populating friends");
        let tempFriends = await AllFriends.getFriends();
        let changed = false;
        if (this.friends.length !== tempFriends.length){
            const unique = tempFriends.filter(element => !this.friends.includes(element));
            for(let u of unique){
                await this.addFriendMenu(u);
            }
            this.friends = tempFriends;
            changed = true;
        }
        for(let f of this.friends){
            this.forwardingNameSpace.sendCheckOnlineStatusEvent(f);
        }
        return changed;
    }

    /**
     * Set the online indicator for a friend
     * @param {{target: number, status: 'online' | 'offline' | 'in_match'}} data
     */
    setOnlineIndicator(data) {
        console.log(`setting online indicator for ${data.target}: ${data.status}`);
        const onlineIndicator = document.getElementById(`online-indicator-${data.target}`);
        const visitButton = document.getElementById(`visit-${data.target}`);
        switch (data.status) {
            case 'online':
                onlineIndicator.classList.add('online');
                onlineIndicator.classList.remove('in-match');
                visitButton.classList.add('enabled');
                break;
            case 'in_match':
                onlineIndicator.classList.add('in-match');
                onlineIndicator.classList.remove('online');
                visitButton.classList.remove('enabled');
                break;
            default:
                onlineIndicator.classList.remove('online', 'in-match');
                visitButton.classList.remove('enabled');
        }
    }


    async populateRequests() {
        let tempRequests = await AllFriends.getFriendRequests();
        if (this.requests.length !== tempRequests.length){
            const unique = this.findUniqueRequests(this.requests, tempRequests);
            for(let r of unique){
                await this.addRequest(r);
                if(this.initial){
                    addFriendNotification();
                }
            }
            this.requests = tempRequests;
            if(this.initial){
                this.initial = false;
            }
            return true;
        }
        return false;
    }
    async addFriendMenu(playerId) {
        const friend = document.createElement('div');
        friend.id = `friend-${playerId}`;
        friend.classList.add('friend');
        const username = document.createElement('div');
        username.innerText = `${await AllFriends.getPlayerUsername(playerId)}`;
        const viewIsland = document.createElement('button');
        const onlineIndicator = document.createElement('div');
        const filler = document.createElement('div');
        filler.classList.add('friend-filler');
        username.classList.add('friend-username');
        onlineIndicator.id = `online-indicator-${playerId}`;
        onlineIndicator.classList.add('online-indicator');
        viewIsland.id = `visit-${playerId}`;
        viewIsland.innerHTML = `Visit Island`;
        viewIsland.classList.add('View-Island');
        friend.appendChild(username);
        friend.appendChild(onlineIndicator);
        friend.appendChild(filler);
        friend.appendChild(viewIsland);
        this.listFriend.appendChild(friend);
    }

    async addRequest(request) {
        let status = await AllFriends.getFriendRequestStatus(request.id);
        if (status === "pending") {
            const requestElement = document.createElement('div');
            requestElement.id = "Request-bar"; // Assume each request has a unique sender ID
            requestElement.classList.add('request');
            requestElement.innerHTML = `${await AllFriends.getPlayerUsername(request.sender_id)}`;

            const friendsMenu = this;
            const acceptButton = document.createElement('button');
            acceptButton.classList.add('Accept-Request');
            acceptButton.setAttribute('data-request-id', request.id);

            const rejectButton = document.createElement('button');
            rejectButton.classList.add('Reject-Request');
            rejectButton.setAttribute('data-request-id', request.id);

            acceptButton.onclick = async function () {
                await AllFriends.acceptFriendRequest(request.id);
                await friendsMenu.updateRequests();
                requestElement.remove();
                removeFriendNotification();
                await friendsMenu.populateFriends();
            }

            rejectButton.onclick = async function () {
                await AllFriends.rejectFriendRequest(request.id);
                console.log("Request rejected, request ID:", request.id);
                await friendsMenu.updateRequests();
                removeFriendNotification();
                requestElement.remove();
            }

            requestElement.appendChild(acceptButton);
            requestElement.appendChild(rejectButton);
            this.listRequest.appendChild(requestElement);
        }
    }

    async updateRequests() {
        this.requests = await AllFriends.getFriendRequests();
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