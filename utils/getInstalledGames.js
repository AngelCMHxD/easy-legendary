const cp = require("child_process");

module.exports = async () => {
	const games = cacheObj.installedGamesLog;
	if (games) return games;
	
	await cp.execSync("legendary list-installed", {
		stdio: "pipe",
	}).then(text => {
		cacheObj.installedGamesLog = text
			.toString()
			.replaceAll([
				`\n  - This game can be activated directly on your Ubisoft account`,
				`and does not require legendary to install/run.`,
				`Use "legendary activate --uplay" and follow the instructions.`,
			].join(" "), "")
			// replaces unicode characters
			.replaceAll(/[^\x00-\x7F]/g, "");
	})
};
