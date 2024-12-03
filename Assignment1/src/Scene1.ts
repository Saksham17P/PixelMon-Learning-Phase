import Phaser from "phaser";

export default class Scene1 extends Phaser.Scene{
    private score: number = 0;
    private highScore: number = 0;
    private scoreText: Phaser.GameObjects.Text;
    private highScoreText: Phaser.GameObjects.Text;
    private resetText: Phaser.GameObjects.Text;


    constructor(){
        super("Scene1");
    }

    preload(){
        this.load.image('tiles', 'assets/tilesets/Map.png');
        this.load.tilemapTiledJSON('map', 'assets/maps/Mapping.json');
        this.load.atlas('char', 'assets/elements/fauna.png','assets/elements/fauna.json');  
        this.load.spritesheet('coin', 'assets/elements/coin2.png', {
            frameWidth: 16, 
            frameHeight: 16 
        });
    }

    create(){
        this.highScore = parseInt(localStorage.getItem('highScore') || '0', 10);

        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('Map', 'tiles');
        const GroundLayer = map.createLayer('Ground', tileset, 0, 0);
        const ObstaclesLayer = map.createLayer('Obstacles', tileset, 0, 0);

        ObstaclesLayer.setCollisionByExclusion([-1]);

        const player = this.player = this.physics.add.sprite(50,50, 'char','walk-down-3.png');
        this.player.setScale(1.25);
        this.player.body.setSize(this.player.width = 22, this.player.height = 22);

        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.cameras.main.startFollow(this.player); 
        this.cameras.main.setZoom(1);
        this.physics.add.collider(this.player, ObstaclesLayer);
        
        this.anims.create({
            key : 'faune-idle-down',
            frames : [{
                key : 'char',
                frame : 'walk-down-3.png'
            }]
        });

        this.anims.create({
            key : 'faune-idle-up',
            frames : [{
                key : 'char',
                frame : 'walk-up-3.png'
            }]
        });

        this.anims.create({
            key : 'faune-idle-side',
            frames : [{
                key : 'char',
                frame : 'walk-side-3.png'
            }]
        });

        this.anims.create({
            key : 'faune-run-down',
            frames : this.anims.generateFrameNames('char',{
                start : 1,
                end : 8,
                prefix : 'run-down-',
                suffix : '.png'
            }),
            repeat : -1
        });

        this.anims.create({
            key : 'faune-run-up',
            frames : this.anims.generateFrameNames('char',{
                start : 1,
                end : 8,
                prefix : 'run-up-',
                suffix : '.png'
            }),
            repeat : -1
        });

        this.anims.create({
            key : 'faune-run-side',
            frames : this.anims.generateFrameNames('char',{
                start : 1,
                end : 8,
                prefix : 'run-side-',
                suffix : '.png'
            }),
            repeat : -1
        });

        this.coins = this.physics.add.group({
            key: 'coin',
            repeat: 19, // Total number of coins
            setXY: { x: 0, y: 0, stepX: 0, stepY: 0 } 
        });

        this.anims.create({
            key: 'spin',
            frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 14 }), 
            frameRate: 10,
            repeat: -1
        });

        this.coins.children.iterate((coin) => {
            let positionFound = false;
            while (!positionFound) {
                const randomX = Phaser.Math.Between(50, this.scale.width - 50);
                const randomY = Phaser.Math.Between(50, this.scale.height - 50);
                const tile = ObstaclesLayer.getTileAtWorldXY(randomX, randomY);

                if (!tile || !tile.collides) {
                    coin.setPosition(randomX, randomY);
                    coin.play('spin'); 
                    positionFound = true; 
                }
            }
            return coin;
        });

        this.coins.children.iterate((coin: Phaser.GameObjects.GameObject) => {
            (coin as Phaser.Physics.Arcade.Sprite).play('spin');
            (coin as Phaser.Physics.Arcade.Sprite).setScale(0.75);
        });

        this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);

        this.scoreText = this.add.text(20, 20, 'Score: 0', {
            fontSize: '20px',  // Adjust as needed
            fill: '#ffffff'
        }).setScrollFactor(0).setDepth(100);

        this.highScoreText = this.add.text(20, 50, 'High Score: ' + this.highScore, { 
            fontSize: '20px', 
            fill: '#ffff00' 
        }).setScrollFactor(0).setDepth(100);

        this.resetText = this.add.text(20, 80, 'Press SPACE to reset the high score', {
            fontSize: '18px',
            fill: '#ff0000'
        }).setScrollFactor(0).setDepth(100);

        this.cameras.main.on('camerazoom', (camera, zoom) => {
            this.scoreText.setScale(1 / zoom);
            this.highScoreText.setScale(1 / zoom);
            this.resetText.setScale(1 / zoom);
        });

        player.anims.play('faune-idle-side');

    }

    collectCoin(player: Phaser.GameObjects.GameObject, coin: Phaser.GameObjects.GameObject) {
        coin.destroy();
        this.score += 10;
        this.scoreText.setText('Score: ' + this.score);
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreText.setText('High Score: ' + this.highScore);

            localStorage.setItem('highScore', this.highScore.toString());
        }
    }
    

    update(){

        this.player.setVelocity(0);

        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.anims.play('faune-run-side','true');
            this.player.scaleX = -1.25;
            this.player.body.offset.x = 25;
        } 

        else if (this.cursors.right.isDown) {
            this.player.anims.play('faune-run-side','true');
            this.player.setVelocityX(160);
            this.player.scaleX = 1.25;
            this.player.body.offset.x = 3;
        }

        else if (this.cursors.up.isDown) {
            this.player.anims.play('faune-run-up','true');
            this.player.setVelocityY(-160);    
        } 

        else if (this.cursors.down.isDown) {
            this.player.anims.play('faune-run-down','true');
            this.player.setVelocityY(160);
            this.player.body.offset.y = 6;    
        }

        else{
            const parts = this.player.anims.currentAnim.key.split('-');
            parts[1] = 'idle';
            this.player.play(parts.join('-'));   
        } 

        this.input.keyboard.on('keydown-SPACE', () => {
            localStorage.removeItem('highScore');
            this.highScore = 0;
            this.highScoreText.setText('High Score: ' + this.highScore);
        });     
    }
}



