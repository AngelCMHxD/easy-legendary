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
		let elevated = true;
		try {
			await cp.execSync("net session", { stdio: "pipe" })
		} catch (e) {
			elevated = false
		}

		let gameInfo = await cp.execSync(`legendary info "${game}"`, { stdio: "pipe" }).toString().replaceAll("\\", "/").split("\n")
		let diskPath;
		gameInfo.forEach(line => {
			if (line.startsWith("- Install path: ")) diskPath = line.slice("- Install path: ".length, -1)
		})

		if (!elevated &&
		    (diskPath.toLowerCase().startsWith("C:/program files")
			|| diskPath.toLowerCase().startsWith("C:/program files (x86)")
			|| diskPath.toLowerCase().startsWith("C:/windows")) {

			console.log(`\x1b[31m[Error]\x1b[0m`, `You are trying to update the game "${game}" located in ${diskPath}, which is a protected folder, in order to update a game located there you should have started the tool as administrator! (or in a administrator cmd). Exiting in 20 seconds...`)
			await delay(20000)
			process.exit()
		}
		console.log(`Updating "${game}" (${diskPath})...`)
		await cp.execSync(`legendary update "${game}" -y`)
	}
	else console.log("Update canceled!")
}
