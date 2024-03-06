let playerData = {
  playerName: "Player",
  tutorial: true,
  tutorial2: true,
  hp: 100,
  at: 10,
  absorb: "",
  wave: 0,
  x: 0, y: 0,
  score : 0
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
          playerData.at = 10000
          playerData.absorb = "GODMODE"
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

    if (this.enemyvision){
      this.enemyvision.x = this.player.x
      this.enemyvision.y = this.player.y
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
      frameWidth: 128,
      frameHeight: 96
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
    this.load.spritesheet('marmpunch', 'static/gamefiles/marmpunch.png', {
      frameWidth: 128,
      frameHeight: 128
    })
    
    this.load.image('hpbar', 'static/gamefiles/hpbar.png')
    this.load.image('ball', 'static/gamefiles/ball.png')
    this.load.image('arrow', 'static/gamefiles/arrow.png')
  }

  fogOfWarSetup(){
    // make a RenderTexture that is the size of the screen
    if (this.rt){
      this.rt.destroy()
    }
    if (this.foglist){
      for (var j=0; j<235; j++){
        for (var i=0; i<20; i++){
          this.foglist[j][i].destroy()
        }
      }
    }

    // if (this.vision){
    //   this.vision.destroy()
    // }

    // if (this.enemyvision){
    //   this.enemyvision.destroy()
    // }

    this.rt = this.make.renderTexture({
      x: this.background.width/2,
      y: this.background.height/2,
      width:this.background.width,
      height:this.background.height
    }, true)

    // draw the floorLayer into it
    this.rt.clear()
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
        this.foglist[j][i].setAlpha(0.65)
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
    
    this.enemyvision = this.make.image({
      x: this.player.x,
      y: this.player.y,
      key: 'vision',
      add: false
    })
    this.enemyvision.scale = 1.5
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

  maskSetup(scene){
    for (var i = 0; i< this.enemies.length; i++){
      scene.enemies[i].mask = new Phaser.Display.Masks.BitmapMask(scene, scene.enemyvision) 
    }
  }

  randomXY(xory){
    if (xory == "x"){
      var x = Math.random() * 109*64
      while (x >= 30*64 && x <= 79*64){
        x = Math.random() * 109*64
      }
      return x
    }
    else{
      var y = Math.random() * 89*64
      while (y >= 30*64 && y <= 59*64){
        y = Math.random() * 89*64
      }
      return y
    }
  }

  create(){
    this.levelSetup()
    super.create()

    this.enemies = []

    this.wave1 = function (scene){
      scene.enemies.push(new Marms(scene, this.randomXY("x"), this.randomXY("y"), 0))
      // for (var i = 0; i<3; i++){
      //   scene.enemies.push(new Creaks(scene, this.randomXY("x"), this.randomXY("y"),i))
      // }
      // for (var i = 0; i<2; i++){
      //   scene.enemies.push(new CyclopsWolf(scene, this.randomXY("x"), this.randomXY("y"),i))
      // }

      this.maskSetup(scene)

      scene.textstart = scene.add.text(800, 450-64-64, "Welcome to the Plains!\nWave 1", {fontSize: "32px", color: "#FF0000", fontStyle: "bold"});
      scene.textstart.setOrigin(0.5,0.5)
      scene.textstart.setDepth(9999);
      scene.textstart.setScrollFactor(0);
    }
    this.wave2 = function(scene){
      scene.enemies.push(new Marms(scene, this.randomXY("x"), this.randomXY("y"), 0))

      for (var i = 0; i<10; i++){
        scene.enemies.push(new Creaks(scene, this.randomXY("x"), this.randomXY("y"),i))
      }
      for (var i = 0; i<5; i++){
        scene.enemies.push(new CyclopsWolf(scene, this.randomXY("x"), this.randomXY("y"),i))
      }

      this.maskSetup(scene)

      scene.textstart.destroy()

      scene.textstart = scene.add.text(800, 450-64-64, "Wave 2", {fontSize: "32px", color: "#FF0000", fontStyle: "bold"});
      scene.textstart.setOrigin(0.5,0.5)
      scene.textstart.setDepth(9999);
      scene.textstart.setScrollFactor(0);
    }
    this.wave3 = function (scene){
      scene.enemies.push(new Marms(scene, this.randomXY("x"), this.randomXY("y"), 0))
      for (var i = 0; i<15; i++){
        scene.enemies.push(new Creaks(scene, this.randomXY("x"), this.randomXY("y"),i))
      }
      for (var i = 0; i<7; i++){
        scene.enemies.push(new CyclopsWolf(scene, this.randomXY("x"), this.randomXY("y"),i))
      }

      this.maskSetup(scene)

      scene.textstart.destroy()

      scene.textstart = scene.add.text(800, 450-64-64, "Wave 3", {fontSize: "32px", color: "#FF0000", fontStyle: "bold"});
      scene.textstart.setOrigin(0.5,0.5)
      scene.textstart.setDepth(9999);
      scene.textstart.setScrollFactor(0);
    }
    this.wavesinf = function (scene, waveno){
      scene.enemies.push(new Marms(scene, this.randomXY("x"), this.randomXY("y"), 0))
      for (var i = 0; i<15 + 5*waveno; i++){
        scene.enemies.push(new Creaks(scene, this.randomXY("x"), this.randomXY("y"),i))
      }
      for (var i = 0; i<7 + 3 * waveno; i++){
        scene.enemies.push(new CyclopsWolf(scene, this.randomXY("x"), this.randomXY("y"),i))
      }

      this.maskSetup(scene)

      scene.textstart.destroy()

      scene.textstart = scene.add.text(800, 450-64-64, "Wave "+waveno, {fontSize: "32px", color: "#FF0000", fontStyle: "bold"});
      scene.textstart.setOrigin(0.5,0.5)
      scene.textstart.setDepth(9999);
      scene.textstart.setScrollFactor(0);
    }

    this.fogOfWarSetup()

    // create a big rectangle for hp bar
    this.hpbar = new HpBar(this, 256+32, 256-32, 'hpbar', this.player);
    this.hpbar.setDepth(1100);
    // REMEMBER THAT FOG OF WAR RADIUS IS 256
    this.SkillTime = this.add.circle(1600-256-128, 900-256, 64, 0xffffff);

    this.graphics = this.add.graphics();
    this.graphics.lineStyle(4, 0x000000, 1);
    this.graphics.beginPath();
    this.graphics.setScrollFactor(0);
    // arc (x, y, radius, startAngle, endAngle, anticlockwise)
    this.graphics.arc(1600-256-128, 900-256, 64, Phaser.Math.DegToRad(0), Phaser.Math.DegToRad(360))
    this.graphics.setDepth(1100);
    this.graphics.strokePath();

    // this.SkillTime.setStrokeStyle(4, 0x000000);
    this.SkillTime.setDepth(1100);
    this.SkillTime.setScrollFactor(0); 
    this.Skilltext = this.add.text(1600-256-128, 900-256, "Skill", {fontSize: "32px", color: "#000000", fontStyle: "bold"}).setDepth(1100).setScrollFactor(0);
    this.Skilltext.setOrigin(0.5,0.5)

    // this.SkillTimeArc = this.add.arc(1600-256-128, 900-256, 200, 0, Phaser.Math.DegToRad(360), false, 0xffffff);
    // this.SkillTime
    // this.SkillTimeArc.setDepth(1100);
    // this.SkillTimeArc.setScrollFactor(0);

    // start game stopwatch
    this.gameTime = this.time.addEvent({
      delay: 10000,
      callback: function(){
        playerData.score -= 1
      },
      callbackScope: this,
      loop: true
    })
  }

  update(){
    // show display list of game objects
    // console.log(this.children.list)

    super.update()
    // console.log(this.enemies, playerData.wave)

    if (playerData.absorb != "" && this.player.absorbTimer != null  && this.graphics){
      // set timer
      this.SkillTime.setAlpha(0.5)
      this.Skilltext.setAlpha(0.5)

      this.graphics.clear();

      //  Without this the arc will appear closed when stroked
      this.graphics.beginPath();
      this.graphics.lineStyle(4, 0x000000, 1);
      this.graphics.arc(1600-256-128, 900-256, 64, Phaser.Math.DegToRad(-90), Phaser.Math.DegToRad(361*this.player.absorbTimer.getProgress()-90))
      this.graphics.strokePath();
      this.graphics.setDepth(1100);
    }
    
    if (this.enemies.length == 1 && !this.pointer){
      // add a pointer showing the location of the enemy at the border of the screen
      this.pointer = this.add.image(this.player.x, this.player.y, 'arrow')
      this.pointer.setDepth(9999)
      // this.pointer.setScrollFactor(0)
      console.log("last enemy", this.pointer.x, this.pointer.y, this.player.x, this.player.y, this.enemies[0].x, this.enemies[0].y)
    }
    // reminder PLAYER HAS SCROLL FACTOR
    if (this.pointer && this.enemies.length > 0){
      // keep pointer within the screen
      if (this.enemies[0].x >= this.player.x+800){
        this.pointer.x = this.player.x+800-200
      }
      else if (this.enemies[0].x <= this.player.x-800){
        this.pointer.x = this.player.x-800+200
      }
      else{
        this.pointer.x = this.enemies[0].x
      }
      if (this.enemies[0].y >= this.enemies[0].y+450){
        this.pointer.y = this.player.y+450-200
      }
      else if (this.enemies[0].y <= this.enemies[0].y-450){
        this.pointer.y = this.player.y-450+200
      }
      else {
        this.pointer.y = this.enemies[0].y
      }

    //   // rotate the pointer to face the enemy
      this.pointer.rotation = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.enemies[0].x, this.enemies[0].y)
      console.log(this.pointer.rotation, this.pointer.x, this.pointer.y, this.enemies[0].x, this.enemies[0].y, this.player.x, this.player.y)

      // if enemy is on the screen, remove the pointer
      // if (this.enemies[0].x >= 0+130 && this.enemies[0].x <= 1600-130 && this.enemies[0].y >= 0+130 && this.enemies[0].y <= 900+130){
      //   this.pointer.setAlpha(0)
      // }
      // else{
      //   this.pointer.setAlpha(1)
      // }
    //   console.log(this.pointer.x, this.pointer.y, this.pointer.alpha, this.player.x, this.player.y)
    }
    if (this.enemies.length == 0 && this.pointer){
      this.pointer.destroy()
      this.pointer = null
    }

    
    

    console.log(playerData.wave)
    if (playerData.wave == 0){
      this.wave1(this)
      playerData.wave = 1
    }
    else if (this.enemies.length == 0 && playerData.wave == 1){
      // // turn screen black for 3 seconds
      // this.cameras.main.fade(1000, 0, 0, 0)
      // // stay black for 5 seconds
      // // add text saying the fog has shifted...
      // this.textstart.destroy()
      // this.textstart = this.add.text(800, 450-64-64, "The fog has shifted...", {fontSize: "32px", color: "#FF0000", fontStyle: "bold"});      
      // this.time.delayedCall(5000, () => {
      //   this.cameras.main.fadeIn(1000, 0, 0, 0)
      // });
      // this.time.delayedCall(7000, () => {
      //   this.textstart.destroy()
      // });

      playerData.score += (playerData.wave**2)/2 + 2*playerData.wave + 7.5

      // change the terrain
      this.terrain.shuffle(0, 0, 110, 30)
      this.terrain.shuffle(0, 30, 30, 30)
      this.terrain.shuffle(80, 30, 30, 30)
      this.terrain.shuffle(0, 60, 110, 30)

      // change collision information
      this.fogOfWarSetup()
      this.terrain.setCollisionByExclusion([-1,17,18,34]);

      // initialise physics for player
      this.player.initPhysics()

      this.wave2(this)
      playerData.wave = 2
      this.player.hp += 20
    }
    else if (this.enemies.length == 0 && playerData.wave == 2){
      playerData.score += (playerData.wave**2)/2 + 2*playerData.wave + 7.5
      // change the terrain
      this.terrain.shuffle(0, 0, 110, 30)
      this.terrain.shuffle(0, 30, 30, 30)
      this.terrain.shuffle(80, 30, 30, 30)
      this.terrain.shuffle(0, 60, 110, 30)

      // change collision information
      this.fogOfWarSetup()
      this.terrain.setCollisionByExclusion([-1,17,18,34]);
      // initialise physics for player
      this.player.initPhysics()
      this.wave3(this)
      playerData.wave = 3
      this.player.hp += 20
    }
    else if (this.enemies.length == 0 && playerData.wave == 3){
      playerData.score += (playerData.wave**2)/2 + 2*playerData.wave + 7.5
      // change the terrain
      this.terrain.shuffle(0, 0, 110, 30)
      this.terrain.shuffle(0, 30, 30, 30)
      this.terrain.shuffle(80, 30, 30, 30)
      this.terrain.shuffle(0, 60, 110, 30)

      // change collision information
      this.fogOfWarSetup()
      this.terrain.setCollisionByExclusion([-1,17,18,34]);
      // initialise physics for player
      this.player.initPhysics()
      playerData.wave = 4  
      this.wavesinf(this, playerData.wave)  
      this.player.hp += 20  
    }
    else if (this.enemies.length == 0 && playerData.wave > 3){
      playerData.score += (playerData.wave**2)/2 + 2*playerData.wave + 7.5
      // change the terrain
      this.terrain.shuffle(0, 0, 110, 30)
      this.terrain.shuffle(0, 30, 30, 30)
      this.terrain.shuffle(80, 30, 30, 30)
      this.terrain.shuffle(0, 60, 110, 30)

      // change collision information
      this.fogOfWarSetup()
      this.terrain.setCollisionByExclusion([-1,17,18,34]);
      // initialise physics for player
      this.player.initPhysics()

      playerData.wave += 1
      this.wavesinf(this, playerData.wave)
      
      this.player.hp += 20
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

      playerData.wave = 0
      playerData.absorb = ""
      if (this.pointer){
        this.pointer.destroy()
        this.pointer = null
      }
      this.scene.start("VillageScene")
    }

    // player goes out of border bounce them back
    
    if (this.player.x <= 0){
      this.player.x = 0
    }
    else if (this.player.x >= 109*64){
      this.player.x = 109*64
    }
    if (this.player.y <= 0){
      this.player.y = 0
    }
    else if (this.player.y >= 89*64){
      this.player.y = 89*64
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
        this.textstart2 = this.add.text(800, 450-64-64, "Leave the town to start your mission!", {fontSize: "32px", color: "#FFFFFF", fontStyle: "bold"});
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
    playerData.score = 0
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

// Game Over Scene
class GameOverScene extends Phaser.Scene{
  constructor(){
    super("GameOverScene")
  }

  preload(){
    
  }

  create(){
    // stop the game stopwatch
    this.scene.get("PlainsScene").gameTime.remove()

    this.GameOver = this.add.text(800, 450, "Game Over", {fontSize: "64px", color: "#FF0000", fontStyle: "bold"});
    this.GameOver.setOrigin(0.5,0.5)
    this.GameOver.setDepth(9999);
    this.GameOver.setScrollFactor(0);

    // score
    if (playerData.score < 0){
      this.Score = this.add.text(800, 450+64, "Score: 0", {fontSize: "32px", color: "#FF0000", fontStyle: "bold"});
    }
    else{
      this.Score = this.add.text(800, 450+64, "Score: " + Math.floor(playerData.score), {fontSize: "32px", color: "#FF0000", fontStyle: "bold"});
    }
    this.Score.setOrigin(0.5,0.5)
    this.Score.setDepth(9999);
    this.Score.setScrollFactor(0);

    this.Restart = this.add.text(800, 450+128, "Click here to restart", {fontSize: "32px", color: "#FF0000", fontStyle: "bold"});
    this.Restart.setOrigin(0.5,0.5)
    this.Restart.setDepth(9999);
    this.Restart.setScrollFactor(0);
    this.Restart.setInteractive()
    this.Restart.on('pointerdown', function (pointer){
      this.setTint(0xADD8E6);
    });
    this.Restart.on('pointerout', function (pointer){
      this.clearTint();
    });
    this.Restart.on('pointerup', function (pointer){
      this.clearTint();
      location.reload()
    });
  }
}

// Win Scene
class WinScene extends Phaser.Scene{
  constructor(){
    super("WinScene")
  }

  preload(){
    this.load.image('win', 'static/gamefiles/win.png')
  }

  create(){
    this.win = this.add.image(800, 450, 'win').setInteractive()
    this.win.on('pointerdown', function (pointer){
      this.setTint(0xADD8E6);
    });
    this.win.on('pointerout', function (pointer){
      this.clearTint();
    });
    this.win.on('pointerup', function (pointer){
      this.clearTint();
      this.scene.start("StartScene")
    });
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
    // if (this.scene instanceof PlainsScene){
    //   if (this.x >= 30*64 && this.x <= 79*64 && this.y >= 30*64 && this.y <= 59*64){
    //     this.setAlpha(0.1)
    //   }
    // }
  }

  update(){
    this.setVelocityX(this.velocityX);
    if (this.x > this.maxX && this.scene instanceof StartScene){
      this.x = -320
    }
    if (this.scene.player && this.x > this.scene.player.x + 1600){
      this.x = this.scene.player.x - 900
    }
    if (this.scene.player && this.x < this.scene.player.x - 1600){
      this.x = this.scene.player.x + 600
    }

    // when fog is near the village, slowly vanish and reappear after the village
    if (this.scene instanceof PlainsScene){
      if (this.x >= 30*64-128 && this.x <= 79*64-128 && this.y >= 30*64 && this.y <= 59*64){
        // slowly fade away
        if (this.alpha > 0.1){
          this.setAlpha(this.alpha-0.05)
        }
        else{
          this.setAlpha(0.1)
        }
      }
      else{
        if (this.alpha < 0.65){
          this.setAlpha(this.alpha+0.05)
        }
        else{
          this.setAlpha(0.65)
        }
      }
    }
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
    this.nametext.setOrigin(0,(1+0.25)/2)
    this.nametext.setDepth(1102);
    this.nametext.setScrollFactor(0);

    // add points to the right
    if (playerData.score < 0){
      this.pointstext = this.scene.add.text(x+this.width, y-32, "Score: 0", { font: "32px Press Start 2P", fill: '#000000', fontStyle: "bold"});
    }
    else{
      this.pointstext = this.scene.add.text(x+this.width, y-32, "Score: " + Math.floor(playerData.score), { font: "32px Press Start 2P", fill: '#000000', fontStyle: "bold"});
    }
    this.pointstext.setOrigin(1,0.5)
    this.pointstext.setDepth(1102);
    this.pointstext.setScrollFactor(0);
  }

  update(){
    // decrease the length of the hp bar
    this.displayWidth = (this.player.hp/playerData.hp) * this.width
    this.text.setText(Math.floor(this.player.hp))
    if (playerData.score < 0){
      this.pointstext.setText("Score: 0")
    }
    else{
      this.pointstext.setText("Score: " + Math.floor(playerData.score))
    }
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
      // remove the enemy from the scene
      this.scene.enemies.splice(this.scene.enemies.indexOf(this),1)
      if (this.name == "Marms"){
        playerData.score += 15
      }
      else if (this.name == "Creaks"){
        playerData.score += 5
      }
      else if (this.name == "Cyclops Wolf"){
        playerData.score += 10
      }
      this.destroy()
    }

    // check if hit
    if (this && this.scene && this.scene.physics.overlap(this, this.scene.player.slash)){
      // console.log("hit")
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
  constructor(scene,x,y,id){
    super(scene,x,y,'marms')
    this.name = "Marms"
    this.hp = 100
    this.at = 20
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

    // add name as text
    this.text = this.scene.add.text(this.x, this.y-64-64, "Marms", { font: "16px Press Start 2P", fill: '#FF0000', fontStyle: "bold"});
    this.text.setOrigin(0.5,0.5)
    this.text.setDepth(1009)

    // create small hp bar
    this.hpbar = this.scene.add.sprite(this.x, this.y-64-32-16, 'hpbar');
    this.hpbar.scaleX = 0.2
    this.hpbar.scaleY = 0.5

    // draw thin border around the hp bar
    // this.hpbar.border = this.scene.add.graphics();
    // this.hpbar.border.lineStyle(1, 0x000000, 1);
    // this.hpbar.border.strokeRect(this.x-32, this.y-64-32-16, this.hpbar.width, this.hpbar.height);
    // this.hpbar.border.setScrollFactor(0);
    
    this.hpbar.setOrigin(0.5,0.5)
    this.hpbar.setDepth(1009) 
    // this.hpbar.border.setDepth(1009)
  }
  
  update(){
    // Enemy movements: move slowly towards the player
    this.hpbar.x = this.x
    this.hpbar.y = this.y-64-32-16
    this.hpbar.displayWidth = (this.hp/100) * 64
    if (this.hpbar && this.hp <= 0){
      this.hpbar.destroy()
    }

    this.text.x = this.x
    this.text.y = this.y-64-64
    if (this.text && this.hp <= 0){
      this.text.destroy()
    }

    if (this.paralyse && this.paralyse == true){
      this.setVelocity(0)
      super.update()
    }
    else if (this.scene){

      const speed = 100;
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
            if (this.scene.player.hp <= 0){
              this.scene.scene.start("GameOverScene")
            }
            this.scene.player.setTint(0xff0000)
            if (this.scene.player && this.scene){
              var playervar = this.scene.player
              this.scene.time.delayedCall(1000, () => {
                playervar.clearTint()
              });
            }
            // console.log("hitbyenemy"+this.scene.player.hp)
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
  constructor(scene,x,y,id){
    super(scene,x,y,'creaks')
    this.name = "Creaks"
    this.hp = 70
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

    // add name as text
    this.text = this.scene.add.text(this.x, this.y, "Creaks", { font: "16px Press Start 2P", fill: '#FF0000', fontStyle: "bold"});
    this.text.setOrigin(0.5,0.5)
    this.text.setDepth(1009)

    // create small hp bar
    this.hpbar = this.scene.add.sprite(this.x, this.y-64-16, 'hpbar');
    this.hpbar.scaleX = 0.2
    this.hpbar.scaleY = 0.5

    // draw thin border around the hp bar
    // this.hpbar.border = this.scene.add.graphics();
    // this.hpbar.border.lineStyle(1, 0x000000, 1);
    // this.hpbar.border.strokeRect(this.x-32, this.y-64-32-16, this.hpbar.width, this.hpbar.height);
    // this.hpbar.border.setScrollFactor(0);
    
    this.hpbar.setOrigin(0.5,0.5)
    this.hpbar.setDepth(1009) 
    // this.hpbar.border.setDepth(1009)
  }


  update(){
    // Enemy movements: move slowly towards the player
    this.hpbar.x = this.x
    this.hpbar.y = this.y-32-16
    this.hpbar.displayWidth = (this.hp/70) * 64
    if (this.hpbar && this.hp <= 0){
      this.hpbar.destroy()
    }

    this.text.x = this.x
    this.text.y = this.y-64
    if (this.text && this.hp <= 0){
      this.text.destroy()
    }

    // Enemy movements: move slowly towards the player
    if (this.paralyse && this.paralyse == true){
      this.setVelocity(0)
      super.update()
    }
    else if (this.scene){

      const speed = 150;
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
            if (this.scene.player.hp <= 0){
              this.scene.scene.start("GameOverScene")
            }
            this.scene.player.setTint(0xff0000)
            if (this.scene.player && this.scene){
              var playervar = this.scene.player
              this.scene.time.delayedCall(1000, () => {
                playervar.clearTint()
              });
            }
            // console.log("hitbyenemy"+this.scene.player.hp)
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

class CyclopsWolf extends Enemy{
  constructor(scene,x,y,id){
    super(scene,x,y,'cyclopswolf')
    this.name = "Cyclops Wolf"
    this.hp = 100
    this.at = 15
    this.initPhysics()
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers("cyclopswolf", { start: 0, end: 6 }),
      frameRate: 7,
      repeat: -1
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers("cyclopswolf", { start: 0, end: 6 }),
      frameRate: 7,
      repeat: -1
    });
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers("cyclopswolf", { start: 0, end: 6 }),
      frameRate: 7,
      repeat: -1
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers("cyclopswolf", { start: 0, end: 6 }),
      frameRate: 7,
      repeat: -1
    });

    // add name as text
    this.text = this.scene.add.text(this.x, this.y-32, "CyWolf", { font: "16px Press Start 2P", fill: '#FF0000', fontStyle: "bold"});
    this.text.setOrigin(0.5,0.5)
    this.text.setDepth(1009)

    // create small hp bar
    this.hpbar = this.scene.add.sprite(this.x, this.y-64-32-16, 'hpbar');
    this.hpbar.scaleX = 0.2
    this.hpbar.scaleY = 0.5

    // draw thin border around the hp bar
    // this.hpbar.border = this.scene.add.graphics();
    // this.hpbar.border.lineStyle(1, 0x000000, 1);
    // this.hpbar.border.strokeRect(this.x-32, this.y-64-32-16, this.hpbar.width, this.hpbar.height);
    // this.hpbar.border.setScrollFactor(0);
    
    this.hpbar.setOrigin(0.5,0.5)
    this.hpbar.setDepth(1009) 
    // this.hpbar.border.setDepth(1009)
  }


  update(){
    // Enemy movements: move slowly towards the player
    this.hpbar.x = this.x
    this.hpbar.y = this.y-32-16
    this.hpbar.displayWidth = (this.hp/70) * 64
    if (this.hpbar && this.hp <= 0){
      this.hpbar.destroy()
    }

    this.text.x = this.x
    this.text.y = this.y-64
    if (this.text && this.hp <= 0){
      this.text.destroy()
    }
    // Enemy movements: move slowly towards the player
    if (this.paralyse && this.paralyse == true){
      this.setVelocity(0)
      super.update()
    }
    else if (this.scene){

      const speed = 150;
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
            if (this.scene.player.hp <= 0){
              
              this.scene.scene.start("GameOverScene")
            }
            this.scene.player.setTint(0xff0000)
            if (this.scene.player && this.scene){
              var playervar = this.scene.player
              this.scene.time.delayedCall(1000, () => {
                playervar.clearTint()
              });
            }
            // console.log("hitbyenemy"+this.scene.player.hp)
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
    this.basespeed = 1

    this.hp = playerData.hp
    this.at = playerData.at

    this.initPhysics()
    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('mc', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers('mc', { start: 4, end: 7 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('mc', { start: 8, end: 11 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('mc', { start: 12, end: 15 }),
      frameRate: 8,
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
    if (this.ball){
      // move ball of light from enemy to player at a specific speed
      this.ball.x += (this.x - this.ball.x) * 0.001
      this.ball.y += (this.y - this.ball.y) * 0.001
      if (this.scene.physics.overlap(this.ball, this)){
        this.ball.destroy()
      }
      if (this.scene.physics.collide(this.ball, this)){
        this.ball.destroy()
      }
    }

    const speed = 300 * this.basespeed;
    if (this.body.velocity.clone != 0){
      var prevVelocity = this.body.velocity.clone();
    }

    this.setVelocity(0)
    
    
    const attacking = (this.attackTimer && this.attackTimer.getProgress() < 1);


    // its actuall this.skilling, but too laz to chage
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

      // when collided with terrain, stop moving anim
      // if (this.scene.physics.collide(this, this.scene.terrain)){
      //   console.log("collided")
      //   if (prevVelocity.x < 0) this.setTexture('mc', 12) // move left
      //   else if (prevVelocity.x > 0) this.setTexture('mc', 8) // move right
      //   else if (prevVelocity.y < 0) this.setTexture('mc', 4) // move up
      //   else if (prevVelocity.y > 0) this.setTexture('mc', 0) // move down
      // }
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
        // console.log("i absorb" + this.prevKey)

        // create a circle with a radius of 64 around the player
        this.absorb = this.scene.add.circle(this.x, this.y, 256, 0xADD8E6, 0.5).setDepth(1000);

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
            // console.log("absorbed")
            // turn enmy pale slowly
            // this.scene.time.delayedCall(1000, () => {
            //   this.scene.enemies[i].setTint(0x00ff00)
            // });

            // player and enemy glows blue for 1 seconds
            this.scene.enemies[i].setTint(0x0000ff)
            this.setTint(0x0000ff)
            var enemyvar = this.scene.enemies[i]
            this.scene.time.delayedCall(1000, () => {
              this.clearTint()
              enemyvar.clearTint()
            }
            );

            // ball of light sprite
            // move ball of light from enemy to player

            this.ball = new Phaser.Physics.Arcade.Sprite(this.scene, this.scene.enemies[i].x, this.scene.enemies[i].y, 'ball').setDepth(1000);
            this.scene.physics.add.existing(this.ball)
            this.scene.add.existing(this.ball)

            this.scene.physics.moveToObject(this.ball, this, 300);

            playerData.absorb = this.scene.enemies[i].name

            if (playerData.absorb == "Marms"){
              // fill skill time with light blue
              this.scene.SkillTime.setFillStyle(0x00bfff, 1);
              this.scene.Skilltext.setText("Marms")
            }
            else if (playerData.absorb == "Creaks"){
              // fill skill time with green
              this.scene.SkillTime.setFillStyle(0x00ff00, 1);
              this.scene.Skilltext.setText("Creaks")
            }
            else if (playerData.absorb == "Cyclops Wolf"){
              // fill skill time with yellow
              this.scene.SkillTime.setFillStyle(0xffff00, 1);
              this.scene.Skilltext.setText("CyWolf")
            }

            // console.log(this.scene.enemies[i].id)

            // console.log(playerData.absorb)
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
  
        // Set up a timer for 10 seconds

        this.attackTimer = this.scene.time.delayedCall(990, () => {
          // Reset the timer when it's done
          this.attackTimer = null;
        }
        );
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

        // console.log("j attack" + this.prevKey)
        // create a 64 by 128 rectangle hitbox sprite next to the player with the image slash
        // right
        if (this.prevKey == 'right') {this.slash = new Phaser.Physics.Arcade.Sprite(this.scene, this.x+64, this.y, 'slash').setDepth(1000);}
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
            // console.log("hit")
            // set tint for 0.1 seconds
            var enemyvar = this.scene.enemies[i]
            this.scene.time.delayedCall(1000, () => {
              enemyvar.clearTint()
            }
            );
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
        this.attackTimer = this.scene.time.delayedCall(800, () => {
          // Reset the timer when it's done
          this.attackTimer = null;
        });
      }
    }
    else if (this.scene.keyI.isDown && this.scene instanceof PlainsScene && playerData.absorb != ""){
      this.absorbing = true
      // can only skill every 1 second
      if (!this.absorbTimer || this.absorbTimer.getProgress() === 1) {
        // this.scene.input.keyboard.enabled = false;

        if (prevVelocity.x < 0) this.setTexture('mc', 12) // move left
        else if (prevVelocity.x > 0) this.setTexture('mc', 8) // move right
        else if (prevVelocity.y < 0) this.setTexture('mc', 4) // move up
        else if (prevVelocity.y > 0) this.setTexture('mc', 0) // move down

        // this.setVelocity(0)

        // Play the sound
        this.scene.sound.play('bing');

        // console.log("skill" + this.prevKey)

        if (playerData.absorb == "Marms"){
          this.skillcd = 3500
          

          // console.log("marms")
          this.at += 10
          // turn player red
          // this.setTint(0xff0000)
          

          // // big punch while rushi forward
          this.scene.physics.moveTo(this, this.x+500, this.y, 500);
          this.scene.time.delayedCall(500, () => {
            this.setVelocity(0)
          });
          // check for overlap with enemies
          // punch sprite

          // right
          if (this.prevKey == 'right') {this.punch = new Phaser.Physics.Arcade.Sprite(this.scene, this.x+64, this.y, 'marmpunch').setDepth(1000);}
          // left (flip vertically)
          else if (this.prevKey == 'left') this.punch = new Phaser.Physics.Arcade.Sprite(this.scene, this.x-64, this.y, 'marmpunch').setDepth(1000).setAngle(180)
          // down
          else if (this.prevKey == 'down') this.punch = new Phaser.Physics.Arcade.Sprite(this.scene, this.x, this.y+64+16, 'marmpunch').setDepth(1000).setAngle(90)
          // up
          else this.punch = new Phaser.Physics.Arcade.Sprite(this.scene, this.x, this.y-64-16, 'marmpunch').setDepth(1000).setAngle(-90)


          // // color it red
          this.scene.physics.add.existing(this.punch)
          this.scene.add.existing(this.punch)
          this.punch.anims.create({
            key: 'marmpunch',
            frames: this.anims.generateFrameNumbers('marmpunch', { start: 0, end: 3 }),
            frameRate: 6,
            repeat: -1
          });
          // play anim for 0.5 seconds
          this.punch.anims.play('marmpunch', true);
          
          // check if the punch is overlapping with any enemies and if so console log hit
          this.temp = []
          for (var i=0; i<this.scene.enemies.length; i++){
            if (this.scene.physics.overlap(this.punch, this.scene.enemies[i])){
              // console.log("hit")
              // set tint for 0.1 seconds
              this.scene.enemies[i].setTint(0xff0000)
              this.scene.enemies[i].hp -= this.at
              this.scene.enemies[i].paralyse = true
              this.temp.push(this.scene.enemies[i])
              // knockback enemies
              // this.scene.physics.moveTo(this.scene.enemies[i], this.x, this.y, -500);
              this.scene.time.delayedCall(500, () => {
                for (var j=0; j<this.temp.length; j++){
                  this.temp[j].paralyse = false
                  this.temp[j].clearTint()
                }
              });
            }
          }

          this.scene.time.delayedCall(1000, () => {
            this.at = 10
            this.clearTint()
            // clear enemy tint
            for (var i=0; i<this.scene.enemies.length; i++){
              if (this.scene.physics.overlap(this.punch, this.scene.enemies[i])){
                // console.log("hit")
                // set tint for 0.1 seconds
                this.scene.enemies[i].clearTint()
  
              }
            }
            this.punch.destroy()
          }
          );

        }
        else if (playerData.absorb == "Creaks"){
          this.skillcd = 10000

          this.basespeed = 2
          // give random tint to player every 0.1 seconds for 5 seconds
          this.scene.time.addEvent({
            delay: 100,
            callback: () => {
              this.setTint(Phaser.Math.Between(0, 0xFFFFFF));
            },
            repeat: 46
          });

          // add 2 hp every 1 seconds for 5 seconds
          this.scene.time.addEvent({
            delay: 1000,
            callback: () => {
              if (this.hp < playerData.hp){
                this.hp += 2
              }
            },
            repeat: 4
          });


          //setTimeout 5 sec
          setTimeout(() => {
            this.basespeed = 1
            this.clearTint()
          }
          , 5000);
          // playerData.absorb.splice(playerData.absorb.indexOf(2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20),1)
        }
        else if (playerData.absorb == "Cyclops Wolf"){
          this.skillcd = 10000

          // console.log("cyclops wolf")
          // increase vision radius for 5 seconds
          this.scene.vision.scale = 2.5
          //setTimeout 5 sec
          setTimeout(() => {
            this.scene.vision.scale = 1.5
          }
          , 5000);

          // paralyse all enemies close to player for 5 seconds
          for (var i=0; i<this.scene.enemies.length; i++){
            if (Phaser.Math.Distance.Between(this.x, this.y, this.scene.enemies[i].x, this.scene.enemies[i].y) <= 500){
              this.scene.enemies[i].paralyse = true
              // set color to yellow
              this.scene.enemies[i].setTint(0xffff00)
            }
          }
          //setTimeout 5 sec
          setTimeout(() => {
            for (var i=0; i<this.scene.enemies.length; i++){
              this.scene.enemies[i].paralyse = false
              this.scene.enemies[i].clearTint()
            }
          }
          , 2000);
        }
        else if (playerData.absorb == "GODMODE"){
          // kill all enemies
          for (var i=0; i<this.scene.enemies.length; i++){
            this.scene.enemies[i].hp = 0
          }
        }
        

        // this.scene.input.keyboard.enabled = true;
        // check for input again
        // this.scene.input.keyboard.update();
        // this.velocityX = prevVelocity.x
        // this.velocityY = prevVelocity.y
  
        // Set up a timer for 2 seconds
        this.absorbTimer = this.scene.time.delayedCall(this.skillcd, () => {
          // Reset the timer when it's done
          this.absorbTimer = null;
          // color the skill text back to black
          this.scene.Skilltext.setFill('#000000');
          this.scene.Skilltext.setAlpha(1)
          this.scene.SkillTime.setAlpha(1)
        });
      }
    }


    if (this.hp <= 0){
      // this.scene.events.off('update', this.update, this)
      // playerData.x = 24*64
      // playerData.y = 22*32
      // playerData.wave = 0
      // this.scene.foggyplains.stop()
      // Refresh the page
      this.scene.scene.start("GameOverScene")
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
  scene:[StartScene, PlainsScene, VillageScene, GameOverScene],
  autoCenter:true,
}
  
var Game = new Phaser.Game(config);