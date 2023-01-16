const cp = require("child_process");
const Locale = require("../locale");

module.exports = async () => {
	const games = await require("../utils/searchGames.js")("installed");

	const game = await require("../utils/promptGame")(
		games,
		Locale.get("ACTIONS.FIND")
	);

	if (game === Locale.get("SELECT_THIS_ITEM_TO_EXIT")) return;

	let gameInfo = await require("../utils/isInstalled.js")(game);
	if (!gameInfo) return console.log(Locale.get("GAME_NOT_FOUND"));

	await cp.exec(`explorer "${gameInfo.directory}"`);

	console.log(Locale.get("FILE_EXPLORER_WINDOW"));
};
