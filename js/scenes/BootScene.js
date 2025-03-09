class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Load all game assets
        this.load.image('background', 'assets/images/background.png');
        this.load.image('title-screen', 'assets/images/title-screen.png');
        this.load.image('heart', 'assets/images/heart.png');
        this.load.image('bone', 'assets/images/bone.png');
        
        // Add loading bar if needed
        const loadingBar = this.add.graphics();
        this.load.on('progress', (value) => {
            loadingBar.clear();
            loadingBar.fillStyle(0xffffff, 1);
            loadingBar.fillRect(this.cameras.main.width / 4, this.cameras.main.height / 2, 
                                this.cameras.main.width / 2 * value, 20);
        });
        
        this.load.on('complete', () => {
            loadingBar.destroy();
            this.scene.start('TitleScene');
        });
    }
}