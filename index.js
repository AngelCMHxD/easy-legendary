const cp = require("child_process");
const setup = require("./setup");
const inquirer = require("inquirer");
const commandParser = require("./commandParser");

async function loop() {
	console.log("|| MAIN MENU ||")
	const anwser = await inquirer.prompt([
		{
			name: "action",
			type: "list",
			message: "Select what do you want to do",
			pageSize: 20,
			loop: false,
			choices: ["List owned games.", "Start a game...", "List installed/imported games.", "Install a game...", "Import a installed game...", "Uninstall a game...", "Sync games with Epic Games Launcher...", "Exit."]
		}
	])

	await require(`./commands/${commandParser[anwser.action]}`)()
	console.log("\n")
	await inquirer.prompt([
		{
			name: "a",
			type: "password",
			mask: "",
			message: "Press enter to return to main menu..."
		}
	])
	console.clear()
	await loop()
}

(async () => {
	await setup()
	try {
		await cp.execSync("legendary auth", { stdio: 'pipe' })
	} catch (e) {
		console.log("Follow this steps in order to login with your Epic Games Account:")
		console.log("1. Login into Epic Games (A pop-up should have appeared).")
		const sid = await inquirer.prompt([
			{
				name: "sidJson",
				type: "input",
				message: '2. Copy and paste the result text here: '
			}
		]).then((a) => { return (JSON.parse(a.sidJson)).sid })
		await cp.execSync(`legendary auth --sid "${sid}"`, { stdio: 'pipe' })
	}
	await loop()
})()