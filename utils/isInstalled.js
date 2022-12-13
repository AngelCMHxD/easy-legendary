const cp = require("child_process");
const Locale = require("../locale");

module.exports = async (game) => {
	let gameInfo;

	try {
		gameInfo = await cp
			.execSync(`legendary launch "${game}" --json`, { stdio: "pipe" })
			.toString();
		if (!gameInfo) return false;
	} catch (e) {
		if (e.toString().endsWith("is not currently installed!")) return false;
		else throw e;
	}

	const parsed = JSON.parse(gameInfo);
	return {
		executable: gameInfo.game_executable,
		directory: gameInfo.game_directory,
	};
};
