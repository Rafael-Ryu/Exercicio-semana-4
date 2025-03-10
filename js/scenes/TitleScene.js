class TitleScene extends Phaser.Scene {
  constructor() {
    super("TitleScene");
  }

  create() {
    // Background escuro
    this.cameras.main.setBackgroundColor("#000000");

    // Carrega o high score
    const highScore = parseInt(localStorage.getItem("highScore")) || 0;

    // Título do jogo
    const titleText = this.add
      .text(400, 100, "Fuja dos Ossos", {
        fontSize: "64px",
        fontFamily: "Arial Black",
        fill: "#ffffff",
        stroke: "#ff3333",
        strokeThickness: 8,
        shadow: {
          offsetX: 2,
          offsetY: 2,
          color: "#000000",
          blur: 5,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5);

    // Efeito de pulsação no título
    this.tweens.add({
      targets: titleText,
      scale: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Descrição do jogo
    this.add
      .text(
        400,
        200,
        "Sobreviva o maior tempo possível desviando dos ossos voadores",
        {
          fontSize: "20px",
          fill: "#ffffff",
          align: "center",
          lineSpacing: 10,
        }
      )
      .setOrigin(0.5);

    // Controles
    this.add
      .text(400, 280, "CONTROLES:", {
        fontSize: "24px",
        fontWeight: "bold",
        fill: "#ffff00",
      })
      .setOrigin(0.5);

    // Lista de controles
    const controlsText = [
      "• Setas para cima (↑): Move o personagem para cima",
      "• Setas para baixo (↓): Move o personagem para baixo",
      "• Setas para esquerda (←): Move o personagem para esquerda",
      "• Setas para direita (→): Move o personagem para direita",
    ];

    let yPos = 320;
    controlsText.forEach((text) => {
      this.add
        .text(400, yPos, text, {
          fontSize: "18px",
          fill: "#ffffff",
        })
        .setOrigin(0.5);
      yPos += 30;
    });

    // Mostrar high score
    this.add
      .text(400, 520, `Recorde atual: ${highScore}`, {
        fontSize: "24px",
        fill: "#ffff00",
        fontStyle: "italic",
      })
      .setOrigin(0.5);

    // Instrução para começar o jogo
    const startText = this.add
      .text(400, 570, "Clique para começar", {
        fontSize: "28px",
        fill: "#ffffff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5);

    // Efeito de piscar no texto de início
    this.tweens.add({
      targets: startText,
      alpha: 0.5,
      duration: 800,
      ease: "Power1",
      yoyo: true,
      repeat: -1,
    });

    // Adicionar interação de clique para iniciar o jogo
    this.input.on("pointerdown", () => {
      this.scene.start("GameScene");
    });

    // Permitir iniciar o jogo com a tecla de espaço também
    this.input.keyboard.on("keydown-SPACE", () => {
      this.scene.start("GameScene");
    });
  }
}
