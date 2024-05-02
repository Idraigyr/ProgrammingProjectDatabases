let playerList = [];
let username = "Unknown user"
let userID = 0;
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
        data: JSON.stringify({sender_id: userID, receiver_id:receiverID,status:"pending"}),
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

export function getFriendRequests() {
    let requests = [];
    $.ajax({url: '/api/friend_request/list', type: "GET"}).done(function(data){
          for (let i in data){
              if (data.receiver_id === userID){
                  requests.push(data[i]);
              }
          }
    });
    return requests;
}

export function getPlayerID(receiver_username)  {
    for (let receiver in playerList){
        if (playerList[receiver].username === receiver_username){
            return playerList[receiver].user_profile_id;
        }
    }
}