const cp = require("child_process");
const inquirer = require("inquirer");
const Locale = require("../locale");

module.exports = async () => {
	const games = await require("../utils/searchGames.js")("owned");

	const game = await require("../utils/promptGame")(games, "import");

	if (game === Locale.get("SELECT_THIS_ITEM_TO_EXIT")) return;

	let diskPath = await inquirer
		.prompt([
			{
				type: "input",
				name: "diskPath",
				message: `Where is the game you want to import?`,
				validate: (val) => {
					if (val) {
						let regex = /^[a-zA-Z]:\\([^\\\/:*?"<>|]+\\)*\w*$/gm;
						let matchRegex = regex.test(val.replaceAll("/", "\\"));
						if (matchRegex) return true;
					}
					return Locale.get("TYPE_A_VALID_PATH");
				},
			},
		])
		.then((a) => {
			return a.diskPath;
		});
	diskPath = diskPath.replaceAll("\\", "/").replaceAll("\\\\", "/");
	diskPath =
		diskPath.split(":")[0].toUpperCase() + ":" + diskPath.split(":")[1];

	const confirm = await require("../utils/promptConfirmation")(
		`import the game "${game}", located in "${diskPath}"`
	);

	if (!confirm) {
		console.log("Operation aborted!");
		return;
	}

	console.log(`Importing "${game}"...`);
	await cp.execSync(
		`legendary import-game "${game}" "${diskPath}" --with-dlcs`,
		{ stdio: "inherit" }
	);
};
