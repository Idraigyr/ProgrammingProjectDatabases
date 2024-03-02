document.addEventListener('DOMContentLoaded', (event) => {
    const chatButton = document.getElementById('chatButton');
    const chatPopup = document.getElementById('chatPopup');
    const closeChat = document.getElementById('closeChat');
    const sendMessageButton = document.getElementById('sendMessage');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages'); // Make sure you have this div in your HTML

    chatButton.onclick = function() {
        chatPopup.style.display = 'block';
    };

    closeChat.onclick = function() {
        chatPopup.style.display = 'none';
    };

    // Close the chat popup if the user clicks outside of it
    window.onclick = function(event) {
        if (event.target == chatPopup) {
            chatPopup.style.display = 'none';
        }
    };

    // Send message and display it in the chat window
    sendMessageButton.addEventListener('click', function() {
        var message = chatInput.value.trim();
        if (message) {
            // Display the message. This part can be customized to append the message in a more styled manner.
            const messageElement = document.createElement('p');
            messageElement.textContent = message;
            chatMessages.appendChild(messageElement);

            // Clear the input field after sending the message
            chatInput.value = '';
        }
    });

    // Optionally, handle Enter key to send message
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent the default action to stop form submission
            sendMessageButton.click();
        }
    });
});