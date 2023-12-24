// Game stats
class Stats{
  constructor(at,hp,name){
    this.at = at
    this.hp = hp
    this.name = name
  }
}

class WeaponStats extends Stats{
  constructor(at,hp,name){
    super(at,hp,name)
  }
}

class PlayerStats extends Stats{
  constructor(at,hp,name,weapon,skill){
    super(at,hp,name)
    this.weapon = weapon
    this.skill = skill
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


    this.terrain.shuffle(-16, 0, 1000, 1000)
    console.log('Randomized tiles!');
    // change collision information
    this.terrain.setCollisionByProperty({ collides: true });


    this.chars = this.map.createLayer('chars', this.tileset,0,0);
    this.chars.setCollisionByProperty({ collides: true });
    console.log("map setup")
  }
  
  levelSetup(){
    this.mapSetup()
    this.menu = new Menu(this,700,300,"menu")
    this.menu.setVisible(false)
    this.player = new Player(this,32,66,"mc")
    this.player.setDepth(1000)
    this.sound.add('boop')
    this.sound.add('bing')
    this.foggyplains = this.sound.add('foggyplains')
    this.foggyplains.setLoop(true)
    this.foggyplains.play()
  }
  
  cameraSetup(){
    const camera = this.cameras.main;
    camera.setZoom(1.5);
    camera.startFollow(this.player);
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
  }

  preload(){
    this.load.spritesheet('mc', 'static/gameFiles/mc.png', {
      frameWidth: 64,
      frameHeight: 112
    });
    this.load.spritesheet('marms', 'static/gameFiles/marms.png', {
      frameWidth: 240,
      frameHeight: 192
    });
    this.load.image('tileset', 'Tiled/Spritesheetv2.png');
    this.load.tilemapTiledJSON('map', 'static/gameFiles/background.json');
    this.load.image('menu', 'static/gameFiles/menu.png');
    this.load.image('weaponbutton', 'static/gameFiles/weaponbutton.png');
    this.load.audio('boop', 'static/gameFiles/boop.mp3')
    this.load.audio('bing', 'static/gameFiles/bing.mp3')
    this.load.image('vision', 'static/gameFiles/vision.png')
    this.load.image('fog', 'static/gameFiles/fog.png')
    this.load.audio('foggyplains', 'static/gameFiles/foggyplains.mp3')
    this.load.image('weapon', 'static/gameFiles/weapon.png')
  }

  fogOfWarSetup(){
    // the width and height of map
    const width = 5000
    const height = 5000

    // make a RenderTexture that is the size of the screen
    this.rt = this.make.renderTexture({
      x: 0,
      y: 0,
      width,
      height
    }, true)


    // add rendertexture
    // this.add.renderTexture(this.rt)

    // fill it with black
    // this.rt.fill(0x000000, 1)

    // draw the floorLayer into it
    this.rt.draw(this.background, 0, 0)
    this.rt.draw(this.terrain, 0, 0)

    // // draw fog of war
    // this.rt.draw('fogofwar', 0, 0)

    // // set a light blue tint
    // // this.rt.setTint(0x0a2948)
    
    // Create a list of fog sprites
    this.foglist = []
    for (var j=0; j<50; j++){
      this.foglist.push([])
      for (var i=0; i<20; i++){
        // random value x and y for fog placement
        var x = Math.random() * 100
        var y = Math.random() * 100

        var fog = new Fog(this,i*295-100+x,j*24-80+y,'fog').setOrigin(0,0)
        this.foglist[j].push(fog)
        this.foglist[j][i].setAlpha(0.95)
        this.foglist[j][i].setDepth(998)
        this.add.existing(this.foglist[j][i])
      }
    }
    this.rt.setDepth(999)

    this.vision = this.make.image({
      x: this.player.x,
      y: this.player.y,
      key: 'vision',
      add: false
    })
    this.vision.scale = 1.5
  
    this.rt.mask = new Phaser.Display.Masks.BitmapMask(this, this.vision)

    console.log("fog of war setup")
  }

  create(){
    // this.physics.world.drawDebug = true;
    this.levelSetup()
    this.keysSetUp();
    this.cameraSetup()

    this.testenemy = new Enemy(this, 900, 100, "marms")

    this.fogOfWarSetup()
  }

  update(){
    this.player.update()
    
    if (this.testenemy){
      this.testenemy.update()
    }

    for (var j=0; j<50; j++){
      for (var i=0; i<20; i++){
        this.foglist[j][i].update()
      }
    }

    //  Every time you click, shake the camera
    this.input.on('pointerdown', function () {
      this.cameras.main.flash();
    }, this);

    if (this.vision){
      this.vision.x = this.player.x
      this.vision.y = this.player.y
    }

    if (this.keyI.isDown){
        {
            // Randomize the tiles within an area using the indexes that are there already
            this.terrain.shuffle(-16, 0, 1000, 1000)
            console.log('Randomized tiles!');

            this.terrain.destroy();
            this.terrain = this.map.createLayer('terrain', this.tileset, 0, 0);

            // change collision information
            this.terrain.setCollisionByProperty({ collides: true });
        }
    }
  }
}

// Sprites
// Fog
class Fog extends Phaser.Physics.Arcade.Sprite{
  constructor(scene,x,y,spriteKey){
    super(scene,x,y,spriteKey)
    //initiliase any properties of the enemy here
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.velocityX = Math.random() * 100
  }

  update(){
    this.setVelocityX(this.velocityX);

    // delete and replace if out of camera
    if (this.x > 5000){
      this.x = -320
    }
    
  }

}

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
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('marms', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('marms', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('marms', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('marms', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.setDepth(1000)
  }

  initPhysics(){
    //initiliase the physics of the character (drag, etc.)
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    this.scene.physics.add.collider(this, this.scene.background);
    this.scene.physics.add.collider(this, this.scene.chars);
    this.scene.physics.add.collider(this, this.scene.player);
    this.scene.physics.add.collider(this, this.scene.terrain) 
  }
  update(){
    // Enemy movements: move slowly towards the player
    const speed = 100;
    const player = this.scene.player;

    //check distance is between player and enemy is close enough
    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    var prevVelocity = this.body.velocity.clone();
    if (prevVelocity.x < 0) this.anims.play('left', true);
    else if (prevVelocity.x > 0) this.anims.play('right', true);
    else if (prevVelocity.y < 0) this.anims.play('up', true);
    else if (prevVelocity.y > 0) this.anims.play('down', true);

    if (distance > 918){
      this.setVelocityX(0);
      this.setVelocityY(0);
    }
    else {
      const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      const velocityX = Math.cos(angleToPlayer) * speed;
      const velocityY = Math.sin(angleToPlayer) * speed;
      this.setVelocityX(velocityX);
      this.setVelocityY(velocityY);
    }

    // Enemy animations
    prevVelocity = this.body.velocity.clone();
    this.body.velocity.normalize().scale(speed);
    if (prevVelocity.x < 0) this.anims.play('left', true);
    else if (prevVelocity.x > 0) this.anims.play('right', true);
    else if (prevVelocity.y < 0) this.anims.play('up', true);
    else if (prevVelocity.y > 0) this.anims.play('down', true);
    else this.anims.stop();
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
      this.direction = "left"
    }
    else if (this.scene.keyD.isDown){
      this.setVelocityX(speed)
      this.direction = "right"
    }
    if (this.scene.keyW.isDown){
      this.setVelocityY(-speed)
      this.direction = "up"
    }
    else if (this.scene.keyS.isDown){
      this.setVelocityY(speed)
      this.direction = "down"
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
      if (prevVelocity.x < 0) this.setTexture('mc', 0) // move left
      else if (prevVelocity.x > 0) this.setTexture('mc', 0) // move right
      else if (prevVelocity.y < 0) this.setTexture('mc', 0) // move up
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

    if (this.scene.keyJ.isDown){
      // create a rectangle sprite for the weapon
      this.weapon = new Weapon(this.scene,this.x,this.y,"weapon")
      this.weapon.setDepth(999)
      this.scene.physics.add.existing(this.weapon)
      this.scene.physics.add.collider(this.weapon, this.scene.terrain, () => {
        this.weapon.destroy()
      });
    }
  }
}

// Weapon
class Weapon extends Phaser.Physics.Arcade.Sprite{
  constructor(scene,x,y,spriteKey){
    super(scene,x,y,spriteKey)
    //initiliase any properties of the weapon here
    this.initPhysics()
  }

  initPhysics(){
    //initiliase the physics of the character (drag, etc.)
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    this.scene.physics.add.collider(this, this.scene.terrain, () => {
      this.destroy()
    });
    this.scene.physics.add.collider(this, this.scene.background);
    this.scene.physics.add.collider(this, this.scene.chars);
    this.scene.physics.add.collider(this, this.scene.player);
    this.scene.physics.add.collider(this, this.scene.terrain)
    this.scene.physics.add.collider(this, this.scene.testenemy, () => {
      // disable weapon and enemy
      this.destroy()
      this.scene.testenemy.destroy()
    });

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
      // debug: true,
    }
	},
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene:[StartScene, GameScene],
  autoCenter:true,
}
  
var game = new Phaser.Game(config);