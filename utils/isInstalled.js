const cp = require("child_process");

module.exports = async (game) => {
	const gameInfo = await cp
		.execSync(`legendary info "${game}"`, { stdio: "pipe" })
		.toString();
	return gameInfo.includes("Installation information");
};
