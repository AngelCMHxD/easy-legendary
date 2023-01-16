const cliProgress = require("cli-progress");
const fs = require("fs");
const inquirer = require("inquirer");
const request = require("request");
const unzipper = require("unzipper");
const Locale = require("../locale");

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
			return (
				Locale.get("RESPONSE_CODE_NOT_OK") + ": " + response.statusCode
			);

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

	if (!update) return console.log(Locale.get("UP_TO_DATE"));

	console.log(`${Locale.get("UPDATE_AVAILABLE")} (${update})`);
	console.log(
		`${Locale.get(
			"CHANGELOG"
		)}: https://github.com/AngelCMHxD/easy-legendary/releases/tag/` + update
	);

	let locatedMainDir;
	if (!getCompiled()) {
		locatedMainDir = process.argv0.split("\\");
	} else {
		console.log(
			`${Locale.get("USING_UNCOMPILED_VERSION")} ${Locale.get(
				"UPDATED_VERSION_COMPILED"
			)}`
		);
		locatedMainDir = process.argv[1].split("\\");
	}

	const confirm = await require("../utils/promptConfirmation")(
		Locale.get("UPDATE_TO_VERSION", `v${update}`)
	);

	if (!confirm) return console.log(Locale.get("UPDATE_ABORTED"));

	locatedMainDir.pop();
	let path = locatedMainDir.join("\\") + "\\";

	const fileName = `${Locale.get("APP_NAME")
		.toLowerCase()
		.replaceAll(" ", "-")}_${Locale.get("UPDATED").toLowerCase()}.zip`;

	const downloadingFileName =
		fileName + "." + Locale.get("DOWNLOADING").toLowerCase();

	if (fs.existsSync(path + fileName)) fs.unlinkSync(path + fileName);

	if (fs.existsSync(path + downloadingFileName))
		fs.unlinkSync(path + downloadingFileName);

	console.log(Locale.get("DOWNLOADING_FILE", fileName));
	const download = await downloadFile(
		"https://github.com/AngelCMHxD/easy-legendary/releases/latest/download/easy-legendary.zip",
		path + downloadingFileName
	);
	if (
		(typeof download === Boolean && !download) ||
		typeof download === String
	) {
		console.log(Locale.get("DOWNLOAD_FAILED"));
		if (typeof download === String)
			console.log(Locale.get("ERROR") + ": " + download);
		return;
	}
	await fs.renameSync(path + downloadingFileName, path + fileName);
	console.log(Locale.get("UPDATE_DOWNLOADED"));
	console.log(Locale.get("UNZIPPING_FILE"));

	await fs
		.createReadStream(path + fileName)
		.pipe(unzipper.Extract({ path: path }))
		.promise();
	await fs.renameSync(
		path + Locale.get("APP_NAME").toLowerCase().replaceAll(" ", "-"),
		path + fileName.split(".")[0] //without .zip extension
	);
	console.log(Locale.get("FILE_UNZIPPED"));
	console.log(Locale.get("CLEANING_UP"));
	await fs.unlinkSync(path + fileName);
	console.log(Locale.get("UPDATE_FINISHED"));
	console.log(
		"There should be a new folder called 'easy-legendary_updated' in the same directory as this executable. This folder contains the updated files."
	);
};
