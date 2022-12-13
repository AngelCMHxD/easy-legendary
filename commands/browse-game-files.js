const cp = require("child_process");

module.exports = async () => {
	const games = await require("../utils/searchInstalledGames.js")(
		"installed"
	);

	const game = await require("../utils/promptGame")(
		games,
		Locale.get("FIND_THE_FILES_OF")
	);

	if (game === "Select this item to exit...") return;

	let gameInfo = await require("../utils/isInstalled.js")(game);
	if (!gameInfo) return console.log("Game not found!");

	await cp.exec(`explorer "${gameInfo.directory}"`);

	console.log(
		"A file explorer window should have opened with the game's files."
	);
};
