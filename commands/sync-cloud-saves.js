const cp = require("child_process");
const inquirer = require("inquirer");

module.exports = async () => {
	const confirm = await inquirer
		.prompt([
			{
				type: "confirm",
				name: "confirm",
				message: "Do you want to sync your online saves?",
				default: true,
			},
		])
		.then((a) => {
			return a.confirm;
		});

	if (!confirm) return console.log("Operation canceled!");

	const confirmCorrupted = await inquirer
		.prompt([
			{
				type: "confirm",
				name: "confirm",
				message: "Do you want to delete corrupted online saves?",
				default: true,
			},
		])
		.then((a) => {
			return a.confirm;
		});

	console.log("Syncing online saves with Epic Online Services...");
	await cp.execSync("legendary sync-saves -y", { stdio: "pipe" });
	await cp.execSync("legendary download-saves -y", { stdio: "pipe" });
	if (confirmCorrupted)
		await cp.execSync("legendary clean-saves -y", {
			stdio: "pipe",
		}); // This DOESN'T delete your saves, only your corrupted ones
	else console.log("Skipped deleting corrupted online saves.");
	console.log("Saves synchronized!");
};
