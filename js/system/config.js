Storage.prototype.setObject = function (key, value) {
	this.setItem(key, JSON.stringify(value));
};

Storage.prototype.getObject = function (key) {
	var value = this.getItem(key);
	if (value === "undefined" || value === undefined) value = null;
	return value && JSON.parse(value);
};
