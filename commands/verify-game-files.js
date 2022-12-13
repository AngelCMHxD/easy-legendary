const cp = require("child_process");
const inquirer = require("inquirer");
inquirer.registerPrompt(
	"autocomplete",
	require("inquirer-autocomplete-prompt")
);

module.exports = async () => {
	const games = await require("../utils/searchGames.js")("installed");

	const game = await require("../utils/promptGame")(
		games,
		"verify the files of"
	);

	if (game === "Select this item to exit...") return;

	const confirm = await require("../utils/promptConfirmation")(
		`verify the game files of "${game}"`
	);

	if (!confirm) {
		console.log("Operation cancelled!");
		return;
	}

	console.log(`Verifying game files of "${game}"...`);
	const output = await cp.execSync(`legendary verify "${game}" -y`);
	if (output.toString().includes("100.0%")) {
		console.log(
			`Finished verifying "${game}"! No corrupted/missing file(s) detected!`
		);
		return;
	}

	console.log("Corrupted/missing files detected!");
	const repair = require("../utils/promptConfirmation")(
		`repair the game "${game}"`
	);

	if (!repair) {
		console.log(
			`Finished verifying "${game}"! Corrupted/missing file(s) detected! Skipped reparation!`
		);
		return;
	}

	console.log(`Repairing "${game}"...`);
	await cp.execSync(`legendary repair "${game}" -y`, {
		stdio: "pipe",
	});
	console.log("Game repaired!");
};
