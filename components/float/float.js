import Composy from '../composy.js';

// TODO:
// * create socket trait to communicate with server
// * create keypress trait to handle keypresses or add to events
// * move some things out in css variables for consistency and import at start of file
// * figure out how to do backup values for variables
// * remove the border from chat, we don't need it if it is to be added to a container
export default class Float extends Composy {
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
	}
}

if (!customElements.get('float-y')) {
	customElements.define('float-y', Float);
}
