class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        // Create title screen
        this.add.rectangle(400, 300, 800, 600, 0x000000);
        
        // Title
        this.add.text(400, 150, 'UNDERTALE SANS BATTLE', {
            fontSize: '40px',
            fill: '#fff'
        }).setOrigin(0.5);
        
        // Instructions
        this.add.text(400, 250, 'Dodge the bones by jumping!', {
            fontSize: '24px',
            fill: '#fff'
        }).setOrigin(0.5);
        
        this.add.text(400, 300, 'Press SPACE to jump', {
            fontSize: '20px',
            fill: '#fff'
        }).setOrigin(0.5);
        
        // Start game button
        const startButton = this.add.text(400, 400, 'START GAME', {
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
        
        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });
        
        // Add hover effect
        startButton.on('pointerover', () => {
            startButton.setStyle({ fill: '#ff0' });
        });
        
        startButton.on('pointerout', () => {
            startButton.setStyle({ fill: '#fff' });
        });
    }
}