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
			message: "Type the name of the game you want to move:",
			emptyText: 'Nothing here!',
			pageSize: 10,
			loop: false,
			validate: function (val) {
				return val ? true : 'Select a valid game!';
			}
		}
	]).then((a) => { return a.game })

	if (game === "Select this item to exit...") return;

	let diskPath = await inquirer.prompt([
		{
			type: "input",
			name: "diskPath",
			message: `Where do you want to put the game?`,
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
	]).then((a) => { return a.diskPath })
	diskPath = diskPath.replaceAll("\\", "/").replaceAll("\\\\", "/")
	diskPath = (diskPath.split(":")[0].toUpperCase() + ":" + diskPath.split(":")[1])
	let diskPathwGame = diskPath + "/" + game
	diskPathwGame = diskPathwGame.replaceAll("//", "/")
	const confirm = await inquirer.prompt([
		{
			type: "confirm",
			name: "confirm",
			message: `Are you sure that you want to move the game "${game}" to "${diskPathwGame}"?`
		}
	]).then((a) => { return a.confirm })

	if (confirm) {
		console.log(`Moving game "${game}" to "${diskPath}"...`)
		
		// exit if folder is protected and is not elevated
		require("../utils/elevationCheck.js")(diskPath, game);

		let gameInfo = await cp.execSync(`legendary info "${game}"`, { stdio: "pipe" }).toString().replaceAll("\\", "/").split("\n")
		let initialDiskPath;
		gameInfo.forEach(line => {
			if (line.startsWith("- Install path: ")) initialDiskPath = line.slice("- Install path: ".length, -1)
		})
		
		// exit if folder is protected and is not elevated
		require("../utils/elevationCheck.js")(initialDiskPath, game);

		await cp.execSync(`legendary move "${game}" "${diskPath}" -y`, { encoding: "utf-8", stdio: "inherit" })
	}
	else console.log("Move operation canceled!")
}
