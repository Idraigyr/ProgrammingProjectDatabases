document.addEventListener('DOMContentLoaded', (event) => {
    const chatButton = document.getElementById('chatButton');
    const chatPopup = document.getElementById('chatPopup');
    const closeChat = document.getElementById('closeChat');
    const sendMessageButton = document.getElementById('sendMessage');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const chatButtonContainer = document.getElementById('chatButtonContainer');


    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    chatButton.onclick = function() {
        openChat();
    };

    function openChat() {
        chatPopup.style.display = 'block';
        chatButton.hidden = true;
        chatButtonContainer.hidden = true;
        scrollToBottom(); // Scroll to bottom when chat is opened
        chatInput.focus(); // Set focus to the chat input field
    }

    closeChat.onclick = function() {
        chatButton.hidden = false;
        chatButtonContainer.hidden = false;
        chatPopup.style.display = 'none';
    };

    // Close the chat popup if the user clicks outside of it
    window.onclick = function(event) {
        // Check if the clicked area is not the chat button and is outside the chat content
        if (!chatPopup.contains(event.target) && event.target != chatButton) {
            chatButton.hidden = false;
            chatButtonContainer.hidden = false;
            chatPopup.style.display = 'none';
        }
    };

    // Send message and display it in the chat window
    sendMessageButton.addEventListener('click', function() {
        var message = chatInput.value.trim();
        if (message) {
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

        // Listen for the "C" key to open the chat box
    document.addEventListener('keydown', function(e) {
        if (e.key === 'c' || e.key === 'C') {
            // Check if the current active element is the chat input field
            if (document.activeElement !== chatInput) {
                // Check if the chatPopup is already displayed before toggling
                if (chatPopup.style.display !== 'block') {
                    e.preventDefault();
                    openChat();
                } else {
                    // Close the chat popup only if chat input is not focused
                    chatButton.hidden = false;
                    chatPopup.style.display = 'none';
                }
            }
        }
        if (e.key === 'Escape'){
            if (chatPopup.style.display === 'block'){
                // Close the chat popup only if chat input is not focused
                chatButton.hidden = false;
                chatPopup.style.display = 'none';
            }
        }
    });
});
