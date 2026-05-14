import Box from '@/gameObjects/Box.js'
import Gate from '@/gameObjects/Gate.js'
import PressurePlate from '@/gameObjects/PressurePlate.js'
import LoadingZone from '@/gameObjects/LoadingZone.js'
import { objectRegistry } from '@/data/objectRegistry.js'
import { objectContractRules } from '@/data/objectContractRules.js'

export default class RoomRenderer {
  constructor(scene) {
    this.scene = scene
    this.groups = {}
    this.factories = {
      platform: this.createStaticSprite.bind(this),
      ground: this.createStaticSprite.bind(this),
      spriteFrame: this.createImage.bind(this),
      image: this.createImage.bind(this),
      possessableBox: this.createPossessableBox.bind(this),
      playerSpawn: this.createPlayerSpawn.bind(this),
      gate: this.createGate.bind(this),
      pressurePlate: this.createPressurePlate.bind(this),
      loadingZones: this.createLoadingZone.bind(this),
    }
  }

  render(roomData, { offsetX = 0, offsetY = 0 } = {}) {
    if (!roomData) {
      return {
        groups: this.groups,
        entities: { possessables: [], gates: [], pressurePlates: [], loadingZones: [] },
        playerSpawn: null,
        collisionRules: {},
        collisionObjects: [],
        createdObjects: [],
      }
    }

    const entities = {
      possessables: [],
      gates: [],
      pressurePlates: [],
      loadingZones: [],
    }

    const collisionRules = {}
    const collisionObjects = []
    const createdObjects = []

    const registerCollisionObject = (gameObject, obj) => {
      gameObject.roomData = obj
      gameObject.editorData = { ...obj }

      collisionObjects.push({
        object: gameObject,
        collidesWith: obj.collidesWith ?? [],
        overlapsWith: obj.overlapsWith ?? [],
      })
    }

    const context = {
      createdObjects,
      collisionRules,
      registerCollisionObject,
    }

    if (roomData.playerSpawn && offsetX === 0 && offsetY === 0) {
      this.createPlayerSpawn(roomData.playerSpawn)
    }

    console.log('Rendering room with data: ', roomData)

    roomData.objects.forEach((obj) => {
      const rules = objectContractRules[obj.type]
      if (rules?.requiresId) {
        this.validateObjectContract(obj, rules)
      }
      const objectWithOffset = {
        ...obj,
        x: obj.x + offsetX,
        y: obj.y + offsetY,
      }

      const typeConfig = objectRegistry[obj.type]

      if (!typeConfig) {
        console.warn(`No registry entry for type: ${obj.type}`)
        return
      }

      const factory = this[typeConfig.factory]

      if (!factory) {
        console.warn(`No factory method: ${typeConfig.factory}`)
        return
      }

      const created = factory.call(this, objectWithOffset, context)

      if (typeConfig.entityType && created) {
        entities[typeConfig.entityType] ??= []
        entities[typeConfig.entityType].push(created)
      }
    })

    console.log(`[RoomRenderer] createdObjects length=${createdObjects.length}`)

    return {
      groups: this.groups,
      entities,
      playerSpawn: this.playerSpawn ?? null,
      collisionRules,
      collisionObjects,
      createdObjects,
    }
  }

  validateObjectContract(object, rules = {}) {
    if (!object) return
    if (rules.requiresId && !object.key) {
      console.warn('Object is missing key:', object)
      return
    }

    if (Array.isArray(rules.requiresFields)) {
      const missingFields = rules.requiresFields.filter((field) => !(field in object))
      if (missingFields.length > 0) {
        console.warn(`Object is missing required fields: ${missingFields.join(', ')}`, object)
        return
      }
    }

    if (rules.referencesTargets) {
      const primaryField = rules.targetField ?? 'targetIds'
      const legacyField = rules.allowLegacyTargetField

      const primaryTargets = Array.isArray(object[primaryField]) ? object[primaryField] : []
      const legacyTargets = legacyField && object[legacyField] ? [object[legacyField]] : []

      const targets = primaryTargets.length > 0 ? primaryTargets : legacyTargets

      if (targets.length === 0) {
        console.warn(
          `Object references targets but has no '${primaryField}' (or legacy fallback) values:`,
          object
        )
      }
    }
  }

  getGroup(name, type = 'static') {
    if (this.groups[name]) return this.groups[name]

    this.groups[name] =
      type === 'static' ? this.scene.physics.add.staticGroup() : this.scene.physics.add.group()

    return this.groups[name]
  }

  createPlayerSpawn(obj) {
    const spawn = this.scene.add.rectangle(
      obj.x,
      obj.y,
      obj.width ?? 24,
      obj.height ?? 40,
      Number(obj.color ?? 0x00ff00)
    )

    spawn.setOrigin(0, 0)
    spawn.setAlpha(0.5)
    spawn.setVisible(false)
    spawn.editorData = { ...obj }

    this.playerSpawn = {
      x: obj.x,
      y: obj.y,
      marker: spawn,
    }

    return spawn
  }

  createStaticSprite(obj, { createdObjects, collisionRules }) {
    const groupName = obj.group ?? obj.type
    const group = this.getGroup(groupName, 'static')

    collisionRules[groupName] ??= new Set()

    for (const target of obj.collidesWith ?? []) {
      collisionRules[groupName].add(target)
    }

    const item = group.create(obj.x, obj.y, obj.texture, obj.frame ?? undefined)

    item.setOrigin(0, 0)
    item.setScale(obj.scale ?? 1)
    item.refreshBody()

    item.roomData = obj
    item.editorData = { ...obj }
    createdObjects.push(item)

    return item
  }

  createImage(obj, { createdObjects }) {
    const image = this.scene.add.image(obj.x, obj.y, obj.texture, obj.frame ?? undefined)

    image.setOrigin(obj.originX ?? 0, obj.originY ?? 0)
    image.setScale(obj.scale ?? 1)

    image.roomData = obj
    image.editorData = { ...obj }
    createdObjects.push(image)

    return image
  }

  createPossessableBox(obj, { createdObjects, registerCollisionObject }) {
    const box = new Box(this.scene, obj.x, obj.y, {
      width: obj.width ?? 24,
      height: obj.height ?? 40,
      color: obj.color ?? 0x000000,
      speed: obj.speed ?? 200,
      jumpVelocity: obj.jumpVelocity ?? -350,
      gravityY: obj.gravityY ?? 800,
    })

    createdObjects.push(box)
    registerCollisionObject(box, obj)

    return box
  }

  createGate(obj, { createdObjects, registerCollisionObject }) {
    const gridSize = this.scene.gridSize ?? 48
    const gate = new Gate(this.scene, obj.x, obj.y, {
      key: obj.key,
      width: obj.width ?? gridSize,
      height: obj.height ?? gridSize * 2,
      color: obj.color ?? 0x88ffff,
      isOpen: obj.isOpen ?? false,
    })

    createdObjects.push(gate)
    registerCollisionObject(gate, obj)

    return gate
  }

  createPressurePlate(obj, { createdObjects, registerCollisionObject }) {
    const gridSize = this.scene.gridSize ?? 48
    const plate = new PressurePlate(this.scene, obj.x, obj.y, {
      key: obj.key,
      targetGate: obj.targetGate,
      width: obj.width ?? gridSize,
      height: obj.height ?? 12,
      color: obj.color ?? 0xf00000,
      pressDepth: obj.pressDepth ?? 8,
    })

    createdObjects.push(plate)
    registerCollisionObject(plate, obj)

    return plate
  }

  createLoadingZone(obj, { createdObjects }) {
    const gridSize = this.scene.gridSize ?? 48
    const zone = new LoadingZone(this.scene, obj.x, obj.y, {
      width: obj.width ?? gridSize * 2,
      height: obj.height ?? this.scene.roomHeight ?? 720,
      color: obj.color ?? 0xff88ff,
      targetRoom: obj.targetRoom,
      direction: obj.direction ?? 'right',
      offsetX: obj.offsetX ?? 0,
      offsetY: obj.offsetY ?? 0,
    })

    zone.editorData = { ...obj }
    createdObjects.push(zone)

    return zone
  }
}
