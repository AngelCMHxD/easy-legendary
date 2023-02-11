const cp = require("child_process");
const inquirer = require("inquirer");
const Locale = require("../locale");

module.exports = async () => {
	const games = await require("../utils/searchGames.js")("installed");

	const game = await require("../utils/promptGame")(
		games,
		Locale.get("ACTIONS.VERIFY")
	);

	if (game === Locale.get("SELECT_THIS_ITEM_TO_EXIT")) return;

	const confirm = await require("../utils/promptConfirmation")(
		Locale.get("ACTIONS.VERIFY_GAME", game)
	);

	if (!confirm) {
		console.log(Locale.get("OPERATION_CANCELLED"));
		return;
	}

	console.log(`Verifying game files of "${game}"...`);
	const output = await cp.execSync(`legendary verify "${game}" -y`, {
		stdio: "pipe",
	});
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
