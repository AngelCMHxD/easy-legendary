const cp = require("child_process");
const fs = require("fs");
const fetch = require("node-fetch");
global.delay = (ms) => new Promise((res) => setTimeout(res, ms));
global.cacheObj = {};
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

module.exports = async () => {
	let py_ver;
	try {
		result = await cp.execSync("py --version", { stdio: "pipe" }).toString();
		py_ver = result.slice(7, result.length - 2);
	} catch (e) {
		if (e.toString() === "Error: Command failed: py --version") {
			console.log(
				"\x1b[31m[Error]\x1b[0m",
				"Python not installed! First install it in order to use this tool! (Remember to add it to the path)"
			);
			await delay(5000);
			process.exit(1);
		}
	}

	let installedVersion = py_ver.split(".");
	let compatible;

	if (3 <= parseInt(installedVersion[0])) {
		if (parseInt(installedVersion[0]) === 3) {
			if (8 <= parseInt(installedVersion[1])) compatible = true;
			else compatible = false;
		} else compatible = true;
	} else compatible = false;

	if (compatible)
		console.log(
			"\x1b[36m[Info]\x1b[0m",
			`Compatible Python detected (${py_ver})! Proceding...`
		);
	else {
		console.log(
			"\x1b[31m[Error]\x1b[0m",
			`Incompatible Python detected (${py_ver}), you need Python 3.8+ to run this program! Exiting in 5 seconds...`
		);
		await delay(5000);
		process.exit(1);
	}

	let configPath = getConfigPath();

	if (!fs.existsSync(configPath + "config.json")) {
		createConfig();
		await updateLegendary();
	} else {
		await checkConfig();
		checkForUpdate();
	}

	console.log("\x1b[36m[Info]\x1b[0m", `Loading cache...`);
	await loadCache();
	console.log("\x1b[36m[Info]\x1b[0m", `Finished caching...`);

	console.log(
		"\x1b[34m[Setup]\x1b[0m",
		"Setup completed! Starting app and clearing console..."
	);
	console.log("\n");
	await delay(500);
	console.clear();
};

async function updateLegendary() {
	let legendary_log;
	console.log(
		"\x1b[34m[Setup]\x1b[0m",
		"Checking if legendary is installed and updated..."
	);
	try {
		legendary_log = cp.execSync("py -m pip install --upgrade legendary-gl", {
			stdio: "pipe",
		});
	} catch (e) {
		throw new Error(e);
	}
	if (legendary_log.toString().includes("Collecting legendary-gl"))
		console.log(
			"\x1b[34m[Setup]\x1b[0m",
			"legendary got installed/updated! Proceding..."
		);
	else
		console.log(
			"\x1b[34m[Setup]\x1b[0m",
			"legendary was already updated! Proceding..."
		);
	let legendary_ver = cp.execSync("legendary --version").toString().split('"');
	console.log(
		"\x1b[36m[Info]\x1b[0m",
		"Detected legendary version: " + legendary_ver[1] + " | " + legendary_ver[3]
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

	if (process.argv0.endsWith("node.exe"))
		configPath = process.argv[1].split("\\");
	else configPath = process.argv0.split("\\");

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

	if (Object.entries(config).length !== Object.entries(defaultConfig).length) {
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

async function checkForUpdate() {
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

async function loadCache() {
	let cache;
	let cachePath = getConfigPath() + "cache.json";
	let cacheExists = fs.existsSync(cachePath);
	if (cacheExists) {
		cache = await fs.readFileSync(cachePath).toString();
		cacheObj = JSON.parse(cache);
	} else startCaching();
	removeFinishedDownloadsFromConfig();
}

global.startCaching = () => {
	require("./utils/searchInstalledGames")();
	require("./utils/searchOwnedGames")();
	require("./utils/getInstalledGames")();
	require("./utils/getOwnedGames")();
	require("./utils/getLegendaryPath")();
};

global.removeFinishedDownloadsFromConfig = async () => {
	const config = await configObj.getConfig();
	let unfinishedDownloads = [];
	await config.unfinishedDownloads.forEach(async (download) => {
		const isInstalled = await require("./utils/isInstalled")(download.name);
		if (!isInstalled) unfinishedDownloads.push(download);
	});

	configObj.setConfig("unfinishedDownloads", unfinishedDownloads);
};
