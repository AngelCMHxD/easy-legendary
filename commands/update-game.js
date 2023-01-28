const cp = require("child_process");
const inquirer = require("inquirer");
const Locale = require("../locale");
const { surround } = require("../utils/stringUtils");

module.exports = async () => {
	const games = await require("../utils/searchGames.js")("installed");

	const game = await require("../utils/promptGame")(
		games,
		Locale.get("ACTIONS.UPDATE")
	);

	if (game === Locale.get("SELECT_THIS_ITEM_TO_EXIT")) return;

	const confirm = await require("../utils/promptConfirmation")(
		Locale.get("ACTIONS.UPDATE_GAME", game)
	);

	if (!confirm) {
		console.log(Locale.get("UPDATE_CANCELLED"));
		return;
	}

	const gameInfo = await cp
		.execSync(`legendary info "${game}"`, { stdio: "pipe" })
		.toString()
		.replaceAll("\\", "/")
		.split("\n");

	const diskPath = gameInfo
		.find((line) => line.startsWith("- Install path: "))
		.slice("- Install path: ".length, -1);

	// exit if folder is protected and is not elevated
	if (!(await require("../utils/elevationCheck.js")(diskPath, game))) return;

	console.log(
		`${Locale.get("UPDATING_GAME", surround(game))} (${diskPath})...`
	);
	await cp.execSync(`legendary update "${game}" -y`, {
		stdio: "inherit",
	});
};
