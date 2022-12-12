const cp = require("child_process");
const inquirer = require("inquirer");

module.exports = async () => {
	const confirm = await require("../utils/promptConfirmation")(
		"sync games with Epic Games Launcher"
	);

	if (!confirm) {
		console.log("Operation cancelled!");
		return;
	}

	console.log("Syncing games with Epic Games Launcher...");
	const output = await cp.execSync("legendary egl-sync -y", {
		stdio: "pipe",
	});
	console.log(output.toString());
	console.log("Finished!");
};
