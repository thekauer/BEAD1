const root = document.getElementById("root");
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;
const UP = 4;
const WIDTH = 60;
const HEIGHT = 60;
const STRAIGHT = 0;
const TURN = 1;
const TRIPLET = 2;
const NONE = 3;
const PLAYER_COLORS = ["#cc0000", "#007acc", "#2ecb2d", "#ffe600"];
let state = {
  page: "main",
};

goTo("main");

function goTo(page) {
  switch (page) {
    case "main":
      renderMain();
      break;
    case "newGame":
      renderNewGame();
      break;
    case "game":
      initializeGame();
      renderGame();
      break;
    case "gameOver":
      renderGameOver();
      break;
    default:
      renderMain();
  }
}

function renderMain() {
  root.innerHTML = `
  <div id="main-menu" class="menu">
    <button id="continue" disabled>Continue game</button>
    <button id="new">New game</button>
    <button id="description">Description</button>
  </div>`;
  const newGameButton = document.getElementById("new");
  newGameButton.addEventListener("click", () => {
    goTo("newGame");
  });
  const continueButton = document.getElementById("continue");
  continueButton.addEventListener("click", () => {
    goTo("game");
  });
  const descriptionButton = document.getElementById("description");
  descriptionButton.addEventListener("click", () => {
    goTo("description");
  });
}

function renderNewGame() {
  root.innerHTML = `
  <div id="new-game-menu" class="menu">
    <input type="number" id="player-count" min="1" max="4" value="2" />
    <input type="number" id="treasure-count" min="1" value="2" />
    <button id="start">Start</button>
    <button id="cancel">Cancel</button>
    </div>`;
  const startButton = document.getElementById("start");
  const playerCountInput = document.getElementById("player-count");
  const treasureCountInput = document.getElementById("treasure-count");
  playerCountInput.addEventListener("change", () => {
    if (playerCountInput.value > 4) {
      playerCountInput.value = 4;
    }
    treasureCountInput.max = 24 / playerCountInput.value;
  });
  treasureCountInput.addEventListener("change", () => {
    if (treasureCountInput.value > 24 / playerCountInput.value) {
      treasureCountInput.value = 24 / playerCountInput.value;
    }
  });
  startButton.addEventListener("click", () => {
    const playerCount = playerCountInput.value;
    const treasureCount = treasureCountInput.value;
    state = { ...state, playerCount, treasureCount };
    goTo("game");
  });
  const cancelButton = document.getElementById("cancel");
  cancelButton.addEventListener("click", () => {
    goTo("main");
  });
}
function initializeGame() {
  initializeBoard();
  initializePlayers();
}

function renderGame() {
  root.innerHTML = `<div id="board"></div>`;
  renderControls();
  renderBoard();
}

function renderControls() {
  const board = document.querySelector("#board");
  const createArrow = (rotation, x, y) => {
    const arrow = document.createElement("div");
    arrow.classList.add("arrow");
    arrow.classList.add("cell");
    arrow.style.transform = `rotate(${90 * rotation}deg)`;
    arrow.style.top = `${y * HEIGHT}px`;
    arrow.style.left = `${x * WIDTH}px`;
    arrow.addEventListener("click", () => {
      shift(x, y);
    });
    arrow.addEventListener("mouseover", () => {
      highlight(x, y);
    });
    board.appendChild(arrow);
  };
  createArrow(DOWN, 2, 0);
  createArrow(DOWN, 4, 0);
  createArrow(DOWN, 6, 0);
  createArrow(UP, 2, 8);
  createArrow(UP, 4, 8);
  createArrow(UP, 6, 8);
  createArrow(RIGHT, 0, 2);
  createArrow(RIGHT, 0, 4);
  createArrow(RIGHT, 0, 6);
  createArrow(LEFT, 8, 2);
  createArrow(LEFT, 8, 4);
  createArrow(LEFT, 8, 6);
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

class Element {
  constructor(x, y, type, rotation, players = []) {
    this.type = type;
    this.ref = document.createElement("div");
    if ([TURN, TRIPLET, STRAIGHT].includes(type)) {
      this.ref.classList.add("door");
      this.ref.style.backgroundImage = `url(./cell_${this.type}.svg)`;
    }
    this.ref.classList.add("cell");
    this.setX(x);
    this.setY(y);
    this.setRotation(rotation);
    this.players = players;
  }

  getX() {
    return this.x;
  }
  getY() {
    return this.y;
  }
  getRotation() {
    return this.rotation;
  }
  setX(newX) {
    this.x = newX;
    this.ref.style.left = `${this.x * WIDTH}px`;
  }
  setY(newY) {
    this.y = newY;
    this.ref.style.top = `${this.y * HEIGHT}px`;
  }
  setRotation(newRotation) {
    this.rotation = newRotation;
    this.ref.style.transform = `rotate(${90 * this.rotation}deg)`;
  }
}

function createElement(type, x, y, rotation, players = []) {
  return new Element(x, y, type, rotation, players);
}

function getElement(x, y) {
  return state.board.find((cell) => cell.getX() === x && cell.getY() === y);
}

const createStarterBoard = () => {
  return [
    createElement(TURN, 1, 1, RIGHT),
    createElement(TURN, 1, 7, UP),
    createElement(TURN, 7, 1, DOWN),
    createElement(TURN, 7, 7, LEFT),

    createElement(STRAIGHT, 7, 3, UP),
    createElement(STRAIGHT, 7, 5, UP),

    createElement(TRIPLET, 1, 3, UP),
    createElement(TRIPLET, 1, 5, UP),

    createElement(TRIPLET, 3, 7, LEFT),
    createElement(TRIPLET, 5, 7, LEFT),

    createElement(TRIPLET, 3, 1, RIGHT),
    createElement(TRIPLET, 5, 1, RIGHT),

    createElement(TRIPLET, 3, 3, UP),
    createElement(TRIPLET, 5, 3, RIGHT),
    createElement(TRIPLET, 3, 5, LEFT),
    createElement(TRIPLET, 5, 5, DOWN),
  ];
};

const fillBoard = () => {
  const left = [13, 15, 6];
  for (let i = 1; i < 8; i++) {
    for (let j = 1; j < 8; j++) {
      const elem = getElement(i, j);
      if (elem && elem.type !== NONE) continue;

      let type = randomBetween(0, 2);
      while (left[type] === 0) {
        type = randomBetween(0, 2);
      }
      left[type]--;
      state.board.push(createElement(type, i, j, randomBetween(0, 3)));
    }
  }
  const extra = createElement(left.indexOf(1), 0, 0, UP);
  extra.isExtra = true;
  state.board.push(extra);
};

function initializeBoard() {
  state.board = createStarterBoard();
  fillBoard();
}

function renderBoard() {
  const board = document.querySelector("#board");

  state.board.forEach((cell) => {
    if (cell?.players.length > 0) {
      cell.players?.forEach((player) => {
        const playerDiv = document.createElement("div");
        if (player.number === state.currentPlayer)
          playerDiv.classList.add("active");
        playerDiv.classList.add("player");
        playerDiv.style.backgroundColor = player.color;
        cell.ref.appendChild(playerDiv);
      });
    }
    if (cell.ref && cell.type !== undefined) board.appendChild(cell.ref);
  });
}

function initializePlayers() {
  const corners = [
    [1, 1],
    [1, 7],
    [7, 1],
    [7, 7],
  ];

  for (let i = 0; i < state.playerCount; i++) {
    const [x, y] = corners[i];
    const player = {
      number: i,
      color: PLAYER_COLORS[i],
      x,
      y,
    };
    const cell = state.board.find((cell) => cell.x === x && cell.y === y);
    if (cell) {
      cell.players.push(player);
    } else {
      state.board.push(createElement(NONE, x, y, UP, [player]));
    }
  }
  state.currentPlayer = 0;
}

function shift(x, y) {
  if (JSON.stringify(state.disabled) === JSON.stringify([x, y])) return;
  const extra = state.board.find((cell) => cell.isExtra);
  extra.isExtra = false;
  if (x === 0) {
    extra.setX(0);
    state.board
      .filter((cell) => cell.getY() === y)
      .forEach((cell) => cell.setX(cell.getX() + 1));
    state.board.find(
      (cell) => cell.getX() === 8 && cell.getY() === y
    ).isExtra = true;
    state.disabled = [8, y];
  }
  if (x === 8) {
    extra.setX(8);
    state.board
      .filter((cell) => cell.getY() === y)
      .forEach((cell) => cell.setX(cell.getX() - 1));
    state.board.find(
      (cell) => cell.getX() === 0 && cell.getY() === y
    ).isExtra = true;
    state.disabled = [0, y];
  }
  if (y === 0) {
    extra.setY(0);
    state.board
      .filter((cell) => cell.getX() === x)
      .forEach((cell) => cell.setY(cell.getY() + 1));
    state.board.find(
      (cell) => cell.getX() === x && cell.getY() === 8
    ).isExtra = true;
    state.disabled = [x, 8];
  }
  if (y === 8) {
    extra.setY(8);
    state.board
      .filter((cell) => cell.getX() === x)
      .forEach((cell) => cell.setY(cell.getY() - 1));
    state.board.find(
      (cell) => cell.getX() === x && cell.getY() === 0
    ).isExtra = true;
    state.disabled = [x, 0];
  }
}

function highlight(x, y) {
  const extra = state.board.find((cell) => cell.isExtra);
  if (x === 0) {
    extra.setX(x - 1);
    extra.setY(y);
  }
  if (x === 8) {
    extra.setX(x + 1);
    extra.setY(y);
  }
  if (y === 0) {
    extra.setX(x);
    extra.setY(y - 1);
  }
  if (y === 8) {
    extra.setX(x);
    extra.setY(y + 1);
  }
}
