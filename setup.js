const cp = require("child_process");
const fs = require("fs");
const fetch = require("node-fetch");
const inquirer = require("inquirer");
const Locale = require("./locale");
global.version = "1.4.2";
global.delay = (ms) => new Promise((res) => setTimeout(res, ms));
global.cacheObj = {};
global.clearLastLine = () => {
	process.stdout.moveCursor(0, -1);
	process.stdout.clearLine(1);
};
global.getCompiled = () => {
	let path = require.main.path;
	let splitPath = path.split("\\");
	splitPath.pop();
	let name = splitPath.pop();
	if (name === "snapshot") return true;
	return false;
};
global.writeCache = async () => {
	let path = getConfigPath();
	path += "cache.json";
	await fs.writeFileSync(path, JSON.stringify(cacheObj, null, "\t"));
};
global.configObj = {};
let defaultConfig = {
	updateDetected: false,
	unfinishedDownloads: [],
};

const SETUP_PREFIX = `\x1b[34m[${Locale.get("SETUP")}]\x1b[0m`;
const ERROR_PREFIX = `\x1b[31m[${Locale.get("ERROR")}]\x1b[0m`;
const INFO_PREFIX = `\x1b[36m[${Locale.get("INFO")}]\x1b[0m`;

module.exports = async () => {
	console.log(SETUP_PREFIX, Locale.get("CHECKING_PYTHON_VERSION"));
	let py_ver;
	try {
		result = cp.execSync("py --version", { stdio: "pipe" }).toString();
		py_ver = result.slice(7, result.length - 2);
	} catch (e) {
		if (e.toString() === "Error: Command failed: py --version") {
			console.log(
				ERROR_PREFIX,
				"Python not installed! First install it in order to use this tool! (Remember to add it to the path)"
			);
			await delay(5000);
			process.exit(1);
		}
	}

	let installedVersion = py_ver.split(".").map((i) => parseInt(i));
	let compatible = true;
	if (installedVersion[0] < 3 && installedVersion[1] < 9) compatible = false;

	if (!compatible) {
		console.log(
			ERROR_PREFIX,
			`Incompatible Python detected (${py_ver}), you need Python 3.9+ to run this program! Exiting in 5 seconds...`
		);
		await delay(5000);
		process.exit(1);
	}

	console.log(
		SETUP_PREFIX,
		`${Locale.get(
			"COMPATIBLE_PYTHON_VERSION_DETECTED"
		)} (${py_ver})! ${Locale.get("PROCEEDING")}...`
	);

	const configPath = getConfigPath();

	if (!(await fs.existsSync(configPath + "config.json"))) {
		console.log(
			SETUP_PREFIX,
			Locale.get("CONFIG_FILE_NOT_FOUND_CREATING_IT")
		);
		createConfig();
		await updateLegendary();
	} else {
		console.log(
			SETUP_PREFIX,
			`${Locale.get("CONFIG_FILE_FOUND")} ${Locale.get("PROCEEDING")}...`
		);
		await checkConfig();
		checkForUpdateLegendary();
	}

	console.log(SETUP_PREFIX, Locale.get("CHECKING_SESSION") + "...");
	await loginOntoLegendary();

	console.log(SETUP_PREFIX, Locale.get("LOADING_CACHE") + "...");
	await loadCache();
	console.log(SETUP_PREFIX, Locale.get("FINISHED_LOADING_CACHE"));

	console.log(INFO_PREFIX, Locale.get("CHECKING_FOR_UPDATES") + "...");
	const lastVersion = await isUpdateAvailable();
	if (lastVersion)
		console.log(
			INFO_PREFIX,
			Locale.get("UPDATE_DETECTED") + ` (v${lastVersion})`
		);
	else console.log(INFO_PREFIX, Locale.get("RUNNING_LATEST_VERSION"));

	console.log(
		SETUP_PREFIX,
		Locale.get("SETUP_COMPLETED") + " " + Locale.get("STARTING_APP") + "..."
	);
	console.log("\n");
	await delay(lastVersion ? 5000 : 1000);
	console.clear();
};

async function updateLegendary() {
	let legendary_log;
	console.log(
		SETUP_PREFIX,
		"Checking if legendary is installed and updated..."
	);
	try {
		legendary_log = cp.execSync(
			"py -m pip install --upgrade legendary-gl",
			{
				stdio: "pipe",
			}
		);
	} catch (e) {
		throw new Error(e);
	}
	if (legendary_log.toString().includes("Collecting legendary-gl"))
		console.log(
			SETUP_PREFIX,
			"legendary got installed/updated! Proceeding..."
		);
	else
		console.log(
			SETUP_PREFIX,
			"legendary was already updated! Proceeding..."
		);
	let legendary_ver = cp
		.execSync("legendary --version")
		.toString()
		.split('"');
	console.log(
		INFO_PREFIX,
		"Detected legendary version: " +
			legendary_ver[1] +
			" | " +
			legendary_ver[3]
	);
}

/**
 * @param {array} prevConfigs
 */
async function createConfig(prevConfigs) {
	let path = getConfigPath();
	let newConfigs = defaultConfig;

	if (prevConfigs)
		prevConfigs.forEach((config) => {
			newConfigs[config.name] = config.value;
		});

	await fs.writeFileSync(
		path + "config.json",
		JSON.stringify(newConfigs, null, "\t")
	);
}

configObj.setConfig = async (entry, value) => {
	let configPath = getConfigPath();
	let config = await configObj.getConfig();
	config[entry] = value;

	await fs.writeFileSync(
		configPath + "config.json",
		JSON.stringify(config, null, "\t")
	);
};

configObj.getConfig = async (returnConfigPath) => {
	let configPath = getConfigPath();

	if (returnConfigPath) return configPath;

	let config = await fs.readFileSync(configPath + "config.json").toString();
	config = await JSON.parse(config);
	return config;
};

function getConfigPath() {
	let configPath;

	if (getCompiled()) configPath = process.argv0.split("\\");
	else configPath = process.argv[1].split("\\");

	configPath.pop();
	configPath = configPath.join("\\") + "\\";

	return configPath;
}

async function checkConfig() {
	let config = await configObj.getConfig();

	if (config.updateDetected) {
		await updateLegendary();
		configObj.setConfig("updateDetected", false);
	}

	if (
		Object.entries(config).length !== Object.entries(defaultConfig).length
	) {
		let prevConfigs = [];
		Object.entries(config).forEach((entry) => {
			prevConfigs.push({
				name: entry,
				value: config[entry],
			});
		});

		createConfig(prevConfigs);
	}
}

async function checkForUpdateLegendary() {
	let legendary_ver = await cp
		.execSync("legendary --version")
		.toString()
		.split('"');

	const release = await fetch(
		"https://api.github.com/repos/derrod/legendary/releases/latest"
	).then((res) => {
		return res.json();
	});

	if (legendary_ver[1] !== release.tag_name) {
		configObj.setConfig("updateDetected", true);
	}
}

global.isUpdateAvailable = async () => {
	const release = await fetch(
		"https://api.github.com/repos/AngelCMHxD/easy-legendary/releases/latest"
	).then((res) => {
		return res.json();
	});

	if (version !== release.tag_name) return release.tag_name;
	return false;
};

async function loadCache() {
	let cache;
	let cachePath = getConfigPath() + "cache.json";
	let cacheExists = fs.existsSync(cachePath);
	if (cacheExists) {
		cache = await fs.readFileSync(cachePath).toString();
		cacheObj = JSON.parse(cache);
	} else await startCaching();
	removeFinishedDownloadsFromConfig();
}

const CACHE_PREFIX = `\x1b[36m[${Locale.get("CACHE")}]\x1b[0m`;

global.startCaching = async () => {
	console.log(CACHE_PREFIX, "(1/6) Caching installed games list...");
	await require("./utils/searchGames.js")("installed");

	clearLastLine();
	console.log(CACHE_PREFIX, "(2/6) Caching owned games list...");
	await require("./utils/searchGames.js")("owned");

	clearLastLine();
	console.log(CACHE_PREFIX, "(3/6) Caching installed games logs...");
	await require("./utils/getInstalledGames")();

	clearLastLine();
	console.log(CACHE_PREFIX, "(4/6) Caching owned games logs...");
	await require("./utils/getOwnedGames")();
	clearLastLine();

	console.log(CACHE_PREFIX, "(5/6) Caching legendary-gl path...");
	await require("./utils/getLegendaryPath")();
	clearLastLine();

	console.log(CACHE_PREFIX, "(6/6) Saving cache...");
	writeCache();
	clearLastLine();
};

global.removeFinishedDownloadsFromConfig = async () => {
	const config = await configObj.getConfig();
	let unfinishedDownloads = [];
	await config.unfinishedDownloads.forEach(async (download) => {
		const isInstalled = await require("./utils/isInstalled")(download.name);
		console.log(isInstalled);
		if (!isInstalled) unfinishedDownloads.push(download);
	});

	configObj.setConfig("unfinishedDownloads", unfinishedDownloads);
};

async function loginOntoLegendary() {
	let alreadyLoggedIn = true;
	try {
		await cp.execSync("legendary auth", { stdio: "pipe" });
	} catch (e) {
		alreadyLoggedIn = false;
		console.clear();
		console.log(
			"Follow these steps in order to login with your Epic Games Account:"
		);
		console.log(
			"1. Login into Epic Games (A pop-up should have appeared)."
		);
		const authorizationCode = await inquirer
			.prompt([
				{
					name: "authJson",
					type: "input",
					message: "2. Copy and paste the result text here: ",
				},
			])
			.then(async (a) => {
				try {
					let auth = JSON.parse(a.authJson).authorizationCode;
					if (auth) return auth;
					else throw new Error("Invalid JSON");
				} catch (e) {
					if (e.toString().startsWith("SyntaxError"))
						return a.authJson;
					if (e.toString().startsWith("Error: Invalid JSON")) {
						console.log(
							"\x1b[31m[Error]\x1b[0m JSON does not contains authorizationCode."
						);
						await delay(3000);
						process.exit(1);
					}
				}
			});
		await cp.execSync(`legendary auth --code "${authorizationCode}"`, {
			stdio: "pipe",
		});
		console.clear();
	}
	return alreadyLoggedIn;
}
