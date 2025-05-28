import * as traits from '../traits/index.js';

export default class Composy extends HTMLElement {
	shadowRoot;
	#composingClass;

	constructor() {
		super();
		this.shadowRoot = this.attachShadow({mode: 'open'});
		this.#composingClass = new.target;
	}

	async connectedCallback() {
		const componentPaths = this.#getComponentPath(this.#composingClass.name);
		this.shadowRoot.innerHTML = await this.#getPageContent(componentPaths);
		this.connected();
	}

	connected() {
		// Dummy implementation of connected.
		// Used whenever a child class wants to do something when connectedCallback triggers.
		// Maybe I should do this for all functions or do I need to? For consistency?
	}

	hasTrait(name) {
		Object.assign(this.#composingClass.prototype, traits[name]);
	}

	async #getPageContent(componentPaths) {
		let pageContent = "";

		const html = fetch(componentPaths.html)
			.then((response) => response.text())
			.then((text) => pageContent = text);

		const css = fetch(componentPaths.css)
			.then((response) => response.text())
			.then((text) => pageContent += `<style>\n${text}\n</style>`);

		await Promise.all([html, css]);
		return pageContent;
	}

	#getComponentPath(composingClass) {
		const classPathItem = composingClass.toLowerCase();
		const path = `/components/${classPathItem}/${classPathItem}`;
		return {
			html: `${path}.html`,
			css: `${path}.css`
		}
	}
}
