const cp = require("child_process");

module.exports = async (game) => {
	let gameInfo;
	try {
		gameInfo = await cp
			.execSync(`legendary launch "${game}" --json`, { stdio: "pipe" })
			.toString();
	} catch (e) {
		if (e.toString().endsWith("is not currently installed!")) gameInfo = false;
		else throw e;
	}
	if (gameInfo) {
		gameInfo = JSON.parse(gameInfo);
		gameInfo = {
			executable: gameInfo.game_executable,
			directory: gameInfo.game_directory,
		};
	}

	return gameInfo;
};
