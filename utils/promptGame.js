const inquirer = require("inquirer");
inquirer.registerPrompt(
	"autocomplete",
	require("inquirer-autocomplete-prompt")
);

module.exports = async (source, action = "do this to") => {
	return inquirer
		.prompt([
			{
				type: "autocomplete",
				source: source,
				name: "game",
				message: `Type the name of the game you want to ${action}:`,
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
};
