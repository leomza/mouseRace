document.addEventListener("DOMContentLoaded", () => {
  const gameboard = document.querySelector("#gameBoard");
  const ctx = gameboard.getContext("2d");
  let frameNum = 0;
  let score = 0;
  let components = [];
  let mouseX = 0;
  let mouseY = 0;
  let started = true;
  let interval = null;

  class GamePiece {
    constructor(color) {
      this.color = color;
      //2 and -2 starting delta parameters arbitrarily
      this.dx = 2;
      this.dy = -2;
      this.speed = Math.random() * 2;
    }

    //Generate random coordenates
    randomCoordenates(radius, height) {
      let x, y;
      //If is called from foundEscape it's a Square and is the only time to create new random coordinates outside of constructor
      if (radius == undefined) {
        radius = this.height;
      }
      if (height == undefined) {
        height = radius;
      }
      do {
        x = Math.floor(Math.random() * 600);
        y = Math.floor(Math.random() * 600);
      } while (
        x > gameboard.width - radius ||
        x < radius ||
        y > gameboard.height - height ||
        y < height
      );

      this.x = x;
      this.y = y;
    }
  }

  class Circle extends GamePiece {
    constructor(radius, color) {
      super(color);
      this.ballRadius = radius;
      this.randomCoordenates(this.ballRadius);
    }

    move() {
      //To enable randomMove as rectangles modify this to check if ballRadius  = 0 if so ballRadius = this.width;
      let ballRadius = this.ballRadius;
      if (
        this.x + this.dx > gameboard.width - ballRadius ||
        this.x + this.dx < ballRadius
      ) {
        this.dx = -this.dx;
      }
      if (
        this.y + this.dy > gameboard.height - ballRadius ||
        this.y + this.dy < ballRadius
      ) {
        this.dy = -this.dy;
      }
      this.x += this.dx * this.speed;
      this.y += this.dy * this.speed;
    }

    draw() {
      let color = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
    }
  }

  class Rectangle extends GamePiece {
    constructor(height, width, color) {
      super(color);
      this.height = height;
      this.width = width;
      this.randomCoordenates(this.height, this.width);
    }

    move() {
      this.dx = relativeX - this.x;
      this.dy = relativeY - this.y;
      let distance = Math.sqrt(this.dx * this.dx + this.dy * this.dy);

      this.x += (this.dx / distance) * this.speed;
      this.y += (this.dy / distance) * this.speed;
    }

    draw() {
      let color = this.color;
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.closePath();
    }
  }
  // A Square is a Rectangle with a width = height and a different move
  class Square extends Rectangle {
    constructor(height, color) {
      super(height, height, color);
    }

    move() {
      this.dx = this.x - relativeX;
      this.dy = this.y - relativeY;
      let distance = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
      let newDx = (this.dx / distance) * 0.5;
      let newDy = (this.dy / distance) * 0.5;

      if (
        this.x + newDx > gameboard.width - this.height ||
        this.x + newDx < this.height
      ) {
        newDx = 0;
      }
      if (
        this.y + newDy > gameboard.height - this.height ||
        this.y + newDy < this.height
      ) {
        newDy = 0;
      }

      this.x += newDx * this.speed;
      this.y += newDy * this.speed;
    }
  }

  //Events
  gameboard.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    relativeX = mouseX - gameboard.offsetLeft;
    relativeY = mouseY - gameboard.offsetTop;
  });

  gameboard.addEventListener("mouseout", () => {
    if (started == false) {
      alert("No moving outside the game board!");
      gameLoss();
    }
  });

  gameboard.addEventListener("mousedown", (event) => {
    if (started == true) {
      mouseX = event.clientX;
      mouseY = event.clientY;
      relativeX = mouseX - gameboard.offsetLeft;
      relativeY = mouseY - gameboard.offsetTop;
      if (ctx.isPointInPath(relativeX, relativeY)) {
        initializeGame();
      }
    }
  });

  const randomRadius = () => {
    return Math.floor(Math.random() * 20) + 20;
  };

  // Start the game
  const initializeGame = () => {
    //Start interval
    started = true;

    //Game starts with 2 random circles 2 chase rectangles and 1 escape square
    newTestBall = new Rectangle(randomRadius(), randomRadius(), "#eb0909");
    newTestBall2 = new Circle(randomRadius(), "#eb0909");
    newTestBall3 = new Square(randomRadius(), "#0eeb3a");
    newTestBall4 = new Circle(randomRadius(), "#eb0909");
    newTestBall5 = new Rectangle(randomRadius(), randomRadius(), "#eb0909");

    components.push(newTestBall);
    components.push(newTestBall2);
    components.push(newTestBall3);
    components.push(newTestBall4);
    components.push(newTestBall5);

    interval = setInterval(gameRun, 10);
  };

  const drawStartButton = () => {
    ctx.beginPath();
    ctx.rect(250, 270, 150, 75);
    ctx.fillStyle = "blue";
    ctx.fill();
    ctx.closePath();

    ctx.font = "22px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Start Game", 270, 315);
  };
  drawStartButton();

  //Increase the score in 5 and give the escape new coordenates
  const foundEscape = (item) => {
    score += 5;
    item.randomCoordenates();
  };

  //Reset all Canvas elements
  const gameLoss = () => {
    clearInterval(interval);
    ctx.clearRect(0, 0, gameboard.width, gameboard.height);
    drawBiggerScore();
    components = [];
    started = true;
    alert("Game Over 😪 Try Again!");
  };

  //Start counting seconds
  const gameRun = () => {
    ctx.clearRect(0, 0, gameboard.width, gameboard.height);
    frameNum += 1;
    if (frameNum == 1 || everyInterval(100)) {
      score++;
    }

    for (let i = 0; i < components.length; i++) {
      components[i].move();
      components[i].draw();
      if (ctx.isPointInPath(relativeX, relativeY)) {
        if (components[i] instanceof Square) {
          foundEscape(components[i]);
        } else {
          gameLoss();
          return;
        }
      }
    }
    //Draw here in case get +5 points
    drawScore();
  };

  const everyInterval = (n) => {
    if ((frameNum / n) % 1 == 0) {
      return true;
    }
    return false;
  };

  const drawScore = () => {
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(`Score: ${score}`, 8, 20);
  };

  const drawBiggerScore = () => {
    ctx.font = "32px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(`Your Score: ${score}`, 220, 300);
  };
});