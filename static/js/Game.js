// Game stats
class Stats{
  constructor(at,hp,name){
    this.at = at
    this.hp = hp
    this.name = name
  }
}

class Weapon extends Stats{
  constructor(at,hp,name){
    super(at,hp,name)
  }
}

class PlayerStats extends Stats{
  constructor(at,hp,name,weapon){
    super(at,hp,name)
    this.weapon = weapon
  }

  attack(enemy){
    if (Math.random() * 100 <= 10){
      enemy.hp -= (this.at + this.weapon.at) * 2
    }
    else{
      enemy.hp -= this.at + this.weapon.at
    }
  }

  damage(enemy){
    // Crit Calc
    if (Math.random() * 100 <= 10){
      this.hp -= enemy.at * 1.5
    }
    else{
      this.hp -= enemy.at
    }
  }

  checkdead(){
    return this.hp <= 0
  }
}

class EnemyStats extends Stats{
  constructor(at,hp,weak){
    super(at,hp)
    this.weak = weak
  }
}

// Game stats setup
const player = new PlayerStats(0,0,0,"",null)

// Scenes Setup
class SceneStruct extends Phaser.Scene{
  constructor(key){
    super({key: key})
  }

  keysSetUp(){
    this.keyW = this.input.keyboard.addKey(87)
    this.keyS = this.input.keyboard.addKey(83)
    this.keyD = this.input.keyboard.addKey(68)
    this.keyA = this.input.keyboard.addKey(65)
    this.keyB = this.input.keyboard.addKey(66)
    this.keySpace = this.input.keyboard.addKey(32)
    this.keyEsc = this.input.keyboard.addKey(27)
    this.keyI = this.input.keyboard.addKey(73)
    this.keyJ = this.input.keyboard.addKey(74)
  }
}

//Opening Menu
class StartScene extends SceneStruct{
  constructor(){
    super("StartScene")
  }
  preload(){
    this.load.image('startscreen', 'static/gameFiles/startscreen.png')
  }

  create(){
    this.keysSetUp();
    this.startscreen = this.add.image(400, 300, 'startscreen').setInteractive()
    this.startscreen.on('pointerdown', function (pointer){
      this.setTint(0xADD8E6);
    });
    this.startscreen.on('pointerout', function (pointer){
      this.clearTint();
    });
    this.startscreen.on('pointerup', function (pointer){
      this.clearTint();
      this.scene.scene.start("GameScene")
    });
  }
}

//Game Scene
class GameScene extends SceneStruct{
  constructor(){
    super("GameScene")
  }

  mapSetup(){
    this.map = this.make.tilemap({ key: 'map' });
    this.tileset = this.map.addTilesetImage('tileset', 'tileset');
    
    this.background = this.map.createLayer('background', this.tileset,0,0);
    this.background.setCollisionByProperty({ water: true });

    this.terrain = this.map.createLayer('terrain', this.tileset,0,0);
    this.terrain.setCollisionByProperty({ collides: true });

    this.chars = this.map.createLayer('chars', this.tileset,0,0);
    this.chars.setCollisionByProperty({ collides: true });
    console.log("map setup")
  }
  
  levelSetup(){
    this.mapSetup()
    this.menu = new Menu(this,700,300,"menu")
    this.menu.setVisible(false)
    this.player = new Player(this,48,80,"mc")
    this.player.setDepth(1000)
    this.sound.add('boop')
  }
  
  cameraSetup(){
    const camera = this.cameras.main;
    camera.setZoom(1.5);
    camera.startFollow(this.player);
    camera.setBounds(0, 0, 1280, 960);
  }

  preload(){
    this.load.spritesheet('mc', 'static/gameFiles/mc.png', {
      frameWidth: 64,
      frameHeight: 112
    });
    this.load.image('tileset', 'Tiled/Spritesheetv2.png');
    this.load.tilemapTiledJSON('map', 'static/gameFiles/background.json');
    this.load.image('menu', 'static/gameFiles/menu.png');
    this.load.image('weaponbutton', 'static/gameFiles/weaponbutton.png');
    this.load.audio('boop', 'static/gameFiles/boop.mp3')
    this.load.audio('bing', 'static/gameFiles/bing.mp3')
  }

  fogOfWarSetup(){
    // light fog of war
    this.fogOfWar = this.make.graphics().fillStyle(0x000000).fillRect(0, 0, 1, 960).setAlpha(0.5);
    this.fogOfWar.setScrollFactor(0);
    this.fogOfWar.setDepth(1000);
    this.fogOfWar.setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.add.existing(this.fogOfWar);
  }

  create(){
    // this.physics.world.drawDebug = true;
    this.levelSetup()
    this.keysSetUp();
    this.cameraSetup()
    this.fogOfWarSetup()
  }

  update(){
    this.player.update()
  }
}

// Weapon Scene
class WeaponScene extends SceneStruct{
  constructor(){
    super("WeaponScene")
  }
  preload(){
    this.load.image('weaponbg', 'static/gameFiles/weaponbg.png');
  }
  create(){
    this.keysSetUp();
    this.weaponbg = this.add.image(400, 300, 'weaponbg')
    this.weaponpic = this.add.image(400, 300, weapon.image)
    console.log("weapon setup")
  }
  update(){
    if (this.keyEsc.isDown){
      console.log("escape")
      this.scene.start("GameScene")
    }
  }
}

// Sprites
// Menu
class Menu extends Phaser.GameObjects.Sprite{
  constructor(scene, x, y, texture){
    super(scene, x, y, texture)
    // Make sure the menu does not move when the camera moves
    this.setScrollFactor(0)
    this.weaponbutton = new Button(this.scene, 32+600+24+64+24, 32+100, 'weaponbutton', "WeaponScene")

  }

  MenuSetUp(){
    this.setInteractive()
    this.scene.add.existing(this)
    this.setDepth(1000)
    this.scene.add.existing(this.weaponbutton).setInteractive()
  }

}

class Button extends Phaser.GameObjects.Sprite{
  constructor(scene, x, y, texture, sceneToStart){
    super(scene, x, y, texture)
    // Make sure the button does not move when the camera moves
    this.setScrollFactor(0)
    this.setDepth(1000)
    this.on('pointerdown', function (pointer){
      this.setTint(0xADD8E6);
    });

    this.on('pointerout', function (pointer){
      this.clearTint();
    });

    this.on('pointerup', function (pointer){
      this.clearTint();
      this.setInteractive(false)
      this.scene.scene.start(sceneToStart)
    });
  }
}

// Enemy
class Enemy extends Phaser.Physics.Arcade.Sprite{
  constructor(scene,x,y,spriteKey){
    super(scene,x,y,spriteKey)
    //initiliase any properties of the enemy here
    this.initPhysics()
  }

  initPhysics(){
    //initiliase the physics of the character (drag, etc.)
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    this.scene.physics.add.collider(this, this.scene.background);
    this.scene.physics.add.collider(this, this.scene.chars);
  }
  update(){
    // Enemy movements
    
  }
}

// Player
class Player extends Phaser.Physics.Arcade.Sprite
{
  constructor(scene,x,y,spriteKey){
    super(scene,x,y,spriteKey)
    //initiliase any properties of the player here
    this.initPhysics()
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('mc', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('mc', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('mc', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('mc', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
  }

  initPhysics(){
	//initiliase the physics of the character (drag, etc.)
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    this.scene.physics.add.collider(this, this.scene.terrain, () => {
      if (!this.soundTimer || this.soundTimer.getProgress() === 1) {
        // Play the sound
        this.scene.sound.play('boop');
  
        // Set up a timer for 2 seconds
        this.soundTimer = this.scene.time.delayedCall(1000, () => {
          // Reset the timer when it's done
          this.soundTimer = null;
        });
      }
    });
    this.scene.physics.add.collider(this, this.scene.background);
    this.scene.physics.add.collider(this, this.scene.chars);
  }

  update(){
    const speed = 200
    const prevVelocity = this.body.velocity.clone();

    this.setVelocity(0)

    if (this.scene.keyA.isDown){
      this.setVelocityX(-speed)
      console.log("left")
    }
    else if (this.scene.keyD.isDown){
      this.setVelocityX(speed)
      console.log("right")
    }
    if (this.scene.keyW.isDown){
      this.setVelocityY(-speed)
      console.log("up")
    }
    else if (this.scene.keyS.isDown){
      this.setVelocityY(speed)
      console.log("down")
    }

    this.body.velocity.normalize().scale(speed);

    if (this.scene.keyA.isDown){
      this.anims.play('left', true);
    }
    else if (this.scene.keyD.isDown){
      this.anims.play('right', true);
    }
    else if (this.scene.keyW.isDown){
      this.anims.play('up', true);
    }
    else if (this.scene.keyS.isDown){
      this.anims.play('down', true);
    }
    else {
      this.anims.stop();
      if (prevVelocity.x < 0) this.setTexture('mc', 15) // move left
      else if (prevVelocity.x > 0) this.setTexture('mc', 5) // move right
      else if (prevVelocity.y < 0) this.setTexture('mc', 10) // move up
      else if (prevVelocity.y > 0) this.setTexture('mc', 0) // move down
      if (this.scene.keyEsc.isDown){
        console.log("enter")
        if (this.scene.menu.visible == false){
          this.scene.sound.play('bing')
        }
        this.scene.menu.setVisible(true)
        this.scene.menu.weaponbutton.setVisible(true)
        this.scene.menu.MenuSetUp()
      }
      if (this.scene.keyEsc.isDown && this.scene.menu){
        this.scene.menu.setVisible(false)
        this.scene.menu.weaponbutton.setInteractive(false)
        this.scene.menu.weaponbutton.setVisible(false)
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 1600, 
  height: 900,
  fps:60,
  backgroundColor: 0x000000,
  pixelArt:true,
  physics: {
		default: 'arcade',
		fps:60,
    arcade: {
      debug: true,
    }
	},
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene:[StartScene, GameScene, WeaponScene],
  autoCenter:true,
}
  
var game = new Phaser.Game(config);