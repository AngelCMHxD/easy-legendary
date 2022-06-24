const cp = require("child_process");
const inquirer = require("inquirer");
inquirer.registerPrompt(
	"autocomplete",
	require("inquirer-autocomplete-prompt")
);

module.exports = async () => {
	const searchGames = await require("../utils/searchOwnedGames.js")();

	const game = await inquirer
		.prompt([
			{
				type: "autocomplete",
				source: searchGames,
				name: "game",
				message: "Type the name of the game you want to import:",
				emptyText: "Nothing here!",
				pageSize: 10,
				loop: false,
				validate: function (val) {
					return val ? true : "Select a valid game!";
				},
			},
		])
		.then((a) => {
			return a.game;
		});

	if (game === "Select this item to exit...") return;

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
						else return "Type a valid path";
					} else return "Type a valid path";
				},
			},
		])
		.then((a) => {
			return a.diskPath;
		});
	diskPath = diskPath.replaceAll("\\", "/").replaceAll("\\\\", "/");
	diskPath =
		diskPath.split(":")[0].toUpperCase() + ":" + diskPath.split(":")[1];
	const confirm = await inquirer
		.prompt([
			{
				type: "confirm",
				name: "confirm",
				message: `Are you sure that you want to import the game "${game}", located in "${diskPath}"?`,
			},
		])
		.then((a) => {
			return a.confirm;
		});
	if (confirm) {
		console.log(`Importing "${game}"...`);
		await cp.execSync(
			`legendary import-game "${game}" "${diskPath}" --with-dlcs`,
			{ stdio: "inherit" }
		);
	} else console.log("Operation aborted!");
};
