const cp = require("child_process");
global.delay = ms => new Promise(res => setTimeout(res, ms));

module.exports = async () => {
	let py_ver;
	try {
		result = await cp.execSync("py --version", { stdio: 'pipe' }).toString()
		py_ver = result.slice(7, result.length - 2)
	} catch (e) {
		if (e.toString() === "Error: Command failed: py --version") {
			console.log("\x1b[31m[Error]\x1b[0m", "Python not installed! First install it in order to use this tool!")
			process.exit()
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

	if (compatible) console.log("\x1b[36m[Info]\x1b[0m", `Compatible Python detected (${py_ver})! Proceding...`)
	else {
		console.log("\x1b[31m[Error]\x1b[0m", `Incompatible Python detected (${py_ver}), you need Python 3.8+ to run this program! Exiting in 5 seconds...`)
		await delay(5000)
		process.exit()
	}

	let legendary_log;
	console.log("\x1b[34m[Setup]\x1b[0m", "Checking if legendary is installed and updated...")
	try {
		legendary_log = cp.execSync("py -m pip install --upgrade legendary-gl", { stdio: 'pipe' })
	} catch (e) {
		throw new Error(e)
	}
	if (legendary_log.toString().includes("Collecting legendary-gl")) console.log("\x1b[34m[Setup]\x1b[0m", "legendary got installed/updated! Proceding...")
	else console.log("\x1b[34m[Setup]\x1b[0m", "legendary was already updated! Proceding...")
	let legendary_ver = cp.execSync("legendary --version").toString().split('"')
	console.log("\x1b[36m[Info]\x1b[0m", "Detected legendary version: " + legendary_ver[1] + " | " + legendary_ver[3])
	console.log("\x1b[34m[Setup]\x1b[0m", "Setup completed! Starting app and clearing console...")
	console.log("\n")
	await delay(1000)
	console.clear()
}