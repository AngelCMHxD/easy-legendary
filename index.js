const cp = require("child_process");
const setup = require("./setup");
const inquirer = require("inquirer");
const fuzzy = require("fuzzy")
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))
const commands = {
	"list-owned-games": "List owned games.",
	"list-installed-games": "List installed/imported games.",
	"start-game": "Start a game...",
	"install-game": "Install a game...",
	"update-game": "Update a game...",
	"import-game": "Import a installed game...",
	"uninstall-game": "Uninstall a game...",
	"show-game-info": "Show info about a game...",
	"sync-cloud-saves": "Sync cloud saves...",
	"sync-with-egl": "Sync games with Epic Games Launcher...",
	"verify-game-files": "Verify a game's files...",
	"move-game": "Move a game to another folder...",
	"clear-cache": "Clear cache...",
	"exit": "Exit"
}

function searchCommands(answers, input) {
	input = input || '';
	return new Promise(function (resolve) {
		var fuzzyResult = fuzzy.filter(input, Object.values(commands));
		const results = fuzzyResult.map(function (rs) {
			return rs.original;
		});

		results.splice(Object.values(commands).length - 1, 0, new inquirer.Separator());
		results.push(new inquirer.Separator());
		results.unshift(new inquirer.Separator());
		resolve(results);
	});
}

async function loop() {
	console.log("\n\x1b[32m\x1b[1m -- Main menu --\x1b[0m")
	const selected = await inquirer.prompt([
		{
			type: "autocomplete",
			source: searchCommands,
			name: "action",
			message: "Select what do you want to do:",
			emptyText: 'Nothing here!',
			pageSize: 20,
			loop: false,
			validate: function (val) {
				return val ? true : 'Select a valid option!';
			}
		}
	]).then((a) => { return a.action })

	await require(`./commands/${Object.keys(commands).find(c => commands[c] == selected)}`)()
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
		console.log("Follow these steps in order to login with your Epic Games Account:")
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
