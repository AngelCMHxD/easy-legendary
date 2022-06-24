const cp = require("child_process");

module.exports = async (diskPath, game) => {
	let elevated = true;
	try {
		await cp.execSync("net session", { stdio: "pipe" });
	} catch (e) {
		elevated = false;
	}

	if (
		!elevated &&
		(diskPath.toLowerCase().startsWith("C:/program files") ||
			diskPath.toLowerCase().startsWith("C:/program files (x86)") ||
			diskPath.toLowerCase().startsWith("C:/windows"))
	) {
		console.log(
			`\x1b[31m[Error]\x1b[0m`,
			`You are trying to update the game "${game}" located in ${diskPath}, which is a protected folder, in order to update a game located there you should have started the tool as administrator! (or in a administrator cmd). Exiting in 20 seconds...`
		);
		await delay(20000);
		process.exit(1);
	}
};
