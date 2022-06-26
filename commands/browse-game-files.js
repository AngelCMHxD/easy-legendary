const cp = require("child_process");
const inquirer = require("inquirer");
inquirer.registerPrompt(
	"autocomplete",
	require("inquirer-autocomplete-prompt")
);

module.exports = async () => {
	const searchGames = await require("../utils/searchInstalledGames.js")();

	const game = await inquirer
		.prompt([
			{
				type: "autocomplete",
				source: searchGames,
				name: "game",
				message: "Type the name of the game you want to find it's files:",
				emptyText: "Nothing here!",
				pageSize: 10,
				loop: false,
				validate: function (val) {
					return val ? true : "Select a valid game!";
				},
			},
		])
		.then((a) => {
			return a.game;
		});

	if (game === "Select this item to exit...") return;

	let gameInfo = await require("../utils/isInstalled.js")(game);
	if (!gameInfo) return console.log("Game not found!");

	await cp.exec(`explorer "${gameInfo.directory}"`);

	console.log(
		"A file explorer window should have opened with the game's files."
	);
};
