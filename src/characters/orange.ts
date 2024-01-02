import Phaser from "phaser";

declare global {
	namespace Phaser.GameObjects {
		interface GameObjectFactory {
			orange(x: number, y: number, texture: string, frame?: string | number): OrangeGhost
		}
	}
}

export default class OrangeGhost extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame);
  }
}

Phaser.GameObjects.GameObjectFactory.register('orange', function (this: Phaser.GameObjects.GameObjectFactory, x: number, y: number, texture: string, frame?: string | number) {
	var sprite = new OrangeGhost(this.scene, x, y, texture, frame)

	this.displayList.add(sprite)
	this.updateList.add(sprite)

	this.scene.physics.world.enableBody(sprite, Phaser.Physics.Arcade.DYNAMIC_BODY)

	sprite.body?.setSize(12, 12)

	return sprite
})