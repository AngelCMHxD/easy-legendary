const cp = require("child_process")
const inquirer = require("inquirer")

module.exports = async () => {
	const confirm = await inquirer.prompt([
		{
			type: "confirm",
			name: "confirm",
			message: "Do you want to sync games with Epic Games Launcher?",
			default: true
		}
	]).then(a => { return a.confirm })
	if (confirm) {
		console.log("Syncing games with Epic Games Launcher...")
		const output = await cp.execSync("legendary egl-sync -y", { stdio: 'pipe' })
		console.log(output.toString())
		console.log("Finished! If you don't see a game in EGL, restart it in order to reload games.")
	} else console.log("Operation canceled!")
}