const cp = require("child_process");
const inquirer = require("inquirer");
inquirer.registerPrompt(
	"autocomplete",
	require("inquirer-autocomplete-prompt")
);

module.exports = async () => {
	const searchGames = await require("../utils/searchOwnedGames.js")();

	console.log(
		"Due to limitations, you only can see info of games that you own!"
	);
	const game = await inquirer
		.prompt([
			{
				type: "autocomplete",
				source: searchGames,
				name: "game",
				message: "Type the name of the game you want to see info:",
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

	const info = await cp.execSync(`legendary info "${game}"`, { stdio: "pipe" });
	console.log(info.toString());
};
