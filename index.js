const setup = require("./setup");
const inquirer = require("inquirer");
const fuzzy = require("fuzzy");
const Locale = require("./locale");
inquirer.registerPrompt(
	"autocomplete",
	require("inquirer-autocomplete-prompt")
);

let commands = {
	"list-owned-games": "LIST_OWNED_GAMES",
	"list-installed-games": "LIST_INSTALLED_GAMES",
	"start-game": "START_GAME",
	"install-game": "INSTALL_GAME",
	"update-game": "UPDATE_GAME",
	"import-game": "IMPORT_GAME",
	"uninstall-game": "UNINSTALL_GAME",
	"browse-game-files": "BROWSE_GAME_FILES",
	"show-game-info": "SHOW_GAME_INFO",
	"sync-cloud-saves": "SYNC_CLOUD_SAVES",
	"sync-with-egl": "SYNC_WITH_EGL",
	"verify-game-files": "VERIFY_GAME_FILES",
	"move-game": "MOVE_GAME",
	"create-shortcut": "CREATE_SHORTCUT",
	"refresh-cache": "REFRESH_CACHE",
	"check-for-updates": "CHECK_FOR_UPDATES",
	exit: "EXIT",
};

commands = Object.fromEntries(
	// translate each command
	Object.entries(commands).map((c) => [c[0], Locale.get(c[1]) + "..."])
);

function searchCommands(_, input = "") {
	const cmds = Object.values(commands);
	var fuzzyResult = fuzzy.filter(input, cmds);
	const results = fuzzyResult.map((rs) => rs.original);

	results.splice(cmds.length - 1, 0, new inquirer.Separator());
	results.push(new inquirer.Separator());
	results.unshift(new inquirer.Separator());

	return results;
}

async function promptReturn() {
	return inquirer.prompt([
		{
			name: "a",
			type: "password",
			mask: "",
			message: Locale.get("PRESS_ENTER_TO_RETURN_TO_MAIN_MENU"),
		},
	]);
}

async function loop() {
	console.log(`\n\x1b[32m\x1b[1m -- ${Locale.get("MAIN_MENU")} --\x1b[0m`);
	const selected = await inquirer
		.prompt([
			{
				type: "autocomplete",
				source: searchCommands,
				name: "action",
				message: Locale.get("SELECT_ACTION"),
				emptyText: Locale.get("EMPTY_PLACEHOLDER"),
				pageSize: 20,
				loop: false,
				validate: function (val) {
					return val ? true : Locale.get("SELECT_VALID_OPTION");
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
	await promptReturn();
	console.clear();
	await loop();
}

(async () => {
	console.log(
		`\x1b[32m\x1b[1m -- ${Locale.get(
			"WELCOME",
			Locale.get("APP_NAME")
		)} --\x1b[0m`
	);
	if (getCompiled())
		console.log(
			`\x1b[36m[Info]\x1b[0m ${Locale.get(
				"UNCOMPILED_VERSION_DETECTED",
				Locale.get("APP_NAME")
			)} ${Locale.get("UNSTABLE_BUILD_WARNING")}`
		);

	//await setup();
	await loop();
})();

process.on("uncaughtException", async (err) => {
	console.log(`\x1b[31m[${Locale.get("ERROR")}]\x1b[0m`);
	console.log(err);
	await promptReturn();
	console.clear();
	await loop();
	/*
	console.log(
		"\x1b[36m[Info]\x1b[0m Easy Legendary will close in 5 seconds..."
	);
	await delay(5000);
	process.exit(1);
	*/
});
