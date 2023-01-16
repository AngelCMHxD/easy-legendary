const cp = require("child_process");
const inquirer = require("inquirer");
const Locale = require("../locale");

module.exports = async () => {
	const confirm = await require("../utils/promptConfirmation")(
		Locale.get("ACTIONS.SYNC_ONLINE_SAVES")
	);

	if (!confirm) return console.log("Operation cancelled!");

	const confirmCorrupted = require("../utils/promptConfirmation")(
		Locale.get("ACTIONS.DELETE_CORRUPTED_ONLINE_SAVES")
	);

	console.log("Syncing online saves with Epic Online Services...");
	await cp.execSync("legendary sync-saves -y", { stdio: "pipe" });
	await cp.execSync("legendary download-saves -y", { stdio: "pipe" });

	if (!confirmCorrupted)
		console.log("Skipped deleting corrupted online saves.");
	else {
		// This DOESN'T delete your saves, only your corrupted ones
		await cp.execSync("legendary clean-saves -y", {
			stdio: "pipe",
		});
	}
	console.log("Saves synchronized!");
};
