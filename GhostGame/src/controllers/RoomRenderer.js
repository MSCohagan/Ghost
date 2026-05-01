export default class RoomRenderer {

    constructor(scene) {
        this.scene = scene
        this.groups = {}
        this.entities = {
            possessables: [],
            gates: [],
            pressurePlates: []
        }
        this.factories = {
            platform: this.createStaticSprite.bind(this),
            spriteframe: this.createStaticSprite.bind(this),
            image: this.createImage.bind(this),
            possessableBox: this.createPossessableBox.bind(this),
            playerSpawn: this.createPlayerSpawn.bind(this),
            gate: this.createGate.bind(this),
            pressurePlates: this.createPressurePlates.bind(this)
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
            playerSpawn: this.playerSpawn ?? null
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
            obj.frame
        )

        image.setScale(obj.scale ?? 1)
    }

    createPossessableBox(obj) {
        console.log(obj)
    }

    createPlayerSpawn(obj) {
        console.log(obj)
    }

    createGate(obj) {
        console.log(obj)
    }

    createPressurePlates(obj) {
        console.log(obj)
    }
}