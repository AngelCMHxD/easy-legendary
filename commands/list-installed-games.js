const cp = require("child_process");

module.exports = async () => {
	let games = await cp.execSync("legendary list-installed", { stdio: "pipe" });
	games = games
		.toString()
		.replaceAll(
			'\n  - This game can be activated directly on your Ubisoft account and does not require legendary to install/run. Use "legendary activate --uplay" and follow the instructions.',
			""
		)
		.replaceAll(/[^\x00-\x7F]/g, "");
	console.log(games);
};
