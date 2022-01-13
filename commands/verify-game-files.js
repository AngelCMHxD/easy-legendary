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
			message: "Type the name of the game you want to verify the files:",
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
			message: `Are you sure that you want to verify the game files of "${game}"?`,
			default: true
		}
	]).then((a) => { return a.confirm })

	if (confirm) {
		console.log(`Verifying game files of "${game}"...`)
		const output = await cp.execSync(`legendary verify "${game}" -y`)
		if (!output.toString().includes("100.0%")) {
			console.log("Corrupted/missing files detected!")
			const repair = await inquirer.prompt([
				{
					type: "confirm",
					name: "confirm",
					message: `Do you want to repair the game "${game}"?`
				}
			]).then(a => { return a.confirm })
			if (repair) {
				console.log(`Repairing "${game}"...`)
				await cp.execSync(`legendary repair "${game}" -y`, { stdio: "pipe" })
				console.log("Game repaired!")
			} else console.log(`Finished verifying "${game}"! Corrupted/missing file(s) detected! Skipped reparation!`)
		} else console.log(`Finished verifying "${game}"! No corrupted/missing file(s) detected!`)
	} else console.log("Operation canceled!")
}