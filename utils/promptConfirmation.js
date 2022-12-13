const inquirer = require("inquirer");
const Locale = require("../locale");

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
