import Composy from '../composy.js';

export default class Log extends Composy {
	constructor() {
		super();
		this.hasTrait('events');
		this.listen('log-message', this.logMessage);
	}

	// The event callbacks need to use arrow function syntax for this to work.
	logMessage = (e) => {
		const log = this.shadowRoot.getElementById('log-scroll');

		if (e?.detail?.message) {
			const text = document.createTextNode(e.detail.message);
			const logMessage = document.createElement('div');

			logMessage.className = 'message';
			logMessage.appendChild(text);
			log.appendChild(logMessage);

			const shouldScroll = (
				log.scrollHeight -
				(log.scrollTop + log.clientHeight)
				<
				logMessage.offsetHeight + 1);
			if (shouldScroll) {
				logMessage.scrollIntoView();
			}
		}
	};
}

if (!customElements.get('log-y')) {
	customElements.define('log-y', Log);
}
