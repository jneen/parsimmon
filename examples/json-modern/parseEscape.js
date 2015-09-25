// interpret Unicode and ASCII escapes

let escapes = {
	b: '\b',
	f: '\f',
	n: '\n',
	r: '\r',
	t: '\t'
};

export default str =>
	str.replace(/\\(u[0-9a-fA-F]{4}|[^u])/, (match, $1) => {
		let type = $1.charAt(0);
		if (type === 'u') {
			return String.fromCharCode(parseInt($1.slice(1), 16));
		}
		if (type in escapes) {
			return escapes[type];
		}
		return type;
	});
