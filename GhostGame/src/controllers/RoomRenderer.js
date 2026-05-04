import Box from '../gameObjects/Box.js'

export default class RoomRenderer {

    constructor(scene) {
        this.scene = scene
        this.groups = {}
        this.collisionRules = {}
        this.entities = {
            possessables: [],
            gates: [],
            pressurePlates: []
        }
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
            collisionRules: this.collisionRules
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

        return image
    }

    createPossessableBox(obj) {
        const box = new Box(this.scene, obj.x, obj.y, {
            width: 24,
            height: 40,
            color: 0x000000,
            speed: 200,
            jumpVelocity: -350,
            gravityY: 800,
        })

        this.entities.possessables.push(box)
        
        return box
    }

    createPlayerSpawn(obj) {
        this.playerSpawn = {
            obj: obj.x,
            obj: obj.y
        }

        return this.playerSpawn
    }

    createGate(obj) {
        console.log(obj)
    }

    createPressurePlate(obj) {
        console.log(obj)
    }
}