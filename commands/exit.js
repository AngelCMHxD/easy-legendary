module.exports = async () => {
	console.log("Saving cache...");
	await writeCache();
	console.log("Goodbye! o7");
	process.exit(1);
};
