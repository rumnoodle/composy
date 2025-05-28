const body = document.body;

const dispatch = (eventName, data = {}) => {
	const options = data ? { detail: data } : undefined;
	const newEvent = new CustomEvent(eventName, options);
	body.dispatchEvent(newEvent);
};

const listen = (eventName, callback) => {
	body.addEventListener(eventName, callback);
}


const events = {
	dispatch,
	listen
};

export {
	events
};
