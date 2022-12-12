const inquirer = require("inquirer");
inquirer.registerPrompt(
	"autocomplete",
	require("inquirer-autocomplete-prompt")
);

module.exports = async (action = "do this") => {
	return inquirer
		.prompt([
			{
				type: "confirm",
				name: "confirm",
				message: `Are you sure that you want to ${action}?`,
				default: true,
			},
		])
		.then((a) => {
			return a.confirm;
		});
};
