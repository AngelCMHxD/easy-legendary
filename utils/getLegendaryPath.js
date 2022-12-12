const cp = require("child_process");

module.exports = async () => {
	let legendaryPath = cacheObj.legendaryPath;
	if (legendaryPath) return legendaryPath;

	const pipScripts = await cp
		.execSync(`pip show legendary-gl`, {
			stdio: "pipe",
		})
		.then((text) => {
			const line = text
				.toString()
				.split("\n")
				.find((line) => line.includes("Location:"));
			if (!line) return;
			const packagesPath = line.split("Location: ")[1];

			legendaryPath =
				packagesPath.split("\\").slice(0, -2).join("\\") +
				"\\scripts\\legendary.exe";
		});

	cacheObj.legendaryPath = legendaryPath;
	return legendaryPath;
};
