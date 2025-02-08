const chatContainer = document.getElementById('chat-container');
const chatInput 	= document.getElementById('chat-input');
const sendButton 	= document.getElementById('send-button');
let reply;

function addMessage(role, message) {
	const element = createElement('div', {className: `chat-message ${role}`, textContent: message});
	chatContainer.appendChild(element);
	chatContainer.scrollTop = chatContainer.scrollHeight;
	return element;
}

sendButton.addEventListener('click', () => {
	const message = chatInput.value.trim();
	if (message) {
		addMessage('user', message);
		chatInput.value = '';
		vscode.postMessage({command:'message', message});
	}
});

chatInput.addEventListener('keypress', (e) => {
	if (e.key === 'Enter') {
		sendButton.click();
		e.preventDefault();
	}
});

window.addEventListener('message', event => {
	switch (event.data.command) {
		case 'message':
			reply = addMessage('assistant', event.data.message);
			break;

		case 'set':
			reply.innerHTML = event.data.html;
			break;

		case 'stream':
			reply.textContent += event.data.message;
			break;

		case 'clear':
			chatContainer.innerHTML = '';
			break;

	}
});
