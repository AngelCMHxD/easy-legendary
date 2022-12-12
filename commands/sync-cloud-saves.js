const cp = require("child_process");
const inquirer = require("inquirer");

module.exports = async () => {
	const confirm = require("../utils/promptConfirmation")(
		"sync your online saves"
	);

	if (!confirm) return console.log("Operation cancelled!");

	const confirmCorrupted = require("../utils/promptConfirmation")(
		"delete corrupted online saves"
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
