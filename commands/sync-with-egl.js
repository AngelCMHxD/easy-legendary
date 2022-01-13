const cp = require("child_process")

module.exports = async () => {
	console.log("Syncing games with Epic Games Launcher...")
	const output = await cp.execSync("legendary egl-sync -y", {stdio: 'pipe'})
	console.log(output.toString())
	console.log("Finished! If you don't see a game in egl, restart it in order to reload games.")
}