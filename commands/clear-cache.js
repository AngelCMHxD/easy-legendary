const cp = require("child_process");

module.exports = async () => {
	console.log("Starting cache cleanup...");
	await cp.execSync("legendary cleanup");
	cacheObj = {};
};
