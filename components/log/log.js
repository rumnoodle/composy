import Composy from '../composy.js';

export default class Log extends Composy {
	constructor() {
		super();
	}
}

if (!customElements.get('log-y')) {
	customElements.define('log-y', Log);
}
