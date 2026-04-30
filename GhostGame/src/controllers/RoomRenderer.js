export default class RoomRenderer {

    constructor(scene) {
        this.scene = scene
        this.groups = {}
        this.factories = {
            platform: this.createStaticSprite.bind(this),
            image: this.createImage.bind(this)
        }
        console.log("now rendering " + this.scene.roomKey)
    }

    render(roomData) {
        if(!`assets/rooms/${this.roomKey}.json`) return
        roomData.objects.forEach(obj => {
            console.log(JSON.stringify(obj))
            const factory = this.factories[obj.type]

            if(!factory) {
                console.warn(`No factory for type: ${obj.type}`)
                return
            }
            
            factory(obj)
        })
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
        const group = this.getGroup(obj.group ?? obj.type, 'static')

        const item = group.create(
            obj.x,
            obj.y,
            obj.texture,
            obj.frame ?? undefined
        )

        item.setOrigin(0, 0)
        item.setScale(obj.scale ?? 1)
        item.refreshBody()

        return item
    }

    createImage(obj) {
        console.log(JSON.stringify(obj))
        const image = this.scene.add.image(
            obj.x,
            obj.y,
            obj.texture,
            obj.frame
        )

        image.setScale(obj.scale ?? 1)
    }
}