const cp = require("child_process");

module.exports = async () => {
	const games = await require("../utils/searchOwnedGames.js")();

	const game = await require("../utils/promptGame")(games, "install");

	if (game === "Select this item to exit...") return;

	let config = await configObj.getConfig();
	let unfinishedDownload = false;
	let unfinishedDownloads = config.unfinishedDownloads;
	unfinishedDownloads.forEach((download) => {
		if (download.name === game) unfinishedDownload = download;
	});
	let diskPath;
	if (!unfinishedDownload) {
		diskPath = await inquirer
			.prompt([
				{
					type: "input",
					name: "diskPath",
					message: `Where do you want to install the game?`,
					validate: (val) => {
						if (val) {
							let regex =
								/^[a-zA-Z]:\\([^\\\/:*?"<>|]+\\)*\w*$/gm;
							let matchRegex = regex.test(
								val.replaceAll("/", "\\")
							);
							if (matchRegex) return true;
							else {
								let matchRegex = regex.test(
									val.replaceAll("/", "\\") + "\\"
								);
								if (matchRegex) return true;
								else return "Type a valid path";
							}
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
	} else diskPath = unfinishedDownload.diskPath;

	let diskPathwGame = diskPath + "/" + game;
	diskPathwGame = diskPathwGame.replaceAll("//", "/");

	const confirm = await inquirer
		.prompt([
			{
				type: "confirm",
				name: "confirm",
				message: `Are you sure that you want to install "${game}" in "${diskPathwGame}"?`,
			},
		])
		.then((a) => {
			return a.confirm;
		});

	if (!confirm) return console.log("Installation cancelled!");

	if (!unfinishedDownload) {
		unfinishedDownloads.push({ name: game, diskPath: diskPath });
		configObj.setConfig("unfinishedDownloads", unfinishedDownloads);
	}

	// exit if folder is protected and is not elevated
	require("../utils/elevationCheck.js")(diskPath, game);

	console.log(`Installing ${game}...`);
	console.log(
		`The installation will occur on a separated cmd window in order to prevent errors!`
	);

	await cp.execSync(
		`start cmd /K legendary install "${game}" --base-path "${diskPath}" -y`,
		{ encoding: "utf-8", stdio: "inherit" }
	);
};
