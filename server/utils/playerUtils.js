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

  static async removePlayerFromGames(socketId) {
    console.log(
      `Attempting to remove all player records with socketId = ${socketId}`
    );
    await playerModel.deleteMany({ socketId: socketId });
  }
}

module.exports = PlayerUtils;
