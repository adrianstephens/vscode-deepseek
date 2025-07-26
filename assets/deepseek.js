/* global window document vscode createElement */

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
	const text = chatInput.value.trim();
	if (text) {
		chatInput.value = '';
		vscode.postMessage({command:'question', text});
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
		case 'question':
			addMessage('user', event.data.text);
			break;

		case 'begin':
			reply = addMessage('assistant', '');
			break;

		case 'set':
			reply.innerHTML = event.data.html;
			//if (window.MathJax) {
			//	window.MathJax.typesetPromise([reply]).then(() => {
            //        console.log('MathJax typesetting complete');
            //    }).catch((err) => {
            //        console.error('MathJax typesetting failed:', err);
            //    });
            //    //window.MathJax.typesetPromise([reply]);
            //}
			break;

		case 'clear':
			chatContainer.innerHTML = '';
			break;

	}
});
