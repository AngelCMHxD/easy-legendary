const cp = require("child_process");
const inquirer = require("inquirer");
inquirer.registerPrompt(
	"autocomplete",
	require("inquirer-autocomplete-prompt")
);

module.exports = async () => {
	const games = await require("../utils/searchInstalledGames.js")();

	const game = await require("../utils/promptGame")(games, "uninstall");

	if (game === "Select this item to exit...") return;

	const confirm = await require("../utils/promptConfirmation")(
		`uninstall "${game}"`
	);

	if (!confirm) {
		console.log("Operation cancelled!");
		return;
	}

	console.log(`Uninstalling ${game}...`);
	await cp.execSync(`legendary uninstall "${game}" -y`, {
		stdio: "pipe",
	});
	console.log("Game uninstalled!");
};
