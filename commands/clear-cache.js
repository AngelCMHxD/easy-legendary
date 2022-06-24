const cp = require("child_process");

module.exports = async () => {
	console.log("Starting cleanup...");
	await cp.execSync("legendary cleanup");
};
