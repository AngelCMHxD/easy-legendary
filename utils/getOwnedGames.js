const cp = require("child_process");

module.exports = async () => {
	let games = cacheObj.ownedGamesLog;
	if (games) return games;

	if (!games) {
		games = cp
			.execSync("legendary list-games", { stdio: "pipe" })
			.toString()
			.replaceAll(
				'\n  - This game can be activated directly on your Ubisoft account and does not require legendary to install/run. Use "legendary activate --uplay" and follow the instructions.',
				""
			)
			.replaceAll(/[^\x00-\x7F]/g, "")
			.replace(
				"Available games:",
				"The games you own are the following:"
			);
	}

	return games;
};
