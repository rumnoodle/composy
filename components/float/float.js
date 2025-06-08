import Composy from '../composy.js';

// TODO:
// * create socket trait to communicate with server
// * create keypress trait to handle keypresses or add to events
// * move some things out in css variables for consistency and import at start of file
// * figure out how to do backup values for variables
// * remove the border from chat, we don't need it if it is to be added to a container
export default class Float extends Composy {
	#startingPosCursor;
	#startingPosHost;
	#mouseMoveHandler;

	constructor() {
		super();
	}

	connected() {
		const content = this.innerHTML;
		const contentDiv = this.shadowRoot.getElementById('content');
		contentDiv.innerHTML = content;

		const floatDiv = this.shadowRoot.getElementById('float');
		floatDiv.addEventListener('mouseenter', (e) => {
			const headerDiv = this.shadowRoot.getElementById('header');
			headerDiv.classList.remove('hidden');
		});
		floatDiv.addEventListener('mouseleave', (e) => {
			const headerDiv = this.shadowRoot.getElementById('header');
			headerDiv.classList.add('hidden');
		});

		const moveButton = this.shadowRoot.getElementById('drag-and-drop');
		const moveFloat = this.moveFloat.bind(this);
		moveButton.addEventListener('mousedown', (e) => {
			this.#startingPosCursor = { x: e.clientX, y: e.clientY };
			const targetBoundingRect = this.shadowRoot.host.getBoundingClientRect();
			this.#startingPosHost = { x: targetBoundingRect.left, y: targetBoundingRect.top };

			this.#mouseMoveHandler = window.addEventListener('mousemove', moveFloat);
		});
		moveButton.addEventListener('mouseup', (e) => {
			console.log("should remove event listener now");
			window.removeEventListener('mousemove', moveFloat);
		});

		const closeButton = this.shadowRoot.getElementById('close');
		closeButton.addEventListener('click', (e) => {
			this.shadowRoot.host.remove();
		});

		const topButton = this.shadowRoot.getElementById('move-to-top');
	}

	moveFloat(e) {
		const hostElement = this.shadowRoot.host;
		hostElement.style.top = `${this.#startingPosHost.y + (e.clientY - this.#startingPosCursor.y)}px`;
		hostElement.style.left = `${this.#startingPosHost.x + (e.clientX - this.#startingPosCursor.x)}px`;
	}
}

if (!customElements.get('float-y')) {
	customElements.define('float-y', Float);
}
