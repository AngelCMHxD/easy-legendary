const cp = require("child_process");
const inquirer = require("inquirer");
const Locale = require("../locale");

module.exports = async () => {
	const games = await require("../utils/searchGames.js")("installed");

	const game = await require("../utils/promptGame")(games, "start");

	if (game === Locale.get("SELECT_THIS_ITEM_TO_EXIT")) return;

	console.log("Launching game...");
	cp.execSync(`legendary launch "${game}"`);
};
