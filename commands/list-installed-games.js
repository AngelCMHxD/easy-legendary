const cp = require("child_process")

module.exports = async () => {
	const games = await cp.execSync("legendary list-installed", {stdio: 'pipe'})
	console.log(games.toString())
}