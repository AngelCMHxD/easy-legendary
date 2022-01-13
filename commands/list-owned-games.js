const cp = require("child_process")

module.exports = async () => {
	let games = await cp.execSync("legendary list-games", {stdio: 'pipe'})
	games = games.toString()
	.replaceAll('\n  - This game can be activated directly on your Ubisoft account and does not require legendary to install/run. Use "legendary activate --uplay" and follow the instructions.', '')
	.replace('Available games:', 'The games you own are the following:')
	console.log(games)
}