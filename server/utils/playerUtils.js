const models = require("../../models");
const playerModel = models.playerModel;

class PlayerUtils {
  static getPlayerModelFromMap(playerData) {
    return new playerModel({
      playerId: playerData.playerId,
      hostId: playerData.hostId,
      socketId: playerData.socketId,
      name: playerData.name,
      gamePin: playerData.gamePin,
    });
  }

  static async getPlayerBySocketId(socketId) {
    let player = await playerModel.findOne({ socketId: socketId }).exec();
    return player;
  }

  static async removeOtherPlayersWithPlayerId(playerId) {
    await playerModel.deleteMany({ playerId: playerId });
  }

  static async removePlayerFromGames(socketId) {
    await playerModel.deleteMany({ socketId: socketId });
  }

  static async getAllPlayersFromGame(gamePin) {
    let players = await playerModel.find({ gamePin: gamePin }).exec();
    return players;
  }

  static async increasePlayerScore(playerId, scoreIncrease) {
    return await playerModel.findOneAndUpdate(
      { playerId: playerId },
      { $inc: { score: scoreIncrease } }
    );
  }

  static async getLeaderBoardForGame(gamePin) {
    let players = await playerModel
      .find({ gamePin: gamePin })
      .sort({ score: -1 })
      .exec();
    return players;
  }
}

module.exports = PlayerUtils;
