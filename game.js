class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.points = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.bird = {
            x: 50,
            y: this.canvas.height / 2,
            width: 60,
            height: 60,
            velocity: 0,
            gravity: 0.5,
            jump: -10
        };
        this.pipes = [];
        this.pipeWidth = 50;
        this.initialPipeGap = 250;
        this.pipeGap = this.initialPipeGap;
        this.pipeInterval = 1500;
        this.lastPipeTime = 0;
        this.gapDecreaseRate = 2;
        this.gapDecreaseCount = 0;
        this.maxGapDecreases = 6;
        
        // Carregar a imagem do logo
        this.birdImage = new Image();
        this.birdImage.src = 'logo.png';
        
        this.init();
    }

    init() {
        this.updatePoints();
        this.setupEventListeners();
        this.gameLoop();
    }

    setupEventListeners() {
        // Prevenir o comportamento padrão da barra de espaço
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (!this.gameStarted) {
                    this.gameStarted = true;
                } else if (!this.gameOver) {
                    this.bird.velocity = this.bird.jump;
                } else {
                    this.resetGame();
                }
            }
        });
    }

    updatePoints() {
        document.getElementById('points').textContent = this.points;
    }

    resetGame() {
        this.points = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.bird.y = this.canvas.height / 2;
        this.bird.velocity = 0;
        this.pipes = [];
        this.pipeGap = this.initialPipeGap;
        this.gapDecreaseCount = 0;
        this.updatePoints();
    }

    drawBird() {
        if (this.birdImage.complete) {
            this.ctx.drawImage(this.birdImage, this.bird.x, this.bird.y, this.bird.width, this.bird.height);
        } else {
            // Fallback para caso a imagem não carregue
            this.ctx.fillStyle = '#FF5959';
            this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);
        }
    }

    drawPipes() {
        this.ctx.fillStyle = '#12171A';
        this.pipes.forEach(pipe => {
            // Pipe superior
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.top);
            // Pipe inferior
            this.ctx.fillRect(pipe.x, pipe.top + this.pipeGap, this.pipeWidth, this.canvas.height);
        });
    }

    updatePipes() {
        const now = Date.now();
        if (now - this.lastPipeTime > this.pipeInterval) {
            const topHeight = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
            this.pipes.push({
                x: this.canvas.width,
                top: topHeight
            });
            this.lastPipeTime = now;
            
            // Diminuir o gap entre os pipes apenas 6 vezes
            if (this.gapDecreaseCount < this.maxGapDecreases) {
                this.pipeGap -= this.gapDecreaseRate;
                this.gapDecreaseCount++;
            }
        }

        this.pipes = this.pipes.filter(pipe => {
            pipe.x -= 2;
            return pipe.x > -this.pipeWidth;
        });
    }

    checkCollision() {
        // Colisão com o chão ou teto
        if (this.bird.y <= 0 || this.bird.y + this.bird.height >= this.canvas.height) {
            this.gameOver = true;
            return;
        }

        // Colisão com os pipes
        for (const pipe of this.pipes) {
            if (
                this.bird.x + this.bird.width > pipe.x &&
                this.bird.x < pipe.x + this.pipeWidth &&
                (this.bird.y < pipe.top || this.bird.y + this.bird.height > pipe.top + this.pipeGap)
            ) {
                this.gameOver = true;
                return;
            }

            // Pontuação
            if (pipe.x + this.pipeWidth === this.bird.x) {
                this.points++;
                this.updatePoints();
            }
        }
    }

    gameLoop() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.gameStarted) {
            this.ctx.fillStyle = '#12171A';
            this.ctx.font = '30px Arial';
            this.ctx.fillText('Pressione Espaço para começar', this.canvas.width / 2 - 200, this.canvas.height / 2);
            this.drawBird();
        } else if (!this.gameOver) {
            // Atualiza a posição do pássaro
            this.bird.velocity += this.bird.gravity;
            this.bird.y += this.bird.velocity;

            this.updatePipes();
            this.drawPipes();
            this.drawBird();
            this.checkCollision();
        } else {
            this.ctx.fillStyle = '#12171A';
            this.ctx.font = '30px Arial';
            this.ctx.fillText('Game Over!', this.canvas.width / 2 - 80, this.canvas.height / 2);
            this.ctx.font = '20px Arial';
            this.ctx.fillText('Pressione Espaço para recomeçar', this.canvas.width / 2 - 150, this.canvas.height / 2 + 40);
        }

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Inicia o jogo quando a página carregar
window.onload = () => {
    new Game();
}; 