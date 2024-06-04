import * as AllFriends from "./Friends.js"
import {userId} from "./ChatNamespace.js"
import {addFriendNotification, removeFriendNotification} from "./PopUps.js";
import {API_URL, pendingFriendRequestURI} from "../configs/EndpointConfigs.js";

/**
 * Class to manage the friends menu
 */
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

    /**
     * Set the forwarding namespace
     * @param nameSpace the namespace to forward to
     */
    setForwardingNameSpace(nameSpace){
        this.forwardingNameSpace = nameSpace;
    }

    /**
     * Set friends menu
     * @returns {Promise<void>}
     */
    async showFriendsDisplay(){
        if(this.inMatch) return;
        this.populateFriends(); //don't use await here will delay the display of the friends list
        this.Friends.style.display = "block";
        this.addFriendButton.style.display = "block";
        this.listFriendButton.style.display = "block";
        this.requestFriendButton.style.display = "block";
        this.addFriend.style.display = "none";
        this.FriendList.style.display = "block";
        this.listRequest.style.display = "none";
    }

    /**
     * Hide friends menu
     */
    hideFriendsDisplay(){
        this.Friends.style.display = "none";
        this.addFriendButton.style.display = "none";
        this.listFriendButton.style.display = "none";
        this.requestFriendButton.style.display = "none";
        this.addFriend.style.display = "none";
        this.FriendList.style.display = "none";
        this.listRequest.style.display = "none";
    }


    /**
     * Toggle the friends display
     * @returns {Promise<void>} - the promise to toggle the friends display
     */
    async toggleFriendsDisplay() {
        if (this.Friends.style.display === "block") {
            this.hideFriendsDisplay();
        } else {
            await this.showFriendsDisplay();
        }
    }

    /**
     * Toggle the add friend button
     */
    toggleAddFriendButton() {
        this.FriendList.style.display = "none";
        this.requestList.style.display = "none";
        this.addFriend.style.display = "block";
        this.usernameExist.style.display = "none";
    }

    /**
     * Toggle the list friend button
     * @return {Promise<void>}
     */
    async toggleListFriendButton(){
        this. FriendList.style.display = "none";
        this.addFriend.style.display = "none";
        this.requestList.style.display = "none";
        this.populateFriends(); //don't use await here will delay the display of the friends list
        this.FriendList.style.display = "block";

    }

    /**
     * Shows the friends requests list in friends menu
     * @return {Promise<void>}
     */
    async toggleRequestFriendButton(){
        this.addFriend.style.display = "none";
        this.FriendList.style.display = "none";
        this.populateRequests(); //don't use await here will delay the display of the friends list
        this.requestList.style.display = "block";
    }

    /**
     * Sends friends Request to another user
     * @return {Promise<void>}
     */
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
        console.log("requests: ", this.requests)
        for (let request of this.requests){
            console.log(request);
            if(request.sender_id === AllFriends.getPlayerID(this.usernameFriend.value.trim())){
                requestExists = true;
                break;
            }
        }
        let friendsExists = false;
        for (let friend of this.friends)
        {
            if(AllFriends.getPlayerUsername(friend) === this.usernameFriend.value.trim()){
                friendsExists = true;
                break;
            }
        }
        if (exists && !requestExists && !friendsExists) {
            let receiver_id = AllFriends.getPlayerID(this.usernameFriend.value.trim());
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

    /**
     * Toggle the loading animation
     * @param {boolean | null | undefined} bool - if you want to force the loading animation to show or hide
     */
    async toggleLoadingAnimation(bool= null){
        const loadingDiv = document.getElementById('friend-loading-animation');
        loadingDiv.style.display = (bool ?? (loadingDiv.style.display === 'none')) ? 'block' : 'none';
    }

    /**
     * Populates the friends list in friendsMenu and checks if a friend is online.
     * @return {Promise<boolean>}
     */
    async populateFriends() {
        // console.log("Populating friends");
        this.toggleLoadingAnimation(true);
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
        this.toggleLoadingAnimation(false);
        return changed;
    }

    /**
     * Set the online indicator for a friend
     * @param {{target: number, status: 'online' | 'offline' | 'in_match'}} data
     */
    setOnlineIndicator(data) {
        //console.log(`setting online indicator for ${data.target}: ${data.status}`);
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

    /**
     * Populate the friends requests list in the friendsMenu.
     * @return {Promise<boolean>} - shows if the friend requests have changed
     */
    async populateRequests() {
        let tempRequests = await AllFriends.getFriendRequests();
        if (this.requests.length !== tempRequests.length){
            const unique = tempRequests.filter(element => !this.requests.includes(element));
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

    /**
     * Adds specific friend Friend  to friendsMenu
     * @param playerId the id of the player to add
     * @return {Promise<void>} - the promise to add a friend to the friends list
     */
    async addFriendMenu(playerId) {
        const friend = document.createElement('div');
        friend.id = `friend-${playerId}`;
        friend.classList.add('friend');
        const username = document.createElement('div');
        username.innerText = `${AllFriends.getPlayerUsername(playerId)}`;
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

    /**
     * Add a friend request to the list of requests
     * @param request the request to add
     * @returns {Promise<void>} - the promise to add a friend request to the list of requests
     */
    async addRequest(request) {
        let status = await AllFriends.getFriendRequestStatus(request.id);
        if (status === "pending") {
            const requestElement = document.createElement('div');
            requestElement.id = "Request-bar"; // Assume each request has a unique sender ID
            requestElement.classList.add('request');
            requestElement.innerHTML = `${AllFriends.getPlayerUsername(request.sender_id)}`;

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
                //console.log("Request rejected, request ID:", request.id);
                await friendsMenu.updateRequests();
                removeFriendNotification();
                requestElement.remove();
            }

            requestElement.appendChild(acceptButton);
            requestElement.appendChild(rejectButton);
            this.listRequest.appendChild(requestElement);
        }
    }

    /**
     * Update the list of friend requests
     * @return {Promise<*[]>}
     */
    async updateRequests() {
        try {
            this.requests = await AllFriends.getFriendRequests();
        } catch (error) {
            console.error(error);
            // Handle error appropriately, maybe throw it again or return an empty array
            return [];
        }
    }


    /**
     * Toggle the window button
     */
    toggleWindowbutton() {
        if (!this.Friends.contains(event.target) && event.target !== this.friendsButton && !event.target.classList.contains('Accept-Request') && !event.target.classList.contains('Reject-Request')) {
            this.Friends.style.display = 'none';
        }
    }
}