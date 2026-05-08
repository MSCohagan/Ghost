export default class RoomStreamingController {
  constructor(scene, entities = {}) {
    this.scene = scene
    this.targetRoom = null
    this.inLoadingZone = false
    this.loadingZones = entities.loadingZones ?? []
    this.possessables = entities.possessables ?? []

    this.setupLoadingZoneEvents()
  }

  setupLoadingZoneEvents() {
    console.log('Setting up loading zone events')
    console.log('loadingZones = ', this.loadingZones)
    this.loadingZones.forEach((zone) => {
      zone.on('enteredLoadingZone', (zone) => {
        this.inLoadingZone = true
        this.targetRoom = zone.targetRoom
        console.log(`Entered loading zone for room: ${zone.targetRoom}`)
      })

      zone.on('exitedLoadingZone', () => {
        this.inLoadingZone = false
        this.targetRoom = null
        console.log('Exited loading zone')
      })
    })
  }

  update() {
    this.loadingZones.forEach((zone) => {
      if (
        this.scene.physics.overlap(this.scene.player, zone) ||
        this.possessables.some((obj) => this.scene.physics.overlap(obj, zone))
      ) {
        zone.enterLoadingZone()
      } else {
        zone.exitLoadingZone()
      }
    })
  }
}
