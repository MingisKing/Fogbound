let playerData = {
  playerName: "Player",
  tutorial: true,
  tutorial2: true,
  hp: 100,
  absorb: [],
  x: 0, y: 0
}

const saveFile = function(){
  localStorage.setItem('saveFile',JSON.stringify(playerData));
};

const loadFile = function(){
  var file = JSON.parse(localStorage.getItem('saveFile'));
  playerData = file;
  return file;
};

// Scenes Setup
//Opening Menu
class StartScene extends Phaser.Scene{
  constructor(){
    super("StartScene")
  }
  preload(){
    this.load.image('startscreen', 'static/gamefiles/startscreen.png')
    this.load.image('fog', 'static/gamefiles/fog.png')
  }

  create(){
    // Tint effect for the start screen
    this.startscreen = this.add.image(800, 450, 'startscreen').setInteractive()
    this.startscreen.on('pointerdown', function (pointer){
      this.setTint(0xADD8E6);
    });
    this.startscreen.on('pointerout', function (pointer){
      this.clearTint();
    });
    this.startscreen.on('pointerup', function (pointer){
      this.clearTint();
      while ((playername == null || playername == "") && playerData.tutorial) {
        var playername = prompt("Please enter your name", "Player");
        playerData.playerName = playername
        if (playername == "Osyne") {
          playerData.hp = 10000
        }
      }
      this.scene.scene.start("VillageScene")
    });

    // Create a list of fog sprites
    this.foglist = []
    for (var j=0; j<200; j++){
      this.foglist.push([])
      for (var i=0; i<20; i++){
        // random value x and y for fog placement
        var x = Math.random() * 100 - 100
        var y = Math.random() * 100 - 80
        var fog = new Fog(this,i*295+x,j*24+y,'fog', 5000).setOrigin(0,0)
        this.foglist[j].push(fog)
        this.foglist[j][i].setAlpha(0.2)
        this.foglist[j][i].setDepth(998)
      }
    }
  }

  update(){
    for (var j=0; j<50; j++){
      for (var i=0; i<20; i++){
        this.foglist[j][i].update()
      }
    }
  }
}

//Game Scene
class GameScene extends Phaser.Scene{
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
    this.keyL = this.input.keyboard.addKey(76)
  }

  create(){
    // this.physics.world.drawDebug = true;
    this.keysSetUp();
    this.cameraSetup();
  }

  update(){
    this.player.update()
    
    if (this.enemies){
      for (var i=0; i<this.enemies.length; i++){
        this.enemies[i].update()
      }
    }

    if (this.foglist){
      for (var j=0; j<235; j++){
        for (var i=0; i<20; i++){
          this.foglist[j][i].update()
       }
      }
    }

    if (this.vision){
      this.vision.x = this.player.x
      this.vision.y = this.player.y
    }

    // Update the HpBar
    if (this.hpbar) {
      this.hpbar.update();
    }
  }
}

class PlainsScene extends GameScene{
  constructor(){
    super("PlainsScene")
  }

  preload(){
    this.load.spritesheet('mc', 'static/gamefiles/mc.png', {
      frameWidth: 64,
      frameHeight: 112
    });
    this.load.spritesheet('marms', 'static/gamefiles/marms.png', {
      frameWidth: 240,
      frameHeight: 192
    });
    this.load.spritesheet('creaks', 'static/gamefiles/creaks.png', {
      frameWidth: 64,
      frameHeight: 32
    });
    this.load.spritesheet('cyclopswolf', 'static/gamefiles/cyclopswolf.png', {
      frameWidth: 96,
      frameHeight: 128
    });
    this.load.image('tileset', 'Tiled/Spritesheetv2.png');
    this.load.image('villageimg', 'static/gamefiles/villageimg.png')
    this.load.tilemapTiledJSON('map', 'static/gamefiles/background.json');
    this.load.audio('boop', 'static/gamefiles/boop.mp3')
    this.load.audio('bing', 'static/gamefiles/bing.mp3')
    this.load.image('vision', 'static/gamefiles/vision.png')
    this.load.image('fog', 'static/gamefiles/fog.png')
    this.load.audio('foggyplains', 'static/gamefiles/foggyplains.mp3')
    this.load.audio('shoop', 'static/gamefiles/shoop.mp3')
    this.load.audio('shing', 'static/gamefiles/shing.mp3')
    this.load.audio('argh', 'static/gamefiles/argh.mp3')

    this.load.spritesheet('slash', 'static/gamefiles/slash.png', {
      frameWidth: 64,
      frameHeight: 128
    } )
    
    this.load.image('hpbar', 'static/gamefiles/hpbar.png')

  }

  fogOfWarSetup(){
    // make a RenderTexture that is the size of the screen
    this.rt = this.make.renderTexture({
      x: this.background.width/2,
      y: this.background.height/2,
      width:this.background.width,
      height:this.background.height
    }, true)

    // draw the floorLayer into it
    this.rt.draw(this.background, 0, 0)
    this.rt.draw(this.terrain, 0, 0)
    
    // Create a list of fog sprites
    this.foglist = []
    for (var j=0; j<235; j++){
      this.foglist.push([])
      for (var i=0; i<20; i++){
        // random value x and y for fog placement
        var x = Math.random() * 100
        var y = Math.random() * 100

        var fog = new Fog(this,i*295-100+x,j*24-80+y,'fog',109*64).setOrigin(0,0)
        this.foglist[j].push(fog)
        this.foglist[j][i].setAlpha(0.95)
        this.foglist[j][i].setDepth(998)
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
  }

  cameraSetup(){
    const camera = this.cameras.main;
    camera.setZoom(1.5);
    camera.startFollow(this.player);
    camera.setBounds(0, 0, 109*64, 89*64);
    camera.roundPixels = true
  }

  mapSetup(){
    this.map = this.make.tilemap({ key: 'map' });
    this.tileset = this.map.addTilesetImage('tileset', 'tileset');
    this.villageimg = this.map.addTilesetImage('villageimg', 'villageimg');
    
    this.background = this.map.createLayer('background', [this.tileset,this.villageimg],0,0);
    this.background.setCollisionByProperty({ water: true });

    this.terrain = this.map.createLayer('terrain', this.tileset,0,0);
    this.terrain.shuffle(0, 0, 110, 30)
    this.terrain.shuffle(0, 30, 30, 30)
    this.terrain.shuffle(80, 30, 30, 30)
    this.terrain.shuffle(0, 60, 110, 30)

    // change collision information
    this.terrain.setCollisionByExclusion([-1,17,18,34]);
  }

  levelSetup(){
    this.mapSetup()
    this.player = new Player(this,playerData.x,playerData.y,"mc")
    this.player.setDepth(1099)
    this.sound.add('boop')
    this.sound.add('bing')
    this.foggyplains = this.sound.add('foggyplains')
    this.foggyplains.setLoop(true)
    this.foggyplains.play()
  }

  create(){
    this.levelSetup()
    super.create()

    this.enemies = []

    this.wave1 = function (scene){
      scene.enemies.push(new Marms(scene, 1000, 1000))
      for (var i = 0; i<5; i++){
        scene.enemies.push(new Creaks(scene, 1000, 1000))
      }
      scene.textstart = scene.add.text(800, 450-64-64, "Welcome to the Plains!\nWave 1", {fontSize: "32px", color: "#FF0000", fontStyle: "bold"});
      scene.textstart.setOrigin(0.5,0.5)
      scene.textstart.setDepth(9999);
      scene.textstart.setScrollFactor(0);
    }
    this.wave2 = function(scene){
      this.currWave = 2
      scene.enemies.push(new Marms(scene, 1000, 1000))
      for (var i = 0; i<10; i++){
        scene.enemies.push(new Creaks(scene, 1000, 1000))
      }
      scene.textstart = scene.add.text(800, 450-64-64, "Wave 2", {fontSize: "32px", color: "#FF0000", fontStyle: "bold"});
      scene.textstart.setOrigin(0.5,0.5)
      scene.textstart.setDepth(9999);
      scene.textstart.setScrollFactor(0);
    }
    this.wave3 = function (scene){
      this.currWave = 3
      scene.enemies.push(new Marms(scene, 1000, 1000))
      for (var i = 0; i<15; i++){
        scene.enemies.push(new Creaks(scene, 1000, 1000))
      }
      scene.textstart = scene.add.text(800, 450-64-64, "Wave 3", {fontSize: "32px", color: "#FF0000", fontStyle: "bold"});
      scene.textstart.setOrigin(0.5,0.5)
      scene.textstart.setDepth(9999);
      scene.textstart.setScrollFactor(0);
      if (scene.enemies.length == 0){
        scene.textstart.destroy()
        //congratulations
        scene.textstart = scene.add.text(800, 450-64-64, "Congratulations!\nYou have defeated all the enemies!", {fontSize: "32px", color: "#FF0000", fontStyle: "bold"});
      }
    }

    this.fogOfWarSetup()

    // create a big rectangle for hp bar
    this.hpbar = new HpBar(this, 256+32, 256-32, 'hpbar', this.player);
    this.hpbar.setDepth(1100);
  }

  update(){
    super.update()

    console.log(this.player.x, this.player.y)
    if (this.currWave){
      if (this.currWave == 1 && this.enemies.length == 0){
        this.wave2(this)
        this.currWave = 2
      }
      else if (this.currWave == 2 && this.enemies.length == 0){
        this.wave3(this)
      }
    }
    else{
      this.wave1(this)
      this.currWave = 1
    }

    if ((this.player.x >= 30*64 && this.player.x <= 79*64) && (this.player.y >= 30*64 && this.player.y <= 59*64)){
      // stop scene
      this.foggyplains.stop()
      if (this.player.x >= 30*64 && this.player.x <= 54*64){
        playerData.x = this.player.x - 30*64 + 2
      }
      else{
        playerData.x = this.player.x - 30*64 - 2
      }

      if (this.player.y >= 30*64 && this.player.y <= 44*64){
        playerData.y = this.player.y - 30*64 + 2
      }
      else{
        playerData.y = this.player.y - 30*64 - 2
      }
      
      this.scene.start("VillageScene")
    }


  }
}

// Village Scene
class VillageScene extends GameScene{
  constructor(){
    super("VillageScene")
  }

  preload(){
    this.load.spritesheet('mc', 'static/gamefiles/mc.png', {
      frameWidth: 64,
      frameHeight: 112
    });
    this.load.audio('boop', 'static/gamefiles/boop.mp3')
    this.load.audio('bing', 'static/gamefiles/bing.mp3')
    this.load.audio('tersinvillage', 'static/gamefiles/tersinvillage.mp3')

    this.load.tilemapTiledJSON('villagemap', 'static/gamefiles/village.json');
    this.load.image('villagespritesheet1', 'static/gamefiles/villagespritesheet1.png');
    this.load.image('villagespritesheet2', 'static/gamefiles/villagespritesheet2.png');
  }

  cameraSetup(){
    const camera = this.cameras.main;
    camera.setZoom(1.5);
    camera.startFollow(this.player);
    camera.setBounds(0, 0, 50*64, 30*64);
    camera.roundPixels = true
  }

  levelSetup(){
    this.mapSetup()
    if (playerData.tutorial){
      this.player = new Player(this,24*64,22*32,"mc")
      playerData.tutorial = false
      this.textstart = this.add.text(800, 450-64-64, "Welcome " + playerData.playerName +"!\nPress WASD to move up, left, down and right", {fontSize: "32px", color: "#FFFFFF", fontStyle: "bold"});
      this.textstart.setOrigin(0.5,0.5)
      this.textstart.setDepth(9999);
      this.textstart.setScrollFactor(0); 

      // delete text after 10 seconds
      setTimeout(() => {
        this.textstart.destroy()
        this.textstart2 = this.add.text(800, 450-64-64, "Leave the town to start you mission!", {fontSize: "32px", color: "#FFFFFF", fontStyle: "bold"});
        this.textstart2.setOrigin(0.5,0.5)
        this.textstart2.setDepth(9999);
        this.textstart2.setScrollFactor(0);
      }
      , 10000);
    }
    else {
      this.player = new Player(this,playerData.x,playerData.y,"mc")
    }
    this.player.setDepth(1099)
    this.sound.add('boop')
    this.sound.add('bing')
    this.tersinvillage = this.sound.add('tersinvillage')
    this.tersinvillage.setLoop(true)
    this.tersinvillage.play()
  }

  mapSetup(){
    this.map = this.make.tilemap({ key: 'villagemap' });
    this.tileset = this.map.addTilesetImage('home village spritesheet', 'villagespritesheet1');
    this.tileset2 = this.map.addTilesetImage('tree', 'villagespritesheet2');
    
    this.background = this.map.createLayer('ground', [this.tileset, this.tileset2],-128,-384);
    this.background.setCollisionByProperty({ collides: true });

    this.terrain = this.map.createLayer('terrain', [this.tileset, this.tileset2],-128,-384);
    this.terrain.setCollisionByProperty({ collides: true });
    this.terrain.setDepth(1000)

    this.terrain2 = this.map.createLayer('terrain2', [this.tileset, this.tileset2],-128,1024-384);
    this.terrain2.setCollisionByProperty({ collides: true });

    this.treeleaves = this.map.createLayer('treeleaves', [this.tileset, this.tileset2],-128,1024-384);
    this.treeleaves.setCollisionByProperty({ collides: true });
    this.treeleaves.setDepth(1100);

    this.housetop = this.map.createLayer('housetop', [this.tileset, this.tileset2],-128,-384);
    this.housetop.setCollisionByProperty({ collides: true });
    this.housetop.setDepth(1100);
  }

  create(){
    this.levelSetup()

    super.create()
  }

  update(){
    super.update()

    if (this.player.x <= 0 || this.player.y <= 0 || this.player.x >= 50*64 || this.player.y >= 30*64){
      this.tersinvillage.stop()

      if (this.player.x >= 50*64){
        playerData.x = this.player.x + 30*64 + 1
      }
      else{
        playerData.x = this.player.x + 30*64 - 1
      }

      if (this.player.y >= 30*64){
        playerData.y = this.player.y + 30*64 + 1
      }
      else{
        playerData.y = this.player.y + 30*64 - 1
      }

      this.scene.start("PlainsScene")
    }
  }
}


// Sprites
// Fog
class Fog extends Phaser.Physics.Arcade.Sprite{
  constructor(scene,x,y,spriteKey,maxX){
    super(scene,x,y,spriteKey)
    this.maxX = maxX
    //initiliase any properties of the enemy here
    this.scene.add.existing(this);
    this.scene.physics.add.existing(this);
    this.velocityX = Math.random() * 100
  }

  update(){
    this.setVelocityX(this.velocityX);
    if (this.x > this.maxX){
      this.x = -320
    }
    else if (this.scene.player && this.x > this.scene.player.x + 3200){
      this.x = this.scene.player.x - 900
    }
    else if (this.scene.player && this.x < this.scene.player.x - 3200){
      this.x = this.scene.player.x + 600
    }
  }
}

// Signage for each map
class Sign extends Phaser.GameObjects.Sprite{
  constructor(scene,x,y,spriteKey){
    super(scene,x,y,spriteKey)
    //initiliase any properties of the enemy here
    scene.add.existing(this);
    this.setDepth(1000)
  }
}

class HpBar extends Phaser.GameObjects.Sprite{
  constructor(scene, x, y, texture, player){
    super(scene, x, y, texture)
    this.player = player
    this.scene.add.existing(this)
    // Make sure the bar does not move when the camera moves
    this.setScrollFactor(0)
    this.setOrigin(0,0)
    this.setDepth(1100)
    this.displayWidth = (this.player.hp/playerData.hp) * this.width
    // add a border to the bar
    this.border = this.scene.add.graphics();
    this.border.lineStyle(4, 0x000000, 1);
    this.border.strokeRect(x, y, this.width, this.height);
    this.border.setDepth(1101);
    this.border.setScrollFactor(0);

    //add text to the bar
    this.text = this.scene.add.text(x+8, y+this.height/2, this.player.hp, { font: "32px Press Start 2P", fill: '#FFFFFF', fontStyle: "bold"});
    this.text.setOrigin(0,0.5)
    this.text.setDepth(1102);
    this.text.setScrollFactor(0); 

    this.nametext = this.scene.add.text(x, y-32, playerData.playerName, { font: "32px Press Start 2P", fill: '#000000', fontStyle: "bold"});
    this.nametext.setOrigin(0,0.5)
    this.nametext.setDepth(1102);
    this.nametext.setScrollFactor(0);
  }

  update(){
    // decrease the length of the hp bar
    this.displayWidth = (this.player.hp/playerData.hp) * this.width
    this.text.setText(Math.floor(this.player.hp))
  } 
}

// Characters
// Enemy
class Enemy extends Phaser.Physics.Arcade.Sprite{
  constructor(scene,x,y,spriteKey){
    super(scene,x,y,spriteKey)
    this.setDepth(1000)
  }

  initPhysics(){
    //initiliase the physics of the character (drag, etc.)
    this.scene.add.existing(this)
    this.scene.physics.add.existing(this)
    this.scene.physics.add.collider(this, this.scene.terrain) 
  }

  update(){
    // check hp
    if (this.hp <= 0){
      this.scene.events.off('update', this.update, this)
      this.destroy()
    }

    // check if hit
    if (this && this.scene && this.scene.physics.overlap(this, this.scene.player.slash)){
      console.log("hit")
      // set tint for 0.1 seconds
      this.setTint(0xff0000)
      this.scene.time.delayedCall(1000, () => {
        this.clearTint()
        // stun enemy for 0.1 seconds
        if (this.hp > 0){
          this.setVelocity(0)
        }
      });
    }
  }
}

class Marms extends Enemy{
  constructor(scene,x,y){
    super(scene,x,y,'marms')
    this.hp = 100
    this.at = 10
    //initiliase any properties of the enemy here
    this.initPhysics()
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers("marms", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers("marms", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers("marms", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers("marms", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
  }

  create(){
    // add name as text
    this.text = this.scene.add.text(this.x, this.y-32, "Marms", { font: "32px Press Start 2P", fill: '#FF0000', fontStyle: "bold"});
    this.text.setOrigin(0.5,0.5)
    this.text.setDepth(9999)
  }
  
  update(){
  // Enemy movements: move slowly towards the player
  if (this.scene){

    const speed = 200;
    const player = this.scene.player;

    //check distance is between player and enemy is close enough
    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    var prevVelocity = this.body.velocity.clone();
    if (prevVelocity.x < 0) {this.anims.play('left', true); this.setFlipX(true);}
    else if (prevVelocity.x > 0) {this.anims.play('right', true); this.setFlipX(false);}
    else if (prevVelocity.y < 0) this.anims.play('up', true);
    else if (prevVelocity.y > 0) this.anims.play('down', true);

    if (distance > 1000){
      this.setVelocityX(0);
      this.setVelocityY(0);
    }
    else if (distance <= 100){
      // attack player every 3 seconds
      if ((!this.attackTimer || this.attackTimer.getProgress() === 1)&&this) {

        // Play the sound
        this.scene.sound.play('boop');

        // Move to center of player when attacking
        this.scene.physics.moveToObject(this, player, 3000);

        // if hit player, player takes damage
        if (this.scene.physics.overlap(this, this.scene.player)){
          this.scene.player.hp -= this.at
          this.scene.player.setTint(0xff0000)
          if (this.scene.player){
            var playervar = this.scene.player
            this.scene.time.delayedCall(1000, () => {
              playervar.clearTint()
              this.scene.sound.play('argh');
            });
          }
          console.log("hitbyenemy"+this.scene.player.hp)
        }
        
        // while waiting for next attack, circle around spawn point
        this.setVelocity(0);
        Phaser.Math.RotateAroundDistance(this, this.x, this.y, 0.01, 113); 
        setTimeout(() => {
          // stop circling around spawn point
          if (this){
            this.setVelocity(0);
          }
        }
        , 2000);

        // Set up a timer for 3 seconds
        this.attackTimer = this.scene.time.delayedCall(3000, () => {
          // Reset the timer when it's done
          this.attackTimer = null;
        });
      }
    }
    else {
      const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      const velocityX = Math.cos(angleToPlayer) * speed;
      const velocityY = Math.sin(angleToPlayer) * speed;
      this.setVelocityX(velocityX);
      this.setVelocityY(velocityY);
    }

    super.update()
  }
  }
}

class Creaks extends Enemy{
  constructor(scene,x,y){
    super(scene,x,y,'creaks')
    this.hp = 100
    this.at = 10
    this.initPhysics()
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers("creaks", { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers("creaks", { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers("creaks", { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers("creaks", { start: 0, end: 5 }),
      frameRate: 10,
      repeat: -1
    });
  }
  create(){
    // add name as text
    this.text = this.scene.add.text(this.x, this.y-32, "Creaks", { font: "32px Press Start 2P", fill: '#FF0000', fontStyle: "bold"});
    this.text.setOrigin(0.5,0.5)
    this.text.setDepth(9999)
  }

  update(){
    // Enemy movements: move slowly towards the player
    if (this.scene){

      const speed = 250;
      const player = this.scene.player;

      //check distance is between player and enemy is close enough
      const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

      var prevVelocity = this.body.velocity.clone();
      if (prevVelocity.x < 0) {this.anims.play('left', true); this.setFlipX(true);}
      else if (prevVelocity.x > 0) {this.anims.play('right', true); this.setFlipX(false);}
      else if (prevVelocity.y < 0) this.anims.play('up', true);
      else if (prevVelocity.y > 0) this.anims.play('down', true);

      if (distance > 1000){
        this.setVelocityX(0);
        this.setVelocityY(0);
      }
      else if (distance <= 100){
        // attack player every 3 seconds
        if (!this.attackTimer || this.attackTimer.getProgress() === 1) {

          // Play the sound
          this.scene.sound.play('boop');

          // Move to center of player when attacking
          this.scene.physics.moveToObject(this, player, 3000);

          // if hit player, player takes damage
          if (this.scene.physics.overlap(this, this.scene.player)){
            this.scene.player.hp -= this.at
            this.scene.player.setTint(0xff0000)
            if (this.scene.player){
              var playervar = this.scene.player
              this.scene.time.delayedCall(1000, () => {
                playervar.clearTint()
                this.scene.sound.play('argh');
              });
            }
            console.log("hitbyenemy"+this.scene.player.hp)
          }
          
          // while waiting for next attack, circle around player
          this.setVelocity(0);
          Phaser.Math.RotateAroundDistance(this, player.x, player.y, 0.01, 115);
          setTimeout(() => {
            // stop circling around player
            if (this){
              this.setVelocity(0);
            }
          }
          , 2000);

          // Set up a timer for 3 seconds
          this.attackTimer = this.scene.time.delayedCall(3000, () => {
            // Reset the timer when it's done
            this.attackTimer = null;
          });
        }
      }
      else {
        const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
        const velocityX = Math.cos(angleToPlayer) * speed + Math.random() * 100 - 50;
        const velocityY = Math.sin(angleToPlayer) * speed + Math.random() * 100 - 50;
        this.setVelocityX(velocityX);
        this.setVelocityY(velocityY);
      }

      super.update()
    }
  }
}

// Player
class Player extends Phaser.Physics.Arcade.Sprite
{
  constructor(scene,x,y,spriteKey){
    super(scene,x,y,spriteKey)
    //initiliase any properties of the player here

    this.hp = playerData.hp
    this.at = 10

    this.initPhysics()
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('mc', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('mc', { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('mc', { start: 8, end: 11 }),
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('mc', { start: 12, end: 15 }),
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
        this.soundTimer = this.scene.time.delayedCall(300, () => {
          // Reset the timer when it's done
          this.soundTimer = null;
        });
      }
    });

    this.body.setSize(64, 56)
    this.body.setOffset(0, 56)
  }

  update(){  
    const speed = 300
    if (this.body.velocity.clone != 0){
      var prevVelocity = this.body.velocity.clone();
    }

    this.setVelocity(0)
    
    const attacking = this.attackTimer && this.attackTimer.getProgress() < 1;

    if (!attacking){
      if (this.scene.keyA.isDown){
        this.setVelocityX(-speed)
        this.direction = "left"
        this.prevKey = "left"
      }
      else if (this.scene.keyD.isDown){
        this.setVelocityX(speed)
        this.direction = "right"
        this.prevKey = "right"
      }
      if (this.scene.keyW.isDown){
        this.setVelocityY(-speed)
        this.direction = "up"
        this.prevKey = "up"
      }
      else if (this.scene.keyS.isDown){
        this.setVelocityY(speed)
        this.direction = "down"
        this.prevKey = "down"
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
        if (prevVelocity.x < 0) this.setTexture('mc', 12) // move left
        else if (prevVelocity.x > 0) this.setTexture('mc', 8) // move right
        else if (prevVelocity.y < 0) this.setTexture('mc', 4) // move up
        else if (prevVelocity.y > 0) this.setTexture('mc', 0) // move down
      }
    }

    if (this.scene.keyL.isDown && this.scene instanceof PlainsScene){
      // can only absorb every 1 second
      if (!this.attackTimer || this.attackTimer.getProgress() === 1) {
        this.scene.input.keyboard.enabled = false;

        if (prevVelocity.x < 0) this.setTexture('mc', 12) // move left
        else if (prevVelocity.x > 0) this.setTexture('mc', 8) // move right
        else if (prevVelocity.y < 0) this.setTexture('mc', 4) // move up
        else if (prevVelocity.y > 0) this.setTexture('mc', 0) // move down

        this.setVelocity(0)

        // Play the sound
        this.scene.sound.play('shoop');
        console.log("i absorb" + this.prevKey)

        // create a 64 by 128 rectangle hitbox sprite next to the player with the image slash
        // right
        if (this.prevKey == 'right') {this.absorb = new Phaser.Physics.Arcade.Sprite(this.scene, this.x+64, this.y).setDepth(1000); console.log("right"); this.absorb.setAngle(180)}
        // left (flip vertically)
        else if (this.prevKey == 'left') this.absorb = new Phaser.Physics.Arcade.Sprite(this.scene, this.x-64, this.y).setDepth(1000).setAngle(180)
        // down
        else if (this.prevKey == 'down') this.absorb = new Phaser.Physics.Arcade.Sprite(this.scene, this.x, this.y+64+16).setDepth(1000).setAngle(90)
        // up
        else this.absorb = new Phaser.Physics.Arcade.Sprite(this.scene, this.x, this.y-64-16).setDepth(1000).setAngle(-90)

        this.scene.physics.add.existing(this.absorb)
        this.scene.add.existing(this.absorb)
        // this.absorb.anims.create({
        //   key: 'absorb',
        //   frames: this.anims.generateFrameNumbers('absorb', { start: 0, end: 3 }),
        //   frameRate: 10,
        //   repeat: -1
        // });
        // this.absorb.anims.play('absorb', true);

        //check if the absorb is overlapping with any enemies and if so console log hit
        for (var i=0; i<this.scene.enemies.length; i++){
          if (this.scene.physics.overlap(this.absorb, this.scene.enemies[i])){
            console.log("absorbed")
            // turn enmy pale slowly
            this.scene.time.delayedCall(1000, () => {
              this.scene.enemies[i].setTint(0x00ff00)
            });

            playerData.absorb.push(this.scene.enemies[i].spriteKey)

            console.log(playerData.absorb)
          }
        }

        this.scene.input.keyboard.enabled = true;
        // check for input again
        this.scene.input.keyboard.update();
        this.velocityX = prevVelocity.x
        this.velocityY = prevVelocity.y

        // destroy the slash after animation is done
        this.scene.time.delayedCall(500, () => {
          this.absorb.destroy()
        });
  
        // Set up a timer for 2 seconds
        this.attackTimer = this.scene.time.delayedCall(750, () => {
          // Reset the timer when it's done
          this.attackTimer = null;
          playerData.absorb
        });
      }
    }

    else if (this.scene.keyJ.isDown && this.scene instanceof PlainsScene){
      // can only attack every 1 second
      if (!this.attackTimer || this.attackTimer.getProgress() === 1) {
        this.scene.input.keyboard.enabled = false;

        if (prevVelocity.x < 0) this.setTexture('mc', 12) // move left
        else if (prevVelocity.x > 0) this.setTexture('mc', 8) // move right
        else if (prevVelocity.y < 0) this.setTexture('mc', 4) // move up
        else if (prevVelocity.y > 0) this.setTexture('mc', 0) // move down

        this.setVelocity(0)

        // Play the sound
        this.scene.sound.play('shing');

        console.log("j attack" + this.prevKey)
        // create a 64 by 128 rectangle hitbox sprite next to the player with the image slash
        // right
        if (this.prevKey == 'right') {this.slash = new Phaser.Physics.Arcade.Sprite(this.scene, this.x+64, this.y, 'slash').setDepth(1000); console.log("right");}
        // left (flip vertically)
        else if (this.prevKey == 'left') this.slash = new Phaser.Physics.Arcade.Sprite(this.scene, this.x-64, this.y, 'slash').setDepth(1000).setAngle(180)
        // down
        else if (this.prevKey == 'down') this.slash = new Phaser.Physics.Arcade.Sprite(this.scene, this.x, this.y+64+16, 'slash').setDepth(1000).setAngle(90)
        // up
        else this.slash = new Phaser.Physics.Arcade.Sprite(this.scene, this.x, this.y-64-16, 'slash').setDepth(1000).setAngle(-90)

        this.scene.physics.add.existing(this.slash)
        this.scene.add.existing(this.slash)
        this.slash.anims.create({
          key: 'slash',
          frames: this.anims.generateFrameNumbers('slash', { start: 0, end: 3 }),
          frameRate: 10,
          repeat: -1
        });
        this.slash.anims.play('slash', true);

        //check if the slash is overlapping with any enemies and if so console log hit
        for (var i=0; i<this.scene.enemies.length; i++){
          if (this.scene.physics.overlap(this.slash, this.scene.enemies[i])){
            console.log("hit")
            // set tint for 0.1 seconds
            this.scene.enemies[i].hp -= this.at
          }
        }

        this.scene.input.keyboard.enabled = true;
        // check for input again
        this.scene.input.keyboard.update();
        this.velocityX = prevVelocity.x
        this.velocityY = prevVelocity.y

        // destroy the slash after animation is done
        this.scene.time.delayedCall(500, () => {
          this.slash.destroy()
        });
  
        // Set up a timer for 2 seconds
        this.attackTimer = this.scene.time.delayedCall(990, () => {
          // Reset the timer when it's done
          this.attackTimer = null;
        });
      }
    }
    else if (this.scene.keyI.isDown && this.scene instanceof PlainsScene){
      // can only heal every 1 second
      if (!this.attackTimer || this.attackTimer.getProgress() === 1) {
        this.scene.input.keyboard.enabled = false;

        if (prevVelocity.x < 0) this.setTexture('mc', 12) // move left
        else if (prevVelocity.x > 0) this.setTexture('mc', 8) // move right
        else if (prevVelocity.y < 0) this.setTexture('mc', 4) // move up
        else if (prevVelocity.y > 0) this.setTexture('mc', 0) // move down

        this.setVelocity(0)

        // Play the sound
        this.scene.sound.play('bing');

        console.log("skill" + this.prevKey)

        if (playerData.absorb.includes("marms")){
          this.hp += 50
          this.at += 5
          // increase size for 10 seconds
          this.setScale(1.5)
          setTimeout(() => {
            this.setScale(1)
          }
          , 10000);

        }
        else if (playerData.absorb.includes("creaks")){
          this.hp += 30
        }

        this.scene.input.keyboard.enabled = true;
        // check for input again
        this.scene.input.keyboard.update();
        this.velocityX = prevVelocity.x
        this.velocityY = prevVelocity.y
  
        // Set up a timer for 2 seconds
        this.attackTimer = this.scene.time.delayedCall(990, () => {
          // Reset the timer when it's done
          this.attackTimer = null;
        });
      }
    }


    if (this.hp <= 0){
      // this.scene.events.off('update', this.update, this)
      this.scene.foggyplains.stop()
      this.scene.scene.start("StartScene")
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
      // debug: true,
    }
	},
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene:[StartScene, PlainsScene, VillageScene],
  autoCenter:true,
}
  
var Game = new Phaser.Game(config);