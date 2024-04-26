# Friends making

For information about the frontend usage, please refer to the [user manual](USER_MANUAL.md).
For specific JSON body information & endpoint usage, please refer to the Swagger documentation.

## Friend requests
Friend requests are created by sending a POST request to the `/friend_request` endpoint with the 'target' (other) user id.
Friend requests are pending while they exist. The target user can accept or reject the request by sending a PUT request to the `/friend_request` endpoint with the 'status' field set to 'accepted' or 'rejected'.
When setting the status to 'accepted', the two users are now friends and can visit the other his island.
When setting the status to 'rejected' or deleting the friend request has the same effect. In both cases will the friend request be deleted (as it is no longer pending).

Open friend requests for a certain user can be retrieved by sending a GET request to the `/friend_request/list` endpoint.

## Friends
Friend relations are in both ways, thus A -> B and B -> A. This means that if user A is friends with user B, user B is also friends with user A.
This design choice (in the db) is made because of its ease of use and decent SQLAlchemy support.

Friends can be retrieved by sending a GET request to the `/player` endpoint. Friends will appear with their user ids in the 'friends' field.

Removing friends can be done by sending a PUT request to the `/player` endpoint with the updated 'friends' field set (thus without the friend to remove).