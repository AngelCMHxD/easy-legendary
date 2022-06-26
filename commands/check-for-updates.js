const cliProgress = require("cli-progress");
const fs = require("fs");
const inquirer = require("inquirer");
const request = require("request");
const fetch = require("node-fetch");
const unzipper = require("unzipper");

async function downloadFile(url, filename) {
	const progressBar = new cliProgress.SingleBar(
		{
			format: "{bar} {percentage}%",
		},
		cliProgress.Presets.shades_classic
	);

	const file = fs.createWriteStream(filename);
	let currentBytes = 0;

	let res;
	let req = request.get(url);

	req.on("response", (response) => {
		if (response.statusCode !== 200)
			return "Response code isn't ok, got " + response.statusCode;

		res = response;
		progressBar.start(response.headers["content-length"], 0);
	});

	req.on("data", (chunk) => {
		currentBytes += chunk.length;
		progressBar.update(currentBytes);
	});

	req.pipe(file);

	req.on("error", (err) => {
		fs.unlink(filename, (err) => {
			if (err) return err;
		});
		progressBar.stop();
		return err.message;
	});

	file.on("error", (err) => {
		fs.unlink(filename, (err) => {
			if (err) return err;
		});
		progressBar.stop();
		return err.message;
	});

	return new Promise((resolve, reject) => {
		req.on("end", () => {
			progressBar.stop();
			resolve(true);
		});
	});
}

module.exports = async () => {
	let update = await isUpdateAvailable();

	if (!update)
		return console.log("There isn't any update available! You are up to date!");

	console.log(`There is an update available! (${update})`);
	console.log(
		"Changelog: https://github.com/AngelCMHxD/easy-legendary/releases/tag/" +
			update
	);

	let locatedMainDir;
	if (!require.main.path.endsWith("\\snapshot\\legendary")) {
		console.log(
			"You are using a uncompiled version of easy-legendary. Take into account that the updated version of easy-legendary will be compiled."
		);
		locatedMainDir = process.argv[1].split("\\");
	} else locatedMainDir = process.argv0.split("\\");
	const confirm = await inquirer
		.prompt([
			{
				type: "confirm",
				name: "confirm",
				message: `Are you sure that you want to update to v${update}?`,
			},
		])
		.then((a) => {
			return a.confirm;
		});

	if (!confirm) return console.log("Update aborted!");

	locatedMainDir.pop();
	let path = locatedMainDir.join("\\") + "\\";

	console.log(`Downloading file easy-legendary_updated.zip...`);
	const download = await downloadFile(
		"https://github.com/AngelCMHxD/easy-legendary/releases/latest/download/easy-legendary.zip",
		path + "easy-legendary_updated.zip"
	);
	if (
		(typeof download === Boolean && !download) ||
		typeof download === String
	) {
		console.log("Download failed!");
		if (typeof download === String) console.log("Error: " + download);
		return;
	}

	console.log("Update downloaded!");
	console.log("Unzipping file...");

	await fs
		.createReadStream(path + "easy-legendary_updated.zip")
		.pipe(unzipper.Extract({ path: path }))
		.promise();
	await fs.renameSync(path + "easy-legendary", path + "easy-legendary_updated");
	console.log("File unzipped!");
	console.log("Cleaning up...");
	await fs.unlinkSync(path + "easy-legendary_updated.zip");
	console.log("Update finished!");
	console.log(
		"There should be a new folder called 'easy-legendary_updated' in the same directory as this executable. This folder contains the updated files."
	);
};
