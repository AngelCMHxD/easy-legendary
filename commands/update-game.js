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

	const confirm = await require("../utils/promptConfirmation")(
		games,
		`update "${game}"`
	);

	if (!confirm) {
		console.log("Update cancelled!");
		return;
	}

	const gameInfo = await cp
		.execSync(`legendary info "${game}"`, { stdio: "pipe" })
		.toString()
		.replaceAll("\\", "/")
		.split("\n");

	const diskPath = gameInfo
		.find((line) => line.startWith("- Install path: "))
		.slice("- Install path: ".length, -1);

	// exit if folder is protected and is not elevated
	if (!(await require("../utils/elevationCheck.js")(diskPath, game))) return;

	console.log(`Updating "${game}" (${diskPath})...`);
	await cp.execSync(`legendary update "${game}" -y`, {
		stdio: "inherit",
	});
};
