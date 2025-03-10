class GameScene extends Phaser.Scene {
  constructor() {
    super("GameScene");
    this.player = null;
    this.bones = null;
    this.score = 0;
    this.highScore = 0;
    this.scoreText = null;
    this.highScoreText = null;
    this.gameOver = false;

    // Variáveis para controlar a dificuldade
    this.boneSpawnDelay = 1500; // Delay inicial entre os spawns
    this.minSpawnDelay = 300; // Delay mínimo entre os spawns
    this.spawnTimer = null; // Timer para gerar os ossos
    this.difficulty = 1; // Nível de dificuldade inicial
    this.difficultyTimer = null; // Timer para aumentar a dificuldade
    this.gameTime = 0; // Tempo de jogo em segundos

    // Controle para evitar spawns repetidos
    this.lastSpawnPoints = []; // Armazena os últimos pontos de spawn
    this.maxLastSpawnPoints = 3; // Quantos pontos de spawn anteriores armazenar
  }

  preload() {
    // Os ossos são do jogo "Undertale" por Toby Fox
    this.load.image("bone", "assets/osso.png");
    this.load.spritesheet("personagem", "assets/personagem.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    // Background escuro
    this.cameras.main.setBackgroundColor("#000000");

    // Carrega o high score
    this.highScore = parseInt(localStorage.getItem("highScore")) || 0;

    // Pontuação atual
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      fill: "#fff",
    });

    // High Score
    this.highScoreText = this.add.text(
      16,
      56,
      `High Score: ${this.highScore}`,
      {
        fontSize: "24px",
        fill: "#ffff00",
      }
    );

    // Cria o personagem
    this.player = this.physics.add.sprite(400, 300, "personagem");
    this.player.setCollideWorldBounds(true);

    // Ajusta o tamando do jogador
    this.player.body.setSize(24, 32);
    this.player.body.offset.y = 16;

    // Animações do jogador
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("personagem", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "personagem", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("personagem", {
        start: 5,
        end: 8,
      }),
      frameRate: 10,
      repeat: -1,
    });

    // O jogador começa com a animação de virado para frente
    this.player.anims.play("turn");

    // Cria o grupo dos ossos
    this.bones = this.physics.add.group();

    // Colisões entre o jogador e os ossos
    this.physics.add.collider(
      this.player,
      this.bones,
      this.hitBone,
      null,
      this
    );

    // Limpa o histórico de spawn points
    this.lastSpawnPoints = [];

    // Timer para gerar os ossos
    this.setupBoneSpawnTimer();

    // Timer para aumentar a dificuldade a cada 5 segundos
    this.difficultyTimer = this.time.addEvent({
      delay: 5000,
      callback: this.increaseDifficulty,
      callbackScope: this,
      loop: true,
    });

    // Timer para contar o tempo de jogo
    this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.gameOver) this.gameTime++;
      },
      callbackScope: this,
      loop: true,
    });

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys();

    // Reiniciar a pontuação e dificuldade
    this.score = 0;
    this.scoreText.setText("Score: 0");
    this.difficulty = 1;
    this.boneSpawnDelay = 1500;
    this.gameTime = 0;
  }

  update() {
    if (this.gameOver) {
      return;
    }

    // Movimento do jogador com as animações
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    // Movimento vertical (sem afetar as animações horizontais)
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(200);
    } else {
      this.player.setVelocityY(0);
    }

    // Removendo os ossos que saíram da tela
    this.bones.getChildren().forEach((bone) => {
      if (bone.x < -50 || bone.x > 850 || bone.y < -50 || bone.y > 650) {
        bone.destroy();
        this.increaseScore(10);
      }
    });
  }

  // Configura o timer de spawn de ossos com base na dificuldade atual
  setupBoneSpawnTimer() {
    // Se já existir um timer, destrua-o
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }

    // Cria um novo timer com o delay atual
    this.spawnTimer = this.time.addEvent({
      delay: this.boneSpawnDelay,
      callback: this.spawnBones,
      callbackScope: this,
      loop: true,
    });
  }

  // Aumenta a dificuldade do jogo
  increaseDifficulty() {
    if (this.gameOver) return;

    this.difficulty++;

    // Reduz o tempo entre os spawns dos ossos
    this.boneSpawnDelay = Math.max(
      this.minSpawnDelay,
      this.boneSpawnDelay - 100
    );

    // Reconfigura o timer com o novo delay
    this.setupBoneSpawnTimer();
  }

  spawnBones() {
    if (this.gameOver) return;

    // Número de ossos a serem spawnados de uma vez, baseado na dificuldade
    const bonesCount = Math.min(4, Math.floor(this.difficulty / 2) + 1);

    // Para cada osso, garantir que venha de diferentes direções
    let usedSpawnPoints = [];

    for (let i = 0; i < bonesCount; i++) {
      // Usamos todos os possíveis pontos de spawn, incluindo os cantos
      const spawnPoint = this.getUniqueSpawnPoint(usedSpawnPoints);
      usedSpawnPoints.push(spawnPoint);
      this.spawnSingleBone(spawnPoint);
    }
  }

  // Método para obter um ponto de spawn que não foi usado recentemente
  getUniqueSpawnPoint(currentlyUsed) {
    // Pontos possíveis:
    // 1-4: lados normais (esquerda, direita, topo, baixo)
    // 5-8: cantos (superior-esquerdo, superior-direito, inferior-esquerdo, inferior-direito)
    let availablePoints = [1, 2, 3, 4, 5, 6, 7, 8];

    // Remove os pontos que foram usados nos últimos spawns
    const pointsToAvoid = [...this.lastSpawnPoints, ...currentlyUsed];
    availablePoints = availablePoints.filter(
      (point) => !pointsToAvoid.includes(point)
    );

    // Se não houver pontos disponíveis, usa qualquer ponto, a não ser o último
    if (availablePoints.length === 0) {
      availablePoints = [1, 2, 3, 4, 5, 6, 7, 8];
      availablePoints = availablePoints.filter(
        (point) => !currentlyUsed.includes(point)
      );

      // Se ainda não houver pontos disponíveis, usa qualquer ponto
      if (availablePoints.length === 0) {
        availablePoints = [1, 2, 3, 4, 5, 6, 7, 8];
      }
    }

    // Escolhe um ponto aleatório dentre os disponíveis
    const randomIndex = Phaser.Math.Between(0, availablePoints.length - 1);
    const chosenPoint = availablePoints[randomIndex];

    // Atualiza o histórico de pontos de spawn
    this.lastSpawnPoints.push(chosenPoint);
    if (this.lastSpawnPoints.length > this.maxLastSpawnPoints) {
      this.lastSpawnPoints.shift(); // Remove o ponto mais antigo
    }

    return chosenPoint;
  }

  // Método para gerar um único osso de um ponto específico
  spawnSingleBone(spawnPoint) {
    let x, y, velocityX, velocityY;

    // Fator de velocidade baseado na dificuldade
    const speedFactor = 1 + this.difficulty * 0.05;

    switch (spawnPoint) {
      // Pontos de spawn normais (lados)
      case 1: // Esquerda
        x = -10;
        y = Phaser.Math.Between(100, 500);
        velocityX = Phaser.Math.Between(200, 300) * speedFactor;
        velocityY = 0;
        break;
      case 2: // Direita
        x = 810;
        y = Phaser.Math.Between(100, 500);
        velocityX = Phaser.Math.Between(-300, -200) * speedFactor;
        velocityY = 0;
        break;
      case 3: // Topo
        x = Phaser.Math.Between(100, 700);
        y = -10;
        velocityX = 0;
        velocityY = Phaser.Math.Between(200, 300) * speedFactor;
        break;
      case 4: // Baixo
        x = Phaser.Math.Between(100, 700);
        y = 610;
        velocityX = 0;
        velocityY = Phaser.Math.Between(-300, -200) * speedFactor;
        break;

      // Pontos de spawn dos cantos
      case 5: // Canto superior esquerdo
        x = -10;
        y = -10;
        velocityX = Phaser.Math.Between(150, 250) * speedFactor;
        velocityY = Phaser.Math.Between(150, 250) * speedFactor;
        break;
      case 6: // Canto superior direito
        x = 810;
        y = -10;
        velocityX = Phaser.Math.Between(-250, -150) * speedFactor;
        velocityY = Phaser.Math.Between(150, 250) * speedFactor;
        break;
      case 7: // Canto inferior esquerdo
        x = -10;
        y = 610;
        velocityX = Phaser.Math.Between(150, 250) * speedFactor;
        velocityY = Phaser.Math.Between(-250, -150) * speedFactor;
        break;
      case 8: // Canto inferior direito
        x = 810;
        y = 610;
        velocityX = Phaser.Math.Between(-250, -150) * speedFactor;
        velocityY = Phaser.Math.Between(-250, -150) * speedFactor;
        break;
    }

    // Cria o osso
    const bone = this.bones.create(x, y, "bone");

    // Configura o osso
    bone.setVelocity(velocityX, velocityY);

    // Adiciona  rotação para efeito visual
    bone.setAngularVelocity(Phaser.Math.Between(-100, 100));

    // Ajusta o tamanho do osso
    bone.setScale(0.7);
  }

  hitBone(player, bone) {
    // Para a física do jogo
    this.physics.pause();

    // Deixa o jogador vermelho
    player.setTint(0xff0000);

    // Define o jogo como terminado
    this.gameOver = true;

    // Para os timers de dificuldade e spawn
    if (this.difficultyTimer) {
      this.difficultyTimer.remove();
    }
    if (this.spawnTimer) {
      this.spawnTimer.remove();
    }

    // Verifica se é um novo recorde
    let newHighScore = false;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem("highScore", this.highScore);
      newHighScore = true;
    }

    // Cria um painel de fundo escuro para a tela de fim de jogo
    const gameOverPanel = this.add.rectangle(400, 300, 500, 250, 0x000000, 0.8);
    gameOverPanel.setStrokeStyle(4, 0xff0000);

    // Adiciona texto de Game Over
    const gameOverText = this.add
      .text(400, 240, "GAME OVER", {
        fontSize: "64px",
        fill: "#ff0000",
        fontFamily: "Arial Black",
        stroke: "#ffffff",
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    // Adiciona a pontuação final
    const finalScore = this.add
      .text(400, 300, `Pontuação: ${this.score}`, {
        fontSize: "32px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    // Se for um novo recorde, exibe uma mensagem
    if (newHighScore) {
      const newRecordText = this.add
        .text(400, 340, "NOVO RECORDE!", {
          fontSize: "28px",
          fill: "#ffff00",
          fontStyle: "italic",
        })
        .setOrigin(0.5);

      // Efeito de pulsação no texto de novo recorde
      this.tweens.add({
        targets: newRecordText,
        scale: 1.2,
        duration: 500,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });
    } else {
      // Mostra o recorde atual
      this.add
        .text(400, 340, `Melhor Pontuação: ${this.highScore}`, {
          fontSize: "24px",
          fill: "#ffff00",
        })
        .setOrigin(0.5);
    }

    // Adiciona instrução para reiniciar
    const restartText = this.add
      .text(400, 380, "Clique para tentar novamente", {
        fontSize: "24px",
        fill: "#ffffff",
      })
      .setOrigin(0.5);

    // Efeito de piscagem no texto de reinício
    this.tweens.add({
      targets: restartText,
      alpha: 0.5,
      duration: 800,
      ease: "Power1",
      yoyo: true,
      repeat: -1,
    });

    // Remove qualquer listener de "clicar" anterior para evitar múltiplas chamadas
    this.input.removeAllListeners("pointerdown");

    // Adiciona a interação de clique para reiniciar o jogo
    this.input.once("pointerdown", () => {
      // Reinicia completamente a cena
      this.gameOver = false;
      this.scene.restart();
    });
  }

  increaseScore(amount) {
    this.score += amount;
    this.scoreText.setText("Score: " + this.score);

    // Verifica se é um novo recorde durante o jogo
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.highScoreText.setText("High Score: " + this.highScore);
      localStorage.setItem("highScore", this.highScore);
    }
  }
}
