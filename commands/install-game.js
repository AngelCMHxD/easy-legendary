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
			message: "Type the name of the game you want to install:",
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
			message: `Where do you want to install the game?`,
			validate: (val) => {
				if (val) {
					let regex = /^[a-zA-Z]:\\([^\\\/:*?"<>|]+\\)*\w*$/gm
					let matchRegex = regex.test(val.replaceAll("/", "\\"))
					if (matchRegex) return true
					else {
						let matchRegex = regex.test(val.replaceAll("/", "\\") + "\\")
						if (matchRegex) return true
						else return "Type a valid path"
					}
				} else return "Type a valid path"
			}
		}
	]).then((a) => {return a.diskPath})
	diskPath = diskPath.replaceAll("\\", "/").replaceAll("\\\\", "/")
	diskPath = (diskPath.split(":")[0].toUpperCase() + ":" + diskPath.split(":")[1])
	let diskPathwGame = diskPath + "/" + game
	diskPathwGame = diskPathwGame.replaceAll("//", "/")
	const confirm = await inquirer.prompt([
		{
			type: "confirm",
			name: "confirm",
			message: `Are you sure that you want to install "${game}" in "${diskPathwGame}"?`
		}
	]).then((a) => {return a.confirm})

	if (confirm) {
		console.log(`Installing ${game}...`)
		console.log(`The installation will occur on a separated cmd window in order to prevent errors!`)
		if (diskPath.startsWith("C:/Program Files") || diskPath.startsWith("C:/Program Files (x86)")) console.log(`\x1b[41m[WARNING]\x1b[0m You are trying to install the game in ${diskPath}, which is a protected folder, in order to install a game there you should have started the tool as administrator! (In a administrator cmd)`)
		cp.execSync(`start legendary install "${game}" --base-path "${diskPath}" -y`, { encoding: "utf-8", stdio: "inherit" })
	}
	else console.log("Installation canceled!")
}