export const events = {
	dispatch: (eventName, data = {}) => {
		const options = data ? { detail: data } : undefined;
		const newEvent = new CustomEvent(eventName, options);
		document.body.dispatchEvent(newEvent);
	},

	listen: (eventName, callback) => {
		document.body.addEventListener(eventName, callback);
	}
}

