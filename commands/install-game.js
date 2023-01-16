const cp = require("child_process");
const PATH_REGEX = /^[a-zA-Z]:\\([^\\\/:*?"<>|]+\\)*\w*$/gm;
const Locale = require("../locale");

async function promptDiskPath() {
	return inquirer
		.prompt([
			{
				type: "input",
				name: "diskPath",
				message: `Where do you want to install the game?`,
				validate: (val) => {
					if (val) {
						let matched = PATH_REGEX.test(
							val.replaceAll("/", "\\")
						);
						if (matched) return true;
						else {
							let matched = PATH_REGEX.test(
								val.replaceAll("/", "\\") + "\\"
							);
							if (matched) return true;
						}
					}
					return Locale.get("TYPE_A_VALID_PATH");
				},
			},
		])
		.then((a) => {
			return a.diskPath;
		})
		.then(
			(path) =>
				path
					.replaceAll("\\", "/")
					.replaceAll("\\\\", "/")
					.split(":")[0]
					.toUpperCase() +
				":" +
				diskPath.split(":")[1]
		);
}

module.exports = async () => {
	const games = await require("../utils/searchGames.js")("owned");

	const game = await require("../utils/promptGame")(
		games,
		Locale.get("ACTIONS.INSTALL")
	);

	if (game === Locale.get("SELECT_THIS_ITEM_TO_EXIT")) return;

	let config = await configObj.getConfig();
	let unfinishedDownload = false;
	let unfinishedDownloads = config.unfinishedDownloads;
	unfinishedDownloads.forEach((download) => {
		if (download.name === game) unfinishedDownload = download;
	});
	let diskPath;
	if (unfinishedDownload) {
		diskPath = unfinishedDownload.diskPath;
	}

	if (!unfinishedDownload) {
		diskPath = await promptDiskPath();
	}

	let gamePath = diskPath + "/" + game;
	gamePath = gamePath.replaceAll("//", "/");

	const confirm = await require("../utils/promptConfirmation")(
		Locale.get("ACTIONS.INSTALL_GAME_IN_PATH", game, gamePath)
	);

	if (!confirm) return console.log("Installation cancelled!");

	if (!unfinishedDownload) {
		unfinishedDownloads.push({ name: game, diskPath: diskPath });
		configObj.setConfig("unfinishedDownloads", unfinishedDownloads);
	}

	// exit if folder is protected and is not elevated
	if (!(await require("../utils/elevationCheck.js")(diskPath, game))) return;

	console.log(`Installing ${game}...`);
	console.log(
		`The installation will occur in a separated cmd window in order to prevent errors!`
	);

	await cp.execSync(
		`start cmd /K legendary install "${game}" --base-path "${diskPath}" -y`,
		{ encoding: "utf-8", stdio: "inherit" }
	);
};
