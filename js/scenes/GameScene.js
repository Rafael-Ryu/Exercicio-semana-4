class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.score = 0;
        this.boneSpeed = 300;
        this.boneFrequency = 1500; // milliseconds
        this.gameOver = false;
    }

    create() {
        // Set background
        this.add.rectangle(400, 300, 800, 600, 0x000000);
        
        // Create battle box (the area where the heart can move)
        const battleBox = this.add.rectangle(400, 400, 300, 200, 0x000000);
        battleBox.setStrokeStyle(4, 0xffffff);
        
        // Create player (heart)
        this.player = this.physics.add.sprite(400, 450, 'heart');
        this.player.setScale(0.1); // Adjust based on your sprite size
        this.player.setBounce(0.1);
        this.player.setCollideWorldBounds(true);
        
        // Set bounds for the player (within the battle box)
        this.player.setMaxVelocity(300, 1000);
        
        // Create invisible platform for the player to stand on
        this.ground = this.physics.add.staticGroup();
        this.ground.create(400, 500, 'bone').setScale(10, 0.1).refreshBody().visible = false;
        
        // Collision between player and ground
        this.physics.add.collider(this.player, this.ground);
        
        // Create bone group
        this.bones = this.physics.add.group();
        
        // Start spawning bones
        this.boneTimer = this.time.addEvent({
            delay: this.boneFrequency,
            callback: this.spawnBone,
            callbackScope: this,
            loop: true
        });

        // Add score text
        this.scoreText = this.add.text(16, 16, 'Score: 0', { 
            fontSize: '24px', 
            fill: '#fff' 
        });
        
        // Input controls
        this.jumpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Setup collisions
        this.physics.add.overlap(this.player, this.bones, this.hitBone, null, this);
        
        // Create a score timer (1 point per second)
        this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (!this.gameOver) {
                    this.score++;
                    this.scoreText.setText('Score: ' + this.score);
                    
                    // Every 10 points, increase difficulty
                    if (this.score % 10 === 0) {
                        this.increaseDifficulty();
                    }
                }
            },
            callbackScope: this,
            loop: true
        });
    }

    update() {
        if (this.gameOver) {
            return;
        }
        
        // Jump control
        if (this.jumpKey.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-500);
            
            // Add a small "flash" effect when jumping
            this.player.setTint(0xff0000);
            this.time.delayedCall(100, () => {
                this.player.clearTint();
            });
        }
        
        // Remove bones that are off-screen
        this.bones.getChildren().forEach(bone => {
            if (bone.x < -50 || bone.x > 850) {
                bone.destroy();
            }
        });
    }
    
    spawnBone() {
        if (this.gameOver) return;
        
        // Randomly decide if bone comes from left or right
        const fromRight = Phaser.Math.Between(0, 1) === 1;
        
        // Create the bone
        const x = fromRight ? 850 : -50;
        const bone = this.bones.create(x, 480, 'bone');
        bone.setScale(0.2); // Adjust based on your sprite size
        
        // Set velocity
        const velocity = fromRight ? -this.boneSpeed : this.boneSpeed;
        bone.setVelocityX(velocity);
        
        // Add rotation animation for effect
        this.tweens.add({
            targets: bone,
            rotation: fromRight ? -0.2 : 0.2,
            duration: 100,
            yoyo: true,
            repeat: -1
        });
    }
    
    hitBone(player, bone) {
        this.gameOver = true;
        
        // Flash player red
        this.tweens.add({
            targets: player,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                // Stop all bones
                this.bones.getChildren().forEach(bone => {
                    bone.setVelocityX(0);
                });
                
                // Show game over text
                const gameOverText = this.add.text(400, 300, 'GAME OVER', {
                    fontSize: '48px',
                    fill: '#fff'
                }).setOrigin(0.5);
                
                // Show score
                this.add.text(400, 350, `Score: ${this.score}`, {
                    fontSize: '24px',
                    fill: '#fff'
                }).setOrigin(0.5);
                
                // Restart button
                const restartButton = this.add.text(400, 400, 'PLAY AGAIN', {
                    fontSize: '26px',
                    fill: '#fff',
                    backgroundColor: '#800020',
                    padding: {
                        left: 15,
                        right: 15,
                        top: 10,
                        bottom: 10
                    }
                }).setOrigin(0.5).setInteractive();
                
                restartButton.on('pointerdown', () => {
                    this.scene.restart();
                    this.score = 0;
                    this.boneSpeed = 300;
                    this.boneFrequency = 1500;
                    this.gameOver = false;
                });
            }
        });
    }
    
    increaseDifficulty() {
        // Increase bone speed
        this.boneSpeed += 50;
        
        // Decrease spawn time (increase frequency)
        this.boneFrequency = Math.max(500, this.boneFrequency - 100);
        this.boneTimer.delay = this.boneFrequency;
    }
}