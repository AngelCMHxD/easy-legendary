module.exports = async () => {
	const games = await require("../utils/getInstalledGames")();
	console.log(games);
};
