import Box from '../gameObjects/Box.js'
import Gate from '../gameObjects/Gate.js'
import PressurePlate from '../gameObjects/PressurePlate.js'

export default class RoomRenderer {

    constructor(scene) {
        this.scene = scene
        this.groups = {}
        this.collisionObjects = []
        this.collisionRules = {}
        this.entities = {
            possessables: [],
            gates: [],
            pressurePlates: []
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
            pressurePlate: this.createPressurePlate.bind(this)
        }
    }

    render(roomData) {
        if(!roomData?.objects) {
            return {
                groups: this.groups,
                entities: this.entities,
                playerSpawn: null
            }
        }

        console.log(roomData.objects.filter(o => o.type === 'gate' || o.type === 'pressurePlate'))

        roomData.objects.forEach(obj => {
            let factoryType = obj.type
            if(factoryType.includes('-')) {
                factoryType = factoryType.slice(0, factoryType.indexOf('-')) + factoryType.slice(factoryType.indexOf('-')+1, factoryType.length)
            }

            const factory = this.factories[factoryType]

            if(!factory) {
                console.warn(`No factory for type: ${obj.type}`)
                return
            }
            
            factory(obj)
        })

        return {
            groups: this.groups,
            entities: this.entities,
            playerSpawn: this.playerSpawn ?? null,
            collisionRules: this.collisionRules,
            collisionObjects: this.collisionObjects,
            createdObjects: this.createdObjects
        }
    }
    
    getGroup(name, type = 'static') {
        if(this.groups[name]) return this.groups[name]

        this.groups[name] = 
            type === 'static'
                ? this.scene.physics.add.staticGroup()
                : this.scene.physics.add.group()

        return this.groups[name]
    }

    registerCollisionObject(gameObject, obj) {
        gameObject.roomData = obj
        gameObject.editorData = { ...obj }

        this.collisionObjects.push({
            object: gameObject,
            collidesWith: obj.collidesWith ?? [],
            overlapsWith: obj.overlapsWith ?? []
        })

        return gameObject
    }

    createStaticSprite(obj) {
        const groupName = obj.group ?? obj.type
        const group = this.getGroup(groupName, 'static')

        this.collisionRules[groupName] ??= new Set()

        for (const target of obj.collidesWith ?? []) {
            this.collisionRules[groupName].add(target)
        }

        const item = group.create(
            obj.x,
            obj.y,
            obj.texture,
            obj.frame ?? undefined
        )

        item.setOrigin(0, 0)
        item.setScale(obj.scale ?? 1)
        item.refreshBody()

        item.roomData = obj
        item.editorData = { ...obj }
        this.createdObjects.push(item)

        return item
    }

    createImage(obj) {
        const image = this.scene.add.image(
            obj.x,
            obj.y,
            obj.texture,
            obj.frame ?? undefined
        )

        image.setOrigin(obj.originX ?? 0, obj.originY ?? 0)
        image.setScale(obj.scale ?? 1)

        image.roomData = obj
        image.editorData = { ...obj }
        this.createdObjects.push(image)

        return image
    }

    createPlayerSpawn(obj) {
        this.playerSpawn = {
            x: obj.x,
            y: obj.y
        }
    
        return this.playerSpawn
    }

    createPossessableBox(obj) {
        const box = new Box(this.scene, obj.x, obj.y, {
            width: obj.width ?? 24,
            height: obj.height ?? 40,
            color: obj.color ?? 0x000000,
            speed: obj.speed ?? 200,
            jumpVelocity: obj.jumpVelocity ?? -350,
            gravityY: obj.gravityY ?? 800
        })
    
        box.editorData = { ...obj }
        this.entities.possessables.push(box)
        this.createdObjects.push(box)
    
        return box
    }
    
    createGate(obj) {
        const gate = new Gate(this.scene, obj.x, obj.y, {
            key: obj.key,
            width: obj.width ?? 48,
            height: obj.height ?? 96,
            color: obj.color ?? 0x88ffff,
            isOpen: obj.isOpen ?? false
        })
    
        this.entities.gates.push(gate)
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
            pressDepth: obj.pressDepth ?? 8
        })
    
        this.entities.pressurePlates.push(plate)
        this.createdObjects.push(plate)
        this.registerCollisionObject(plate, obj)
    
        return plate
    }
}