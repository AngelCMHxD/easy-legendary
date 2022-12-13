const fs = require("fs");
const path = require("path");
const localePath = path.join(require.main.path, "lang");
const languageFolders = fs.readdirSync(localePath);

const languages = {};
const CURRENT_LANGUAGE = "es";
const LANGUAGE_PRIORITIES = ["en", "es"];

function get(loc, ...params) {
	let msg = languages[CURRENT_LANGUAGE][loc];
	let i = 0;
	for (const param of params) {
		msg = msg.replaceAll(`{${i}}`, param);
		i++;
	}
	return msg;
}

function load() {
	for (const languageFile of languageFolders) {
		const languagePath = path.join(localePath, languageFile);

		/*

        this was for multiple files for each language,
        but AngelCMHxD didn't want this!
        so I commented this part of the code
        in case it's needed in the future.

		languages[language] = {};

		for (const file of fs.readdirSync(languagePath)) {
			const filePath = path.join(languagePath, file);
			const content = fs.readFileSync(filePath);

			languages[language][file.split("_" + language)[0]] =
				require("js-yaml").load(content);
		}
        */

		const language = languageFile.split(".")[0];
		const content = fs.readFileSync(languagePath);
		languages[language] = require("js-yaml").load(content);
	}
}

load();

console.log(languages);
console.log(get("APP_NAME"));

module.exports = {
	get,
};
