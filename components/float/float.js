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

	constructor() {
		super();
	}

	connected() {
		const content = this.innerHTML;
		const contentDiv = this.shadowRoot.getElementById('content');
		contentDiv.innerHTML = content;

		const floatDiv = this.shadowRoot.getElementById('float');

		// Show header when entering element
		floatDiv.addEventListener('mouseenter', (e) => {
			const headerDiv = this.shadowRoot.getElementById('header');
			headerDiv.classList.remove('hidden');
		});

		// Hide header when leaving element
		floatDiv.addEventListener('mouseleave', (e) => {
			const headerDiv = this.shadowRoot.getElementById('header');
			headerDiv.classList.add('hidden');
		});

		// Move element when holding down move button
		const moveButton = this.shadowRoot.getElementById('drag-and-drop');
		// We bind to a local variable to be able to remove listener
		const moveFloat = this.#moveFloat.bind(this);

		moveButton.addEventListener('mousedown', (e) => {
			const targetBoundingRect = this.shadowRoot.host.getBoundingClientRect();
			this.#startingPosHost = { x: targetBoundingRect.left, y: targetBoundingRect.top };
			this.#startingPosCursor = { x: e.clientX, y: e.clientY };

			window.addEventListener('mousemove', moveFloat);
		});

		moveButton.addEventListener('mouseup', (e) => {
			window.removeEventListener('mousemove', moveFloat);
		});

		// Close element and remove it from the dom
		const closeButton = this.shadowRoot.getElementById('close');
		closeButton.addEventListener('click', (e) => {
			this.shadowRoot.host.remove();
		});

		// Move element to top so that it's always visible
		// We don't really care if there are gaps in z-index as long as this is highest
		const topButton = this.shadowRoot.getElementById('move-to-top');
		topButton.addEventListener('click', (e) => {
			this.shadowRoot.host.style.zIndex = this.#findHighestZIndex() + 1;
		});

		// Minimize and maximize
		const minimizeButton = this.shadowRoot.getElementById('minimize');
		const maximizeButton = this.shadowRoot.getElementById('maximize');
		minimizeButton.addEventListener('click', (e) => {
			minimizeButton.classList.add('hidden');
			contentDiv.classList.add('hidden');
			floatDiv.style.height = '48px';
			maximizeButton.classList.remove('hidden');
		});

		maximizeButton.addEventListener('click', (e) => {
			maximizeButton.classList.add('hidden');
			contentDiv.classList.remove('hidden');
			floatDiv.style.height = '410px';
			minimizeButton.classList.remove('hidden');
		});
	}

	#moveFloat(e) {
		const hostElement = this.shadowRoot.host;
		hostElement.style.top = `${this.#startingPosHost.y + (e.clientY - this.#startingPosCursor.y)}px`;
		hostElement.style.left = `${this.#startingPosHost.x + (e.clientX - this.#startingPosCursor.x)}px`;
	}

	#findHighestZIndex() {
		let currentZIndex = 0;
		const selector = 'body *';
		const elements = Array.from(document.querySelectorAll(selector));
		const highestZIndex = elements.reduce((highest, currentElement) => {
			const cssStyles = getComputedStyle(currentElement);
			if (cssStyles.getPropertyValue('position') === 'static') {
				return highest;
			}

			const cssZIndex = parseInt(cssStyles.getPropertyValue('z-index')) || 0;
			const inlineZIndex = parseInt(currentElement.style.zIndex) || 0;

			return Math.max(highest, cssZIndex, inlineZIndex);
		}, 0);
		return highestZIndex;
	}
}

if (!customElements.get('float-y')) {
	customElements.define('float-y', Float);
}
