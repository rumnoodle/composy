export default class Composy extends HTMLElement {
	#shadowRoot;

	constructor() {
		super();
		this.#shadowRoot = this.attachShadow({mode: 'open'});
	}

	async connectedCallback() {
		const composingClass = this.constructor.name;
		const componentPaths = this.#getComponentPath(composingClass);
		this.#shadowRoot.innerHTML = await this.#getPageContent(componentPaths);
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
