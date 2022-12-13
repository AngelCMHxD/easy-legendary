const fs = require("fs");
const path = require("path");

const baseFile = fs
	.readFileSync(path.join(require.main.path, "lang", "en.yml"))
	.toString()
	.split("\n");

const otherFile = fs
	.readFileSync(path.join(require.main.path, "lang", "es.yml"))
	.toString()
	.split("\n");

let problems = [];

let i = 1;
for (const line of baseFile) {
	let exist = false;
	for (const otherLine of otherFile) {
		if (otherLine.split(": ")[0] == line.split(": ")[0]) {
			exist = true;
			break;
		}
	}
	if (!exist)
		problems.push(
			"Line doesn't exist at " + i + ": " + line.split(": ")[0]
		);
	i++;
}

if (problems.length <= 0) console.log("Everything ok!");
else problems.forEach((p) => console.log(p));
