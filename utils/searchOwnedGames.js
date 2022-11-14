const cp = require("child_process");
const inquirer = require("inquirer");
const fuzzy = require("fuzzy");

module.exports = async () => {
	let games = [];

	if (!cacheObj.ownedGamesList) {
		let gamesOutput = cp.execSync("legendary list-games", { stdio: "pipe" })
			.toString()
			.replaceAll(/[^\x00-\x7F]/g, "")
			.split("\n")
			.slice(2,-3);

		await gamesOutput.forEach(async (game) => {
			if (game.startsWith("  +") || game.startsWith("  -")) continue;
			if (game.startsWith("  !")) {
				games.pop();
				return;
			}
			game = game.slice(3);
			if (game === undefined) continue;
			game = game.split(" (App name: ")[0];
			games.push(game);
		});
		cacheObj.ownedGamesList = games;
	} else games = cacheObj.ownedGamesList;

	if (!games.includes("Select this item to exit..."))
		games.unshift("Select this item to exit...");

	return function searchGames(answers, input) {
		input = input || "";
		return new Promise(function (resolve) {
			var fuzzyResult = fuzzy.filter(input, games);
			const results = fuzzyResult.map(function (rs) {
				return rs.original;
			});

			results.splice(1, 0, new inquirer.Separator());
			results.push(new inquirer.Separator());
			results.unshift(new inquirer.Separator());
			resolve(results);
		});
	};
};
