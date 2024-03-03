document.addEventListener('DOMContentLoaded', (event) => {
    const chatButton = document.getElementById('chatButton');
    const chatPopup = document.getElementById('chatPopup');
    const closeChat = document.getElementById('closeChat');
    const sendMessageButton = document.getElementById('sendMessage');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    chatButton.onclick = function() {
        chatPopup.style.display = 'block';
        scrollToBottom(); // Scroll to bottom when chat is opened
    };

    closeChat.onclick = function() {
        chatPopup.style.display = 'none';
    };

    // Close the chat popup if the user clicks outside of it
    window.onclick = function(event) {
        // Check if the clicked area is not the chat button and is outside the chat content
        if (!chatPopup.contains(event.target) && event.target != chatButton) {
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

            // Scroll to the bottom of the chat messages
            scrollToBottom();
        }
    });

    // Optionally, handle Enter key to send message
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent the default action to stop form submission
            sendMessageButton.click();
        }
    });

    // When the page loads, scroll to the bottom of the chat
    scrollToBottom();
});
