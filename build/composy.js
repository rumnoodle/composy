const traits = {};
traits.events = {
	dispatch: (eventName, data = {}) => {
		const options = data ? { detail: data } : undefined;
		const newEvent = new CustomEvent(eventName, options);
		document.body.dispatchEvent(newEvent);
	},

	listen: (eventName, callback) => {
		document.body.addEventListener(eventName, callback);
	}
};
export class Composy extends HTMLElement {
	shadowRoot;
	#composingClass;

	constructor() {
		super();
		this.shadowRoot = this.attachShadow({mode: 'open'});
		this.#composingClass = new.target;
	}

	connectedCallback() {
		this.connected();
	}

	connected() {}

	hasTrait(name) {
		Object.assign(this.#composingClass.prototype, traits[name]);
	}
}

export class Log extends Composy {
	constructor() {
		super();
		this.shadowRoot.innerHTML = `<div id="log">
	<div id="log-scroll"></div>
</div>

<style>
#log {
	border: 1px solid grey;
	border-radius: 4px;
	height: 200px;
	padding: 8px;
	width: 93vw;
}

/* This to keep padding in log when scroll available */
#log-scroll {
	overflow: auto;
	height: 200px;
}

.message {
	font: 0.8em "Verdana";
	margin: 0;
	padding: 0;
	white-space: nowrap;
}

</style>`
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

