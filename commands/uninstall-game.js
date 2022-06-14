const cp = require("child_process")
const inquirer = require("inquirer")
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))

module.exports = async () => {

	const searchGames = await require("../utils/searchInstalledGames.js")()

	const game = await inquirer.prompt([
		{
			type: "autocomplete",
			source: searchGames,
			name: "game",
			message: "Type the name of the game you want to uninstall:",
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
			message: `Are you sure that you want to uninstall "${game}"?`,
			default: false
		}
	]).then((a) => { return a.confirm })

	if (confirm) {
		console.log(`Uninstalling ${game}...`)
		await cp.execSync(`legendary uninstall "${game}" -y`, { stdio: "pipe" })
		console.log("Game uninstalled!")
	} else console.log("Operation canceled!")
}