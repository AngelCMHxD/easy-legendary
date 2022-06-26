const cp = require("child_process");
const setup = require("./setup");
const inquirer = require("inquirer");
const fuzzy = require("fuzzy");
inquirer.registerPrompt(
	"autocomplete",
	require("inquirer-autocomplete-prompt")
);
const commands = {
	"list-owned-games": "List owned games...",
	"list-installed-games": "List installed/imported games...",
	"start-game": "Start a game...",
	"install-game": "Install a game...",
	"update-game": "Update a game...",
	"import-game": "Import a installed game...",
	"uninstall-game": "Uninstall a game...",
	"browse-game-files": "Browse within game's files...",
	"show-game-info": "Show info about a game...",
	"sync-cloud-saves": "Sync cloud saves...",
	"sync-with-egl": "Sync games with Epic Games Launcher...",
	"verify-game-files": "Verify a game's files...",
	"move-game": "Move a game to another folder...",
	"create-shortcut": "Create a shortcut...",
	"clear-cache": "Clear cache...",
	exit: "Exit",
};

function searchCommands(answers, input) {
	input = input || "";
	return new Promise(function (resolve) {
		const cmds = [];
		Object.values(commands).forEach((cmd) => {
			cmds.push(cmd);
		});
		var fuzzyResult = fuzzy.filter(input, cmds);
		const results = fuzzyResult.map(function (rs) {
			return rs.original;
		});

		results.splice(cmds.length - 1, 0, new inquirer.Separator());
		results.push(new inquirer.Separator());
		results.unshift(new inquirer.Separator());
		resolve(results);
	});
}

async function loop() {
	console.log("\n\x1b[32m\x1b[1m -- Main menu --\x1b[0m");
	const selected = await inquirer
		.prompt([
			{
				type: "autocomplete",
				source: searchCommands,
				name: "action",
				message: "Select what do you want to do:",
				emptyText: "Nothing here!",
				pageSize: 20,
				loop: false,
				validate: function (val) {
					return val ? true : "Select a valid option!";
				},
			},
		])
		.then((a) => {
			return a.action;
		});

	await require(`./commands/${Object.keys(commands).find(
		(c) => commands[c] == selected
	)}`)();
	console.log("\n");
	await inquirer.prompt([
		{
			name: "a",
			type: "password",
			mask: "",
			message: "Press enter to return to main menu...",
		},
	]);
	console.clear();
	await loop();
}

(async () => {
	console.log(`\x1b[32m\x1b[1m -- Welcome to Easy Legendary --\x1b[0m`);
	if (!require.main.path.endsWith("\\snapshot\\legendary"))
		console.log(
			"\x1b[36m[Info]\x1b[0m Uncompiled version of Easy Legendary detected. This build may be unstable."
		);

	await setup();
	try {
		await cp.execSync("legendary auth", { stdio: "pipe" });
	} catch (e) {
		console.log(
			"Follow these steps in order to login with your Epic Games Account:"
		);
		console.log("1. Login into Epic Games (A pop-up should have appeared).");
		const sid = await inquirer
			.prompt([
				{
					name: "sidJson",
					type: "input",
					message: "2. Copy and paste the result text here: ",
				},
			])
			.then(async (a) => {
				try {
					let sid = JSON.parse(a.sidJson).sid;
					if (sid) return sid;
					else throw new Error("Invalid JSON");
				} catch (e) {
					if (e.toString().startsWith("SyntaxError")) return a.sidJson;
					if (e.toString().startsWith("Error: Invalid JSON")) {
						console.log(
							"\x1b[31m[Error]\x1b[0m JSON does not contains account SID."
						);
						await delay(3000);
						process.exit(1);
					}
				}
			});
		await cp.execSync(`legendary auth --sid "${sid}"`, { stdio: "pipe" });
	}
	await loop();
})();

process.on("uncaughtException", async (err) => {
	console.log("\x1b[31m[Error]\x1b[0m " + err.toString());
	console.log(
		"\x1b[36m[Info]\x1b[0m Easy Legendary will close in 5 seconds..."
	);
	await delay(5000);
	process.exit(1);
});
