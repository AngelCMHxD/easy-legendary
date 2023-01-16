const cp = require("child_process");
const fs = require("fs");
const Locale = require("../locale");

module.exports = async () => {
	console.log("Starting cache cleanup...");
	await cp.execSync("legendary cleanup", { stdio: "ignore" });
	cacheObj = {};
	let cachePath = await configObj.getConfig(true);
	cachePath += "cache.json";
	const cacheExists = await fs.existsSync(cachePath);
	if (cacheExists) {
		console.log("Deleting cache file...");
		await fs.unlinkSync(cachePath);
	}
	console.log("Refreshing downloads...");
	await removeFinishedDownloadsFromConfig();
	console.log("Re-caching games...");
	await startCaching();
	console.log("Saving new cache...");
	await writeCache();
	console.log("Cache cleanup finished!");
};
