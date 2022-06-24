module.exports = async () => {
	let games = await require("../utils/getInstalledGames")();
	console.log(games);
};
