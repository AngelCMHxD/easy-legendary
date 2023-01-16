const cp = require("child_process");
const Locale = require("../locale");

module.exports = async (diskPath, game) => {
	try {
		await cp.execSync("net session", { stdio: "pipe" });
	} catch (e) {
		if (
			["c:/program files", "c:/windows"].some((p) =>
				diskPath.toLowerCase().startsWith(p)
			)
		) {
			console.log(
				`\x1b[31m[Error]\x1b[0m`,
				`You are trying to update the game "${game}" located in "${diskPath}", which is a protected folder.
				In order to update a game located there, you should have started the tool as administrator, or in an administrator or elevated cmd.
				Exiting in 20 seconds...`
			);
			await delay(20000);
			process.exit(1);
		}
	}
	return true;
};
