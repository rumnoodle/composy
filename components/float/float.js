import Composy from '../composy.js';

// TODO:
// * Should be possible to set width and height, also to resize if enabled
// * Break the events out into traits (and figure out how to configure them correctly)
// * automate the creation of dom map (e.g. by looping all dom elements and extracting the id's or just by adding the ones you want to use to an array, then you have the option to get them yourself as well
//
// * create socket trait to communicate with server
// * create keypress trait to handle keypresses or add to events
// * move some things out in css variables for consistency and import at start of file
// * figure out how to do backup values for variables
// * remove the border from chat, we don't need it if it is to be added to a container
export default class Float extends Composy {
	#startingPosCursor;
	#startingPosHost;
	#currentDimensions;
	#resizeTriggerElement;

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
			floatDiv.classList.add('modifying');
			const targetBoundingRect = this.shadowRoot.host.getBoundingClientRect();
			this.#startingPosHost = { x: targetBoundingRect.left, y: targetBoundingRect.top };
			this.#startingPosCursor = { x: e.clientX, y: e.clientY };

			window.addEventListener('mousemove', moveFloat);
		});

		moveButton.addEventListener('mouseup', (e) => {
			floatDiv.classList.remove('modifying');
			window.removeEventListener('mousemove', moveFloat);
		});

		// Resize element
		const resizeRightElement = this.shadowRoot.getElementById('resize-right');

		const resizeFloat = this.#resizeFloat.bind(this);

		resizeRightElement.addEventListener('mousedown', (e) => {
			floatDiv.classList.add('modifying');
			this.#resizeTriggerElement = resizeRightElement;
			const targetBoundingRect = this.shadowRoot.host.getBoundingClientRect();
			this.#startingPosCursor = { x: e.clientX, y: e.clientY };
			this.#currentDimensions = {
				height: targetBoundingRect.height,
				width: targetBoundingRect.width
			};
			window.addEventListener('mousemove', resizeFloat);
		});

		resizeRightElement.addEventListener('mouseup', (e) => {
			floatDiv.classList.remove('modifying');
			window.removeEventListener('mousemove', resizeFloat);
		});

		const resizeBottomElement = this.shadowRoot.getElementById('resize-bottom');

		resizeBottomElement.addEventListener('mousedown', (e) => {
			floatDiv.classList.add('modifying');
			this.#resizeTriggerElement = resizeBottomElement;
			const targetBoundingRect = this.shadowRoot.host.getBoundingClientRect();
			this.#startingPosCursor = { x: e.clientX, y: e.clientY };
			this.#currentDimensions = {
				height: targetBoundingRect.height,
				width: targetBoundingRect.width
			};
			window.addEventListener('mousemove', resizeFloat);
		});

		resizeBottomElement.addEventListener('mouseup', (e) => {
			floatDiv.classList.remove('modifying');
			window.removeEventListener('mousemove', resizeFloat);
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
		const minimizedTextField = this.shadowRoot.getElementById('minimized-text');
		const resizeHandles = this.shadowRoot.querySelectorAll('.resize-handle');
		minimizeButton.addEventListener('click', (e) => {
			minimizeButton.classList.add('hidden');
			contentDiv.classList.add('hidden');
			floatDiv.style.height = '48px';
			maximizeButton.classList.remove('hidden');
			minimizedTextField.classList.remove('hidden');
			resizeHandles.forEach((handle) => {
				handle.classList.add('hidden');
			});
		});

		maximizeButton.addEventListener('click', (e) => {
			minimizedTextField.classList.add('hidden');
			maximizeButton.classList.add('hidden');
			contentDiv.classList.remove('hidden');
			floatDiv.style.height = '410px';
			minimizeButton.classList.remove('hidden');
			resizeHandles.forEach((handle) => {
				handle.classList.remove('hidden');
			});
		});

		const minimizedText = this.getAttribute('minimized-text');
		minimizedTextField.textContent = minimizedText;
	}

	#moveFloat(e) {
		const hostElement = this.shadowRoot.host;
		hostElement.style.top = `${this.#startingPosHost.y + (e.clientY - this.#startingPosCursor.y)}px`;
		hostElement.style.left = `${this.#startingPosHost.x + (e.clientX - this.#startingPosCursor.x)}px`;
	}

	#resizeFloat(e) {
		const hostElement = this.shadowRoot.host;
			if (this.#resizeTriggerElement.id === 'resize-right') {
				hostElement.style.width = `${this.#currentDimensions.width + (e.clientX - this.#startingPosCursor.x)}px`;
				this.shadowRoot.firstChild.style.width = `${this.#currentDimensions.width + (e.clientX - this.#startingPosCursor.x)}px`;
			} else if (this.#resizeTriggerElement.id === 'resize-bottom') {
				hostElement.style.height = `${this.#currentDimensions.height + (e.clientY - this.#startingPosCursor.y)}px`;
				this.shadowRoot.firstChild.style.height = `${this.#currentDimensions.height + (e.clientY - this.#startingPosCursor.y)}px`;
			}
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
