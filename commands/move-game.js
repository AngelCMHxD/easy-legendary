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
		let elevated = true;
		try {
			await cp.execSync("net session", { stdio: "pipe" })
		} catch (e) {
			elevated = false
		}

		let gameInfo = await cp.execSync(`legendary info "${game}"`, { stdio: "pipe" }).toString().replaceAll("\\", "/").split("\n")
		let initialDiskPath;
		gameInfo.forEach(line => {
			if (line.startsWith("- Install path: ")) initialDiskPath = line.slice("- Install path: ".length, -1)
		})

		if (diskPath.toLowerCase().startsWith("C:/program files") && !elevated
			|| diskPath.toLowerCase().startsWith("C:/program files (x86)") && !elevated
			|| diskPath.toLowerCase().startsWith("C:/windows") && !elevated) {

			console.log(`\x1b[31m[Error]\x1b[0m`, `You are trying to move the game to ${diskPath}, which is a protected folder, in order to move this game to that folder you should have started the tool as administrator! (or in a administrator cmd). Exiting in 20 seconds...`)
			await delay(20000)
			process.exit()
		}

		if (initialDiskPath.toLowerCase().startsWith("C:/program files") && !elevated
			|| initialDiskPath.toLowerCase().startsWith("C:/program files (x86)") && !elevated
			|| initialDiskPath.toLowerCase().startsWith("C:/windows") && !elevated) {

			console.log(`\x1b[31m[Error]\x1b[0m`, `You are trying to move the game "${game}" but is located at ${diskPath}, which is a protected folder, in order to move this game to another folder you should have started the tool as administrator! (or in a administrator cmd). Exiting in 20 seconds...`)
			await delay(20000)
			process.exit()
		}

		await cp.execSync(`legendary move "${game}" "${diskPath}" -y`, { encoding: "utf-8", stdio: "inherit" })
	}
	else console.log("Move operation canceled!")
}