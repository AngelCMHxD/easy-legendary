const fs = require("fs");
const inquirer = require("inquirer");
const cp = require("child_process");
const createShortcut = require("create-desktop-shortcuts");
inquirer.registerPrompt(
	"autocomplete",
	require("inquirer-autocomplete-prompt")
);

module.exports = async () => {
	let isCompiled = getCompiled();
	let VBScriptPath = "";
	if (isCompiled) {
		let locatedExe = process.argv0.split("\\");
		locatedExe.pop();
		VBScriptPath = locatedExe.join("\\") + "\\shortcut.vbs";
	}

	const existsVBScript = await fs.existsSync(VBScriptPath);
	if (!existsVBScript && isCompiled) {
		console.log(
			"The shortcut.vbs file was not found. Please reinstall the tool in order to create shortcuts."
		);
		return;
	}

	const games = await require("../utils/searchInstalledGames.js")();

	const game = await require("../utils/promptGame")(
		games,
		"make a shortcut for"
	);

	if (game === "Select this item to exit...") return;

	console.log("Searching were is legendary-gl installed...");

	const legendaryPath = await require("../utils/getLegendaryPath")();

	console.log("Searching were is the game installed...");
	const gameInfo = cp
		.execSync(`legendary info "${game}"`, { stdio: "pipe" })
		.toString()
		.split("\n");

	const gameFolder = gameInfo
		.find((line) => line.startWith("- Install path: "))
		.slice("- Install path: ".length, -1);

	let exePath = "";

	exePath = gameInfo
		.find((line) => line.startsWith("- Launch EXE: "))
		.slice("- Launch EXE: ".length, -1)
		.replaceAll("/", "\\");

	let gameExe = gameFolder + "\\" + exePath;

	const where = await inquirer
		.prompt([
			{
				type: "rawlist",
				name: "where",
				message: "Where do you want to create the shortcut?",
				choices: ["Desktop", "Start Menu", "Both"],
			},
		])
		.then((a) => {
			if (a.where === "Desktop") return ["Desktop"];
			if (a.where === "Start Menu") return ["Start Menu"];
			if (a.where === "Both") return ["Desktop", "Start Menu"];
		});

	console.log(`Creating shortcut(s) for "${game}" (${gameExe})...`);

	if (where.includes("Desktop")) {
		let desktopOptions = {
			verbose: false,
			windows: {
				name: game,
				filePath: legendaryPath,
				arguments: `launch "${game}"`,
				icon: gameExe,
				comment: `Launch ${game}`,
				windowMode: "minimized",
			},
		};

		if (isCompiled) desktopOptions.windows.VBScriptPath = VBScriptPath;

		await createShortcut(desktopOptions);
		console.log(
			`A shortcut for "${game}" should has been created on your desktop!`
		);
	}

	if (where.includes("Start Menu")) {
		let startOptions = {
			verbose: false,
			windows: {
				name: game,
				outputPath:
					process.env.USERPROFILE + "\\Start Menu\\Programs\\",
				filePath: legendaryPath,
				arguments: `launch "${game}"`,
				icon: gameExe,
				comment: `Launch ${game}`,
				windowMode: "minimized",
			},
		};

		if (isCompiled) startOptions.windows.VBScriptPath = VBScriptPath;

		await createShortcut(startOptions);
		console.log(
			`A shortcut for "${game}" should has been created on your start menu!`
		);
	}
};
