const cp = require("child_process")
const inquirer = require("inquirer")
const fuzzy = require("fuzzy")
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))

module.exports = async () => {

	let gamesOutput = await cp.execSync("legendary list-installed", { stdio: 'pipe' }).toString().split("\n")
	gamesOutput.shift()
	gamesOutput.shift()
	gamesOutput.pop()
	gamesOutput.pop()
	gamesOutput.pop()
	let games = []
	await gamesOutput.forEach(async (game) => {
		if (game.startsWith("  +") || game.startsWith("  -")) return
		game = game.slice(3)
		if (game === undefined) return
		game = game.split(" (App name: ")[0]
		games.push(game)
	})
	function searchGames(answers, input) {
		input = input || '';
		return new Promise(function (resolve) {
			var fuzzyResult = fuzzy.filter(input, games);
			const results = fuzzyResult.map(function (rs) {
				return rs.original;
			});

			results.splice(5, 0, new inquirer.Separator());
			results.push(new inquirer.Separator());
			resolve(results);
		});
	}

	const game = await inquirer.prompt([
		{
			type: "autocomplete",
			source: searchGames,
			name: "game",
			message: "Type the name of the game you want to start:",
			emptyText: 'Nothing here!',
			pageSize: 10,
			loop: false,
			validate: function (val) {
				return val ? true : 'Select a valid game!';
			}
		}
	]).then((a) => { return a.game })

	console.log("Launching game and exiting...")
	cp.execSync(`legendary launch "${game}"`)
	process.exit(0)
}