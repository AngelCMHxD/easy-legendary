const cp = require("child_process");
const Locale = require("../locale");

module.exports = async () => {
	let legendaryPath = cacheObj.legendaryPath;
	if (legendaryPath) return legendaryPath;

	const text = await cp.execSync(`pip show legendary-gl`, {
		stdio: "pipe",
	});

	const line = text
		.toString()
		.split("\n")
		.find((line) => line.includes("Location:"));
	if (!line) return;
	const packagesPath = line.split("Location: ")[1];

	legendaryPath =
		packagesPath.split("\\").slice(0, -2).join("\\") +
		"\\scripts\\legendary.exe";

	cacheObj.legendaryPath = legendaryPath;
	return legendaryPath;
};
