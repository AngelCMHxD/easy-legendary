const cp = require("child_process");

module.exports = async () => {
	let games = cacheObj.installedGamesLog;
	if (games) return games;

	await cp
		.execSync("legendary list-installed", {
			stdio: "pipe",
		})
		.then((text) => {
			games = text
				.toString()
				.replaceAll(
					[
						`\n  - This game can be activated directly on your Ubisoft account`,
						`and does not require legendary to install/run.`,
						`Use "legendary activate --uplay" and follow the instructions.`,
					].join(" "),
					""
				)
				.replaceAll(/[^\x00-\x7F]/g, ""); // replaces unicode characters
		});

	cacheObj.installedGamesLog = games;
	return games;
};
