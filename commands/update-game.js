const cp = require("child_process")
const inquirer = require("inquirer")
const fuzzy = require("fuzzy")
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))

module.exports = async () => {

	const searchGames = await require("../utils/searchInstalledGames.js")()

	const game = await inquirer.prompt([
		{
			type: "autocomplete",
			source: searchGames,
			name: "game",
			message: "Type the name of the game you want to update:",
			emptyText: 'Nothing here!',
			pageSize: 10,
			loop: false,
			validate: function (val) {
				return val ? true : 'Select a valid game!';
			}
		}
	]).then((a) => { return a.game })

	if (game === "Select this item to exit...") return;

	const confirm = await inquirer.prompt([
		{
			type: "confirm",
			name: "confirm",
			message: `Are you sure that you want to update "${game}"?`
		}
	]).then((a) => { return a.confirm })

	if (confirm) {
		// exit if folder is protected and is not elevated
		require("../utils/elevationCheck.js")();
	
		let gameInfo = await cp.execSync(`legendary info "${game}"`, { stdio: "pipe" }).toString().replaceAll("\\", "/").split("\n")
		let diskPath;
		gameInfo.forEach(line => {
			if (line.startsWith("- Install path: ")) diskPath = line.slice("- Install path: ".length, -1)
		})
	
		console.log(`Updating "${game}" (${diskPath})...`)
		await cp.execSync(`legendary update "${game}" -y`)
	}
	else console.log("Update canceled!")
}
