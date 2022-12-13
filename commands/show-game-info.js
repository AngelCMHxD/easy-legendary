const cp = require("child_process");
const inquirer = require("inquirer");
inquirer.registerPrompt(
	"autocomplete",
	require("inquirer-autocomplete-prompt")
);

module.exports = async () => {
	const games = await require("../utils/searchGames.js")("owned");

	console.log(
		"Due to limitations, you only can see info of games that you own!"
	);

	const game = await require("../utils/promptGame")(
		games,
		Locale.get("SEE_INFO_FOR")
	);

	if (game === Locale.get("SELECT_THIS_ITEM_TO_EXIT")) return;

	const info = await cp.execSync(`legendary info "${game}"`, {
		stdio: "pipe",
	});
	console.log(info.toString());
};
