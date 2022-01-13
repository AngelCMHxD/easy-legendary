const cp = require("child_process")
const inquirer = require("inquirer")
const fuzzy = require("fuzzy")
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))

module.exports = async () => {

	let gamesOutput = await cp.execSync("legendary list-games", {stdio: 'pipe'}).toString().split("\n")
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
			message: "Type the name of the game you want to import:",
			emptyText: 'Nothing here!',
			validate: function (val) {
				return val ? true : 'Select a valid game!';
			}
		}
	]).then((a) => {return a.game})

	let diskPath = await inquirer.prompt([
		{
			type: "input",
			name: "diskPath",
			message: `Where is the game you want to import?`,
			validate: (val) => {
				if (val) {
					let regex = /^[a-zA-Z]:\\([^\\\/:*?"<>|]+\\)*\w*$/gm
					let matchRegex = regex.test(val.replaceAll("/", "\\"))
					if (matchRegex) return true
					else return "Type a valid path"
				} else return "Type a valid path"
			}
		}
	]).then((a) => {return a.diskPath})
	diskPath = diskPath.replaceAll("\\", "/").replaceAll("\\\\", "/")
	diskPath = (diskPath.split(":")[0].toUpperCase() + ":" + diskPath.split(":")[1])
	const confirm = await inquirer.prompt([
		{
			type: "confirm",
			name: "confirm",
			message: `Are you sure that you want to import the game "${game}", located in "${diskPath}"?`
		}
	]).then((a) => {return a.confirm})
	if (confirm) {
		console.log(`Importing "${game}"...`)
		await cp.execSync(`legendary import-game "${game}" "${diskPath}" --with-dlcs`, { stdio: "inherit" })
	}
	else console.log("Operation aborted!")
}