const cp = require("child_process");
global.delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = async () => {
	let py_ver;
	try {
		result = await cp.execSync("py --version", { stdio: 'pipe' }).toString()
		py_ver = result.slice(7, result.length - 2)
	} catch (e) {
		if (e.toString() === "Error: Command failed: py --version") {
			console.log("Python not installed! First install it in order to use this tool!")
			process.exit(0)
		}
	}

	let installedVersion = py_ver.split(".")
	let compatible;

	if (3 <= parseInt(installedVersion[0])) {
		if (parseInt(installedVersion[0]) === 3) {
			if (8 <= parseInt(installedVersion[1])) compatible = true
			else compatible = false
		} else compatible = true
	} else compatible = false

	if (compatible) console.log(`[Setup] Compatible Python detected (${py_ver})! Proceding...`)
	else {
		console.log(`[Setup] Incompatible Python detected (${py_ver}), you need Python 3.8+ to run this program! Exiting in 5 seconds...`)
		await delay(5000)
		process.exit(0)
	}
	let pip_log;
	try {
		console.log("[Setup] Updating pip to last version...")
		pip_log = cp.execSync("py -m pip install --upgrade pip", { stdio: 'pipe' }).toString()
	} catch (e) {
		throw new Error(e)
	}
	if (pip_log.toString().includes("Collecting pip")) console.log("[Setup] pip got updated! Proceding...")
	else console.log("[Setup] pip was already updated! Proceding...")
	let pip_ver = cp.execSync("py -m pip --version").toString().split(" from ")[0].split("pip ")[1]
	console.log("[Info] Detected pip version: " + pip_ver)
	let legendary_log;
	console.log("[Setup] Checking if legendary is installed and updated...")
	try {
		legendary_log = cp.execSync("py -m pip install --upgrade legendary-gl", { stdio: 'pipe' })
	} catch (e) {
		throw new Error(e)
	}
	if (legendary_log.toString().includes("Collecting legendary-gl")) console.log("[Setup] legendary got installed/updated! Proceding...")
	else console.log("[Setup] legendary was already updated! Proceding...")
	let legendary_ver = cp.execSync("legendary --version").toString().split('"')[1]
	console.log("[Info] Detected legendary version: " + legendary_ver)
	console.log("[Setup] Setup completed! Starting app and clearing console...")
	console.log("\n")
	await delay(3000)
	console.clear()
}