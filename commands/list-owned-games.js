module.exports = async () => {
	const games = await require("../utils/getOwnedGames")();
	console.log(games);
};
