import Box from '../../gameObjects/Box.js'
import Gate from '../../gameObjects/Gate.js'
import PressurePlate from '../../gameObjects/PressurePlate.js'
import LoadingZone from '../../gameObjects/LoadingZone.js'
import { objectRegistry } from '../../data/objectRegistry.js'

export default class RoomRenderer {
  constructor(scene) {
    this.scene = scene
    this.groups = {}
    this.collisionObjects = []
    this.collisionRules = {}
    this.entities = {
      possessables: [],
      gates: [],
      pressurePlates: [],
      loadingZones: [],
    }
    this.createdObjects = []
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
      return { groups: this.groups, entities: this.entities, playerSpawn: null }
    }

    if (roomData.playerSpawn && offsetX === 0 && offsetY === 0) {
      this.createPlayerSpawn(roomData.playerSpawn)
    }

    console.log('Rendering room with data: ', roomData)

    roomData.objects.forEach((obj) => {
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

      const created = factory.call(this, objectWithOffset, typeConfig)

      if (typeConfig.entityType && created) {
        this.entities[typeConfig.entityType] ??= []
        this.entities[typeConfig.entityType].push(created)
      }
    })

    return {
      groups: this.groups,
      entities: this.entities,
      playerSpawn: this.playerSpawn ?? null,
      collisionRules: this.collisionRules,
      collisionObjects: this.collisionObjects,
      createdObjects: this.createdObjects,
    }
  }

  getGroup(name, type = 'static') {
    if (this.groups[name]) return this.groups[name]

    this.groups[name] =
      type === 'static' ? this.scene.physics.add.staticGroup() : this.scene.physics.add.group()

    return this.groups[name]
  }

  registerCollisionObject(gameObject, obj) {
    gameObject.roomData = obj
    gameObject.editorData = { ...obj }

    this.collisionObjects.push({
      object: gameObject,
      collidesWith: obj.collidesWith ?? [],
      overlapsWith: obj.overlapsWith ?? [],
    })

    return gameObject
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

  createStaticSprite(obj) {
    const groupName = obj.group ?? obj.type
    const group = this.getGroup(groupName, 'static')

    this.collisionRules[groupName] ??= new Set()

    for (const target of obj.collidesWith ?? []) {
      this.collisionRules[groupName].add(target)
    }

    const item = group.create(obj.x, obj.y, obj.texture, obj.frame ?? undefined)

    item.setOrigin(0, 0)
    item.setScale(obj.scale ?? 1)
    item.refreshBody()

    item.roomData = obj
    item.editorData = { ...obj }
    this.createdObjects.push(item)

    return item
  }

  createImage(obj) {
    const image = this.scene.add.image(obj.x, obj.y, obj.texture, obj.frame ?? undefined)

    image.setOrigin(obj.originX ?? 0, obj.originY ?? 0)
    image.setScale(obj.scale ?? 1)

    image.roomData = obj
    image.editorData = { ...obj }
    this.createdObjects.push(image)

    return image
  }

  createPossessableBox(obj) {
    const box = new Box(this.scene, obj.x, obj.y, {
      width: obj.width ?? 24,
      height: obj.height ?? 40,
      color: obj.color ?? 0x000000,
      speed: obj.speed ?? 200,
      jumpVelocity: obj.jumpVelocity ?? -350,
      gravityY: obj.gravityY ?? 800,
    })

    this.createdObjects.push(box)
    this.registerCollisionObject(box, obj)

    return box
  }

  createGate(obj) {
    const gate = new Gate(this.scene, obj.x, obj.y, {
      key: obj.key,
      width: obj.width ?? 48,
      height: obj.height ?? 96,
      color: obj.color ?? 0x88ffff,
      isOpen: obj.isOpen ?? false,
    })

    this.createdObjects.push(gate)
    this.registerCollisionObject(gate, obj)

    return gate
  }

  createPressurePlate(obj) {
    const plate = new PressurePlate(this.scene, obj.x, obj.y, {
      key: obj.key,
      targetGate: obj.targetGate,
      width: obj.width ?? 48,
      height: obj.height ?? 12,
      color: obj.color ?? 0xf00000,
      pressDepth: obj.pressDepth ?? 8,
    })

    this.createdObjects.push(plate)
    this.registerCollisionObject(plate, obj)

    return plate
  }

  createLoadingZone(obj) {
    const zone = new LoadingZone(this.scene, obj.x, obj.y, {
      width: obj.width ?? 96,
      height: obj.height ?? 720,
      color: obj.color ?? 0xff88ff,
      targetRoom: obj.targetRoom,
      direction: obj.direction ?? 'right',
      offsetX: obj.offsetX ?? 0,
      offsetY: obj.offsetY ?? 0,
    })

    zone.editorData = { ...obj }
    this.createdObjects.push(zone)

    return zone
  }
}
