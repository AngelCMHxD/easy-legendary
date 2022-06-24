module.exports = async () => {
	let games = await require("../utils/getOwnedGames")();
	console.log(games);
};
