export default class RoomTransitionController {
  constructor({ player, roomWidth, nextRoomLeft, nextRoomRight, startScene }) {
    this.player = player
    this.roomWidth = roomWidth
    this.nextRoomLeft = nextRoomLeft
    this.nextRoomRight = nextRoomRight
    this.startScene = startScene
  }

  moveRoom() {
    if (this.player.x + 72 >= this.roomWidth && this.nextRoomRight) {
      this.startScene(this.nextRoomRight, { spawnX: 80, spawnY: this.player.y })
      return true
    } else if (this.player.x - 72 <= 0 && this.nextRoomLeft) {
      this.startScene(this.nextRoomLeft, { spawnX: this.roomWidth - 80, spawnY: this.player.y })
      return true
    }
    return false
  }
}
