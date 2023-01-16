const Locale = require("../locale");

module.exports = async () => {
	console.log(Locale.get("SAVING_CACHE"));
	await writeCache();
	console.log(Locale.get("GOODBYE") + " o7");
	process.exit(1);
};
