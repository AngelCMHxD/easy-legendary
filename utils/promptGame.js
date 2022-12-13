const inquirer = require("inquirer");
const Locale = require("../locale");

module.exports = async (source, action = "do this to") => {
	return inquirer
		.prompt([
			{
				type: "autocomplete",
				source: source,
				name: "game",
				message: Locale.get(
					"TYPE_THE_NAME_OF_THE_GAME_YOU_WANT_TO_ACTION",
					action
				),
				emptyText: Locale.get("EMPTY_PLACEHOLDER"),
				suggestMessage: Locale.get("USE_ARROW_KEYS_OR_TYPE_TO_SEARCH"),
				pageSize: 10,
				loop: false,
				validate: function (val) {
					return val ? true : Locale.get("SELECT_A_VALID_GAME");
				},
			},
		])
		.then((a) => {
			return a.game;
		});
};
