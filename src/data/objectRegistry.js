export const objectRegistry = {
  ground: {
    factory: 'createStaticSprite',
    entityType: null,
  },

  platform: {
    factory: 'createStaticSprite',
    entityType: null,
  },

  spriteFrame: {
    factory: 'createImage',
    entityType: null,
  },

  image: {
    factory: 'createImage',
    entityType: null,
  },

  possessableBox: {
    factory: 'createPossessableBox',
    entityType: 'possessables',
  },

  gate: {
    factory: 'createGate',
    entityType: 'gates',
  },

  pressurePlate: {
    factory: 'createPressurePlate',
    entityType: 'pressurePlates',
  },

  playerSpawn: {
    factory: 'createPlayerSpawn',
    entityType: null,
  },

  loadingZone: {
    factory: 'createLoadingZone',
    entityType: 'loadingZones',
  },
}
