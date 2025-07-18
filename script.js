const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d"); // "contexto" pra desenhar no canvas
const scoreEl = document.getElementById("score");
const restartBtn = document.getElementById("restartBtn");
const gameOverDiv = document.getElementById("gameOver");
const finalScoreEl = document.getElementById("finalScore");
const gameOverRestartBtn = document.getElementById("gameOverRestart");
const countdownEl = document.getElementById("countdown");

const eatSound = document.getElementById("eatSound"); // Som ao comer comida
const dieSound = document.getElementById("dieSound"); // Som ao morrer

const box = 20;

// Declarar as variaveis 
let direction = "right"; 
let score = 0; 
let snake; 
let food;
let game;
let speed = 200;
let isRunning = false; 

// Função para iniciar/reiniciar o jogo
function init() {
  direction = "right"; 
  score = 0;
  speed = 200;
  isRunning = false; //(espera contagem)
  
  // Cobra começa com 3 quadrados
  snake = [
    { x: 200, y: 200 },
    { x: 180, y: 200 },
    { x: 160, y: 200 },
  ];
  
  food = spawnFood(); // Coloca comida aleatória no mapa
  scoreEl.textContent = "Pontuação: " + score; // Atualiza pontuação na tela
  
  gameOverDiv.style.display = "none"; // Esconde tela de game over
  countdownEl.classList.remove("hidden"); // Mostra contagem regressiva
  countdown(3); // Começa contagem regressiva de 3 segundos
}

// Função da contagem regressiva
function countdown(seconds) {
  countdownEl.textContent = seconds; // Mostra o número na tela
  if (seconds > 0) {
    setTimeout(() => countdown(seconds - 1), 1000); // Chama ela de novo em 1s com segundos-1
  } else {
    countdownEl.classList.add("hidden"); // Esconde contagem quando chega em 0
    startGame(); // Começa o jogo de verdade
  }
}

// Função que começa o jogo
function startGame() {
  if (game) clearInterval(game); // Para qualquer intervalo rodando antes
  game = setInterval(draw, speed); 
  isRunning = true; // Marca que o jogo está rodando
}

// Função que muda a direção da cobra
function changeDirection(event) {
  if (!isRunning) return; // Se não está rodando ignora
    
  // Checa qual seta foi apertada e troca a direção 
  if (event.key === "ArrowUp" && direction !== "down") direction = "up";
  else if (event.key === "ArrowDown" && direction !== "up") direction = "down";
  else if (event.key === "ArrowLeft" && direction !== "right") direction = "left";
  else if (event.key === "ArrowRight" && direction !== "left") direction = "right";
}

// Função do spawn da comida
function spawnFood() {
  return {
    x: Math.floor(Math.random() * (canvas.width / box)) * box, // Multiplica por box pra ficar na grade
    y: Math.floor(Math.random() * (canvas.height / box)) * box,
  };
}

// Função que verifica se a cabeça bateu no corpo
function collision(head, array) {
  return array.some(segment => segment.x === head.x && segment.y === head.y);
}

// Função que muda direção para botões mobile
function changeDirectionMobile(newDirection) {
  if (!isRunning) return;

  if (newDirection === "up" && direction !== "down") direction = "up";
  else if (newDirection === "down" && direction !== "up") direction = "down";
  else if (newDirection === "left" && direction !== "right") direction = "left";
  else if (newDirection === "right" && direction !== "left") direction = "right";
}

// Função principal que desenha tudo e atualiza o jogo
function draw() {
  ctx.fillStyle = "#52483b";
  ctx.fillRect(0, 0, canvas.width, canvas.height);                   
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpa o canvas

  // Desenha a comida (vermelho)
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  // Desenha a cobra
  for (let i = 0; i < snake.length; i++) {
    if (i === 0) {
      // Cabeça verde escura
      ctx.fillStyle = "#018201";
      ctx.fillRect(snake[i].x, snake[i].y, box, box);

      // Olhinhos brancos da cabeça da cobra
      const eyeSize = box / 5;
      const eyeOffsetX = box / 4;
      const eyeOffsetY = box / 4;

      ctx.fillStyle = "white";

      ctx.beginPath();
      ctx.ellipse(
        snake[i].x + eyeOffsetX,
        snake[i].y + eyeOffsetY,
        eyeSize,
        eyeSize * 1.2,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(
        snake[i].x + box - eyeOffsetX,
        snake[i].y + eyeOffsetY,
        eyeSize,
        eyeSize * 1.2,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Pupilas pretas dentro dos olhos
      const pupilSize = eyeSize / 2;
      ctx.fillStyle = "black";

      ctx.beginPath();
      ctx.ellipse(
        snake[i].x + eyeOffsetX,
        snake[i].y + eyeOffsetY,
        pupilSize,
        pupilSize * 1.2,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(
        snake[i].x + box - eyeOffsetX,
        snake[i].y + eyeOffsetY,
        pupilSize,
        pupilSize * 1.2,
        0,
        0,
        2 * Math.PI
      );
      ctx.fill();

    } else {
      // Corpo verde claro
      ctx.fillStyle = "#278a27";
      ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }
  }

  // Cria nova posição da cabeça conforme a direção atual
  let head = { ...snake[0] }; // Clona a cabeça atual
  if (direction === "right") head.x += box;
  else if (direction === "left") head.x -= box;
  else if (direction === "up") head.y -= box;
  else if (direction === "down") head.y += box;

  // Checa se bateu nas paredes ou no próprio corpo
  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height ||
    collision(head, snake)
  ) {
    clearInterval(game); // Para o loop do jogo
    isRunning = false; // Marca que o jogo parou
    dieSound.play(); // Toca som de morrer
    finalScoreEl.textContent = "Game Over! Sua pontuação foi: " + score;
    gameOverDiv.style.display = "block"; // Mostra a tela de game over
    return;
  }

  snake.unshift(head); // Adiciona nova cabeça no começo do array

  // Se comeu a comida
  if (head.x === food.x && head.y === food.y) {
    score++; // Aumenta pontuação
    scoreEl.textContent = "Pontuação: " + score; // Atualiza na tela
    eatSound.play(); // Toca som 
    food = spawnFood(); // Gera nova comida

    // Aumenta velocidade do jogo (com limite maximo)
    if (speed > 50) {
      speed -= 4;
      clearInterval(game);
      game = setInterval(draw, speed);
    }
  } else {
    snake.pop(); // Remove o último quadrado pra simular movimento
  }
}

// Quando a página carregar, inicia o jogo e configura os controles mobile
window.onload = () => {
  init();

  const upBtn = document.getElementById("upBtn");
  const downBtn = document.getElementById("downBtn");
  const leftBtn = document.getElementById("leftBtn");
  const rightBtn = document.getElementById("rightBtn");

  upBtn.addEventListener("touchstart", () => changeDirectionMobile("up"));
  downBtn.addEventListener("touchstart", () => changeDirectionMobile("down"));
  leftBtn.addEventListener("touchstart", () => changeDirectionMobile("left"));
  rightBtn.addEventListener("touchstart", () => changeDirectionMobile("right"));

  upBtn.addEventListener("click", () => changeDirectionMobile("up"));
  downBtn.addEventListener("click", () => changeDirectionMobile("down"));
  leftBtn.addEventListener("click", () => changeDirectionMobile("left"));
  rightBtn.addEventListener("click", () => changeDirectionMobile("right"));
};

// Detecta as setas do teclado pra mudar a direção
document.addEventListener("keydown", changeDirection);

// Botão de reiniciar
restartBtn.addEventListener("click", () => {
  init();
});

// Botão de reiniciar na tela de game over
gameOverRestartBtn.addEventListener("click", () => {
  init();
});
