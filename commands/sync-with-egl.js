const cp = require("child_process")
const inquirer = require("inquirer")

module.exports = async () => {
	const migrate = await inquirer.prompt([
		{
			type: "confirm",
			name: "migrate",
			message: "Do you want to migrate your games from the Epic Games Launcher to this tool/legendary-gl? (This will remove all your games from the launcher but you will be able to access them from here)",
			default: false
		}
	]).then((a) => { return a.migrate })

	let confirmMsg = "Do you want to sync games with Epic Games Launcher?"
	confirmMsg = migrate ? confirmMsg + " (This will remove all your games from the launcher but you will be able to access them from here)" : confirmMsg

	let command = "legendary egl-sync"
	if (migrate) command += " --migrate"

	const confirm = await inquirer.prompt([
		{
			type: "confirm",
			name: "confirm",
			message: confirmMsg,
			default: true
		}
	]).then(a => { return a.confirm })
	if (confirm) {
		console.log("Syncing games with Epic Games Launcher...")
		const output = await cp.execSync(command + " -y", { stdio: 'pipe' })
		console.log(output.toString())
		console.log("Finished!")
	} else console.log("Operation canceled!")
}