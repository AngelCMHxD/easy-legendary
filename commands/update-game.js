const cp = require("child_process");
const inquirer = require("inquirer");
inquirer.registerPrompt(
	"autocomplete",
	require("inquirer-autocomplete-prompt")
);

module.exports = async () => {
	const games = await require("../utils/searchInstalledGames.js")();

	const game = await require("../utils/promptGame")("update");

	if (game === "Select this item to exit...") return;

	const confirm = require("../utils/promptConfirmation")(
		games,
		`update "${game}"`
	);

	if (!confirm) {
		console.log("Update cancelled!");
		return;
	}

	let gameInfo = await cp
		.execSync(`legendary info "${game}"`, { stdio: "pipe" })
		.toString()
		.replaceAll("\\", "/")
		.split("\n");
	let diskPath;
	gameInfo.forEach((line) => {
		if (line.startsWith("- Install path: "))
			diskPath = line.slice("- Install path: ".length, -1);
	});

	// exit if folder is protected and is not elevated
	require("../utils/elevationCheck.js")(diskPath, game);

	console.log(`Updating "${game}" (${diskPath})...`);
	await cp.execSync(`legendary update "${game}" -y`, {
		stdio: "inherit",
	});
};
