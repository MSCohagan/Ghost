export const objectContractRules = {
  gate: {
    requiresId: true,
    referencesTargets: false,
  },

  pressurePlate: {
    requiresId: true,
    referencesTargets: true,
    targetField: 'targetIds', // legacy fallback handled in validator
    allowLegacyTargetField: 'targetGate',
  },

  loadingZone: {
    requiresId: true,
    referencesTargets: false,
    requiresFields: ['targetRoom'],
  },

  possessableBox: {
    requiresId: false, // flip to true later if boxes become direct graph nodes
    referencesTargets: false,
  },

  platform: {
    requiresId: false,
    referencesTargets: false,
  },

  ground: {
    requiresId: false,
    referencesTargets: false,
  },

  image: {
    requiresId: false,
    referencesTargets: false,
  },

  spriteFrame: {
    requiresId: false,
    referencesTargets: false,
  },

  playerSpawn: {
    requiresId: false,
    referencesTargets: false,
  },
}
