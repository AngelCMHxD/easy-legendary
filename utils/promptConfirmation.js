const inquirer = require("inquirer");
const Locale = require("../locale");

module.exports = async (action = "do this") => {
	return inquirer
		.prompt([
			{
				type: "confirm",
				name: "confirm",
				message: Locale.get(
					"ARE_YOU_SURE_THAT_YOU_WANT_TO_ACTION",
					action
				),
				default: true,
			},
		])
		.then((a) => {
			return a.confirm;
		});
};
