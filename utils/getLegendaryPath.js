const cp = require("child_process");

module.exports = async () => {
	let legendaryPath = "";

	if (!cacheObj.legendaryPath) {
		const pipScripts = await cp.execSync(`pip show legendary-gl`, {
			stdio: "pipe",
		});

		pipScripts
			.toString()
			.split("\n")
			.forEach((line) => {
				if (line.includes("Location:")) {
					let packagesPath = line.split("Location: ")[1];
					legendaryPath =
						packagesPath.split("\\").slice(0, -2).join("\\") +
						"\\scripts\\legendary.exe";
				}
			});

		cacheObj.legendaryPath = legendaryPath;
	} else legendaryPath = cacheObj.legendaryPath;

	return legendaryPath;
};
