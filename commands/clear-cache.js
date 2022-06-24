const cp = require("child_process");
const fs = require("fs");

module.exports = async () => {
	console.log("Starting cache cleanup...");
	await cp.execSync("legendary cleanup");
	cacheObj = {};
	let cachePath = await configObj.getConfig(true);
	cachePath += "cache.json";
	let cacheExists = await fs.existsSync(cachePath);
	if (cacheExists) {
		console.log("Deleting cache file...");
		await fs.unlinkSync(cachePath);
	}
	console.log("Refreshing installed games...");
	removeFinishedDownloadsFromConfig();
	console.log("Re-caching games...");
	startCaching();
	console.log("Cache cleanup finished!");
};
