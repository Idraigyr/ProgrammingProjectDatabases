// Get the modal
document.addEventListener('DOMContentLoaded', (event) => {
    let friendsButton = document.getElementById("FriendsButton");

    let Friends = document.getElementById("Friends");

    let addFriendButton = document.getElementById("friendAddButton");

    let reauestFriendButton = document.getElementById("friendRequestButton");

    let listFriendButton = document.getElementById("friendListButton");

    let addFriend = document.getElementById("addFriend");

    let FriendList = document.getElementById("listFriend");

    let requestList = document.getElementById("listRequests");

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

    function populateFriends() {

        const listFriend = document.getElementById('listFriend');
        listFriend.innerHTML = '';

        let friendsList = ["Friend1", "Friend2", "Friend3"];

        friendsList.forEach((friendName, index) => {
            // add friend
            const friend = document.createElement('div');
            friend.id = friendName;
            friend.classList.add('friend');
            friend.innerHTML = `${friendName}`;
            const viewIsland = document.createElement('button');
            viewIsland.id = "viewIsland";
            viewIsland.innerHTML = `View Island`;
            viewIsland.classList.add('View-Island');
            friend.appendChild(viewIsland);
            listFriend.appendChild(friend);
        });
    }

    function populateRequests() {
        const listRequest = document.getElementById('listRequests');
        listRequest.innerHTML = '';

        let requestsList = ["Request1", "Request2", "Request3"];

        requestsList.forEach((RequestName, index) => {
            // add friend
            const request = document.createElement('div');
            request.id = RequestName;
            request.classList.add('request');
            request.innerHTML = `${RequestName}`;
            const acceptRequest = document.createElement('button');
            acceptRequest.id = "acceptRequest";
            acceptRequest.classList.add('Accept-Request');
            const rejectRequest = document.createElement('button');
            rejectRequest.id = "rejectRequest";
            rejectRequest.classList.add('Reject-Request');
            request.appendChild(acceptRequest);
            request.appendChild(rejectRequest);
            listRequest.appendChild(request);
        });

    }
});