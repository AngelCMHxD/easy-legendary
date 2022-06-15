const fs = require("fs");
const inquirer = require("inquirer")
const cp = require("child_process")
const ws = require("windows-shortcuts")
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))

module.exports = async () => {

	const searchGames = await require("../utils/searchInstalledGames.js")()

	const game = await inquirer.prompt([
		{
			type: "autocomplete",
			source: searchGames,
			name: "game",
			message: "Type the name of the game you want to shortcut:",
			emptyText: 'Nothing here!',
			pageSize: 10,
			loop: false,
			validate: function (val) {
				return val ? true : 'Select a valid game!';
			}
		}
	]).then((a) => { return a.game })

	if (game === "Select this item to exit...") return;

	const pipScripts = await cp.execSync(`pip show legendary-gl`, { stdio: "pipe"})
	
	console.log("Searching were is legendary-gl installed...")
	let legendaryPath = "";
	pipScripts.toString().split("\n").forEach(line => {
		if (line.includes("Location:")) {
			let packagesPath = line.split("Location: ")[1]
			legendaryPath = packagesPath.split("\\").slice(0, -2).join("\\") + "\\scripts\\legendary.exe"
		}
	})

	console.log("Searching were is the game is installed...")
	const gameInfo = cp.execSync(`legendary info "${game}"`, { stdio: "pipe" }).toString()

	let gameFolder = "";
	gameInfo.split("\n").forEach(line => {
		if (line.startsWith("- Install path: ")) {
			gameFolder = line.slice("- Install path: ".length, -1)
		}
	})

	let exePath = "";
	gameInfo.split("\n").forEach(line => {
		if (line.startsWith("- Launch EXE: ")) {
			exePath = line.slice("- Launch EXE: ".length, -1).replaceAll("/", "\\")
		}
	})

	let gameExe = gameFolder + "\\" + exePath

	const where = await inquirer.prompt([
		{
			type: "rawlist",
			name: "where",
			message: "Where do you want to create the shortcut?",
			choices: [
				"Desktop",
				"Start Menu",
				"Both"
			]
		}
	]).then((a) => {
		if (a.where === "Desktop") return ["Desktop"]
		if (a.where === "Start Menu") return ["Start Menu"]
		if (a.where === "Both") return ["Desktop", "Start Menu"]
	})


	console.log(`Creating shortcut for "${game}" (${gameExe})...`)

	if (where.includes("Desktop")) {
		await ws.create(process.env.USERPROFILE + "\\Desktop\\" + game + ".lnk", {
			target: legendaryPath,
			args: `launch "${game}"`,
			icon: gameExe,
			desc: `Launch ${game}`,
			runStyle: ws.MIN
		});
		console.log(`A shortcut for "${game}" should has been created on your desktop!`)
	}

	if (where.includes("Start Menu")) {
		await ws.create(process.env.USERPROFILE + "\\Start Menu\\Programs\\" + game + ".lnk", {
			target: legendaryPath,
			args: `launch "${game}"`,
			icon: gameExe,
			desc: `Launch ${game}`,
			runStyle: ws.MIN
		});
		console.log(`A shortcut for "${game}" should has been created on your start menu!`)
	}

}