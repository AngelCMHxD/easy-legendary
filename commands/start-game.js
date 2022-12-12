const cp = require("child_process");
const inquirer = require("inquirer");
inquirer.registerPrompt(
	"autocomplete",
	require("inquirer-autocomplete-prompt")
);

module.exports = async () => {
	const games = await require("../utils/searchInstalledGames.js")();

	const game = await require("../utils/promptGame")(games, "start");

	if (game === "Select this item to exit...") return;

	console.log("Launching game...");
	cp.execSync(`legendary launch "${game}"`);
};
