const root = document.getElementById("root");
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;
const UP = 4;
const ROTATIONS = [UP, RIGHT, DOWN, LEFT, UP, RIGHT, DOWN, LEFT];
const WIDTH = 60;
const HEIGHT = 60;
const GAP = 3;
const PLAYER_GAP = 5;
const PLAYER_SIZE = 20;
const STRAIGHT = 0;
const TURN = 1;
const TRIPLET = 2;
const NONE = 3;
const PLAYER = 4;
const TREASURE = 5;
const PLAYER_COLORS = ["#cc0000", "#007acc", "#2ecb2d", "#ffe600"];
const CORNERS = [
  [1, 1],
  [1, 7],
  [7, 1],
  [7, 7],
];
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
    <label for="player-count">Players:</label>
    <input type="number" name="player-count" id="player-count" min="1" max="4" value="2" />
    <label for="treasure-count">Treasures:</label>
    <input type="number" id="treasure-count" min="1" value="2" name="treasure-count" />
    <button id="start">Start</button>
    <button id="cancel">Back</button>
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
  root.innerHTML = "";
  const main = document.createElement("main");
  main.classList.add("main");
  const leftPanel = document.createElement("div");
  leftPanel.id = "left-panel";
  const rightPanel = document.createElement("div");
  rightPanel.id = "right-panel";
  const board = document.createElement("div");
  board.id = "board";
  main.appendChild(leftPanel);
  main.appendChild(board);
  main.appendChild(rightPanel);
  root.appendChild(main);
  window.removeEventListener("keydown", rotateListener);
  renderControls();
  renderRightPanel();
  renderBoard();
}
function renderRightPanel() {
  const rightPanel = document.getElementById("right-panel");
  rightPanel.innerHTML = "";
  const rows = document.createElement("div");
  rows.classList.add("rows");
  for (let i = 0; i < state.playerCount; i++) {
    const row = document.createElement("div");
    if (i === state.currentPlayer) row.classList.add("active");
    if (i === 0) {
      row.style.borderRadius = "5px 5px 0 0";
    }
    if (i === state.playerCount - 1) {
      row.style.borderRadius = "0 0 5px 5px";
    }
    row.classList.add("row");
    row.style.borderLeftColor = PLAYER_COLORS[i];
    const player = document.createElement("div");
    player.classList.add("player");
    player.style.position = "relative";
    player.style.backgroundColor = PLAYER_COLORS[i];
    row.appendChild(player);
    const playerName = document.createElement("span");
    playerName.innerText = `Player ${i + 1}`;
    row.appendChild(playerName);

    const foundContainer = document.createElement("div");
    foundContainer.classList.add("found-container");
    const found = document.createElement("span");
    found.innerText = `Found: ${state.found[i]}`;
    foundContainer.appendChild(found);
    const openTreasure = document.createElement("img");
    openTreasure.classList.add("treasure");
    openTreasure.src = "open_chest.png";
    foundContainer.appendChild(openTreasure);
    foundContainer.appendChild(
      document.createTextNode(`/${state.treasureCount}`)
    );
    const closeTreasure = document.createElement("img");
    closeTreasure.classList.add("treasure");
    closeTreasure.src = "closed_chest.png";
    foundContainer.appendChild(closeTreasure);
    row.appendChild(foundContainer);

    const treasureCountainer = document.createElement("div");
    treasureCountainer.classList.add("treasure-countainer");
    for (let j = 0; j < state.found[i]; j++) {
      const treasure = document.createElement("img");
      treasure.classList.add("treasure");
      treasure.src = "closed_chest.png";
      treasure.style.zIndex = 4 + j;
      treasureCountainer.appendChild(treasure);
    }
    row.appendChild(treasureCountainer);
    rows.appendChild(row);
  }
  rightPanel.appendChild(rows);
}
function updateRightPanel() {
  const rightPanel = document.getElementById("right-panel");
  const activeRow = rightPanel.querySelector(".active");
  activeRow.classList.remove("active");
  const rows = rightPanel.querySelectorAll(".row");
  const row = rows[state.currentPlayer];
  row.classList.add("active");
  const found = row.querySelector(".found-container span");
  found.innerText = `Found: ${state.found[state.currentPlayer]}`;
  const treasureCountainer = row.querySelector(".treasure-countainer");
  treasureCountainer.innerHTML = "";
  for (let j = 0; j < state.found[state.currentPlayer]; j++) {
    const treasure = document.createElement("img");
    treasure.classList.add("treasure");
    treasure.src = "closed_chest.png";
    treasure.style.zIndex = 4 + j;
    treasureCountainer.appendChild(treasure);
  }
}

function rotateListener(e) {
  if (e.key === "r") {
    rotateExtra();
  }
}
function renderControls() {
  const board = document.querySelector("#board");
  window.addEventListener("keydown", rotateListener);
  const createArrow = (rotation, x, y) => {
    const arrow = document.createElement("div");
    arrow.classList.add("arrow");
    arrow.classList.add("cell");
    arrow.style.transform = `rotate(${90 * rotation}deg)`;
    arrow.style.top = `${y * HEIGHT + y * GAP}px`;
    arrow.style.left = `${x * WIDTH + x * GAP}px`;
    arrow.addEventListener("click", () => {
      shift(x, y);
    });
    arrow.addEventListener("mouseover", () => {
      highlight(x, y);
    });
    if (!state.arrows) state.arrows = [];
    state.arrows.push({ arrow, x, y });
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
  constructor(x, y, type, rotation) {
    this.type = type;
    this.ref = document.createElement(type === TREASURE ? "img" : "div");
    if ([TURN, TRIPLET, STRAIGHT].includes(type)) {
      this.ref.classList.add("door");
      this.ref.classList.add("cell");
      this.ref.style.backgroundImage = `url(./cell_${this.type}.svg)`;
      this.ref.addEventListener("click", () => {
        step(this);
      });
    }
    if (type === PLAYER) {
      this.ref.classList.add("player");
      this.ref.classList.add("cell");
    }
    this.setRotation(rotation);
    switch (rotation) {
      case RIGHT:
        this.offset = { x: 3 * PLAYER_GAP + PLAYER_SIZE, y: PLAYER_GAP };
        break;
      case DOWN:
        this.offset = {
          x: 3 * PLAYER_GAP + PLAYER_SIZE,
          y: 3 * PLAYER_GAP + PLAYER_SIZE,
        };
        break;
      case LEFT:
        this.offset = { x: PLAYER_GAP, y: 3 * PLAYER_GAP + PLAYER_SIZE };
        break;
      case UP:
        this.offset = { x: PLAYER_GAP, y: PLAYER_GAP };
        break;
    }
    if (type !== PLAYER) {
      this.offset = { x: 0, y: 0 };
    }
    if (type === TREASURE) {
      this.ref.classList.add("big-treasure");
      this.ref.src = "closed_chest.png";
      this.offset = { x: 15, y: 15 };
    }
    this.setX(x);
    this.setY(y);
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
    this.ref.style.left = `${this.x * WIDTH + this.x * GAP + this.offset.x}px`;
  }
  getType() {
    return this.type;
  }
  setY(newY) {
    this.y = newY;
    this.ref.style.top = `${this.y * HEIGHT + this.y * GAP + this.offset.y}px`;
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
  return state.board.find(
    (cell) =>
      cell.getX() === x &&
      cell.getY() === y &&
      cell.type !== PLAYER &&
      cell.type !== TREASURE
  );
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

const placeTreasure = () => {
  for (let i = 0; i < state.playerCount; i++) {
    for (let j = 0; j < state.treasureCount; j++) {
      let exists = true;
      let x, y;
      while (exists) {
        x = randomBetween(1, 7);
        y = randomBetween(1, 7);
        exists = state.board.find(
          (cell) =>
            cell.getX() === x && cell.getY() === y && cell.type === TREASURE
        );
      }
      const treasure = createElement(TREASURE, x, y, UP);
      if (i === 0) {
        treasure.ref.classList.add("show");
      }
      treasure.ref.addEventListener("click", () => {
        step(getElement(treasure.getX(), treasure.getY()));
      });
      treasure.number = i;
      state.board.push(treasure);
    }
  }
};

function initializeBoard() {
  state.board = createStarterBoard();
  fillBoard();
  placeTreasure();
}

function renderBoard() {
  const board = document.querySelector("#board");

  state.board.forEach((cell) => {
    if (cell.ref && cell.type !== undefined) board.appendChild(cell.ref);
  });
}

function initializePlayers() {
  state.found = {};
  for (let i = 0; i < state.playerCount; i++) {
    const [x, y] = CORNERS[i];
    const player = createElement(PLAYER, x, y, [UP, LEFT, RIGHT, DOWN][i]);
    player.ref.style.backgroundColor = PLAYER_COLORS[i];
    player.number = i;
    if (i === 0) {
      player.ref.classList.add("active");
    }
    state.found[i] = 0;
    state.board.push(player);
  }
  state.currentPlayer = 0;
}

function shift(x, y) {
  if (JSON.stringify(state.disabled) === JSON.stringify([x, y])) return;
  enableArrow();
  if (state.reachable) return;
  const extra = state.board.find((cell) => cell.isExtra);
  extra.isExtra = false;
  if (x === 0) {
    extra.setX(0);
    state.board
      .filter((cell) => cell.getY() === y)
      .forEach((cell) => cell.setX(cell.getX() + 1));
    getElement(8, y).isExtra = true;
    const teleporters = state.board.filter(
      (cell) =>
        cell.getX() === 8 &&
        cell.getY() === y &&
        (cell.type === PLAYER || cell.type === TREASURE)
    );
    teleporters.forEach((player) => {
      player.setX(1);
      player.setY(y);
    });
    state.disabled = [8, y];
  }
  if (x === 8) {
    extra.setX(8);
    state.board
      .filter((cell) => cell.getY() === y)
      .forEach((cell) => cell.setX(cell.getX() - 1));
    getElement(0, y).isExtra = true;
    const teleporters = state.board.filter(
      (cell) =>
        cell.getX() === 0 &&
        cell.getY() === y &&
        (cell.type === PLAYER || cell.type === TREASURE)
    );
    teleporters.forEach((player) => {
      player.setX(7);
      player.setY(y);
    });
    state.disabled = [0, y];
  }
  if (y === 0) {
    extra.setY(0);
    state.board
      .filter((cell) => cell.getX() === x)
      .forEach((cell) => cell.setY(cell.getY() + 1));
    getElement(x, 8).isExtra = true;
    const teleporters = state.board.filter(
      (cell) =>
        cell.getX() === x &&
        cell.getY() === 8 &&
        (cell.type === PLAYER || cell.type === TREASURE)
    );
    teleporters.forEach((player) => {
      player.setX(x);
      player.setY(1);
    });
    state.disabled = [x, 8];
  }
  if (y === 8) {
    extra.setY(8);
    state.board
      .filter((cell) => cell.getX() === x)
      .forEach((cell) => cell.setY(cell.getY() - 1));
    getElement(x, 0).isExtra = true;
    const teleporters = state.board.filter(
      (cell) =>
        cell.getX() === x &&
        cell.getY() === 0 &&
        (cell.type === PLAYER || cell.type === TREASURE)
    );
    teleporters.forEach((player) => {
      player.setX(x);
      player.setY(7);
    });
    state.disabled = [x, 0];
  }
  disableArrow();
  showReachable();
}
function disableArrow() {
  const [x, y] = state.disabled;
  state.arrows
    .find((arrow) => arrow.x === x && arrow.y === y)
    .arrow.classList.add("disabled");
}
function enableArrow() {
  if (!state.disabled) return;
  const [x, y] = state.disabled;
  state.arrows
    .find((arrow) => arrow.x === x && arrow.y === y)
    .arrow.classList.remove("disabled");
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
function rotateExtra() {
  const extra = state.board.find((cell) => cell.isExtra);
  if (!extra) return;
  extra.getRotation() >= 3
    ? extra.setRotation(0)
    : extra.setRotation(extra.getRotation() + 1);
}

function showReachable() {
  const current = state.board.find(
    (player) => player.type === PLAYER && player.number === state.currentPlayer
  );
  const currentCell = getElement(current.getX(), current.getY());
  state.reachable = getReachable(currentCell);
  state.reachable.forEach((cell) => {
    cell.ref.classList.add("reachable");
  });
}
function hideReachable() {
  state.reachable.forEach((cell) => {
    cell.ref.classList.remove("reachable");
  });
  state.reachable = undefined;
}

function getReachable(cell) {
  const reachable = [];
  const visited = [];
  const queue = [cell];
  while (queue.length > 0) {
    const current = queue.shift();
    if (visited.includes(current)) continue;
    visited.push(current);
    reachable.push(current);
    const neighbours = getNeighbours(current);
    neighbours.forEach((neighbour) => {
      if (visited.includes(neighbour)) return;
      queue.push(neighbour);
    });
  }
  return reachable;
}

function getNeighbours(cell) {
  const neighbours = [];
  if (!cell) return neighbours;
  const x = cell.getX();
  const y = cell.getY();
  const connections = getConnectionDirections(cell);
  if (connections.includes(LEFT) && x > 0) {
    const elem = getElement(x - 1, y);
    const elemConnections = getConnectionDirections(elem);
    if (elemConnections.includes(RIGHT)) neighbours.push(elem);
  }
  if (connections.includes(RIGHT) && x < 8) {
    const elem = getElement(x + 1, y);
    const elemConnections = getConnectionDirections(elem);
    if (elemConnections.includes(LEFT)) neighbours.push(elem);
  }
  if (connections.includes(DOWN) && y > 0) {
    const elem = getElement(x, y + 1);
    const elemConnections = getConnectionDirections(elem);
    if (elemConnections.includes(UP)) neighbours.push(elem);
  }
  if (connections.includes(UP) && y < 8) {
    const elem = getElement(x, y - 1);
    const elemConnections = getConnectionDirections(elem);
    if (elemConnections.includes(DOWN)) neighbours.push(elem);
  }
  return neighbours.filter((neighbour) => neighbour !== undefined);
}

function getConnectionDirections(cell) {
  if (!cell) return [];
  const type = cell.getType();
  const rotation = cell.getRotation();
  if (type === NONE) return [];
  if (type === STRAIGHT) {
    return rotation % 2 === 0 ? [UP, DOWN] : [LEFT, RIGHT];
  }
  if (type === TURN) {
    return ROTATIONS.slice(rotation, rotation + 2);
  }
  if (type === TRIPLET) {
    return ROTATIONS.slice(rotation, rotation + 3);
  }
}

function step(cell) {
  if (!state.reachable) return;
  if (!state.reachable.includes(cell)) return;
  const currentPlayer = state.board.find(
    (player) => player.type === PLAYER && player.number === state.currentPlayer
  );
  const currentCell = getElement(currentPlayer.getX(), currentPlayer.getY());
  const route = shortestRouteBetween(currentCell, cell);
  route.forEach((cell, index) => {
    setTimeout(() => {
      currentPlayer.setX(cell.getX());
      currentPlayer.setY(cell.getY());
    }, index * 100);
  });
  if (currentPlayerIsFinishing()) {
    const [x, y] = CORNERS[state.currentPlayer];
    if (x === cell.getX() && y === cell.getY()) {
      won();
    }
  }

  const treasure = state.board.find(
    (t) =>
      t.type === TREASURE &&
      t.getX() === cell.getX() &&
      t.getY() === cell.getY()
  );
  if (treasure) {
    treasure.ref.classList.remove("show");
    state.board = state.board.filter(
      (t) =>
        t.getX() !== cell.getX() ||
        t.getY() !== cell.getY() ||
        t.type !== TREASURE
    );
    state.found[state.currentPlayer]++;
    updateRightPanel();
  }
  hideReachable();
  nextPlayer();
}
function shortestRouteBetween(start, end) {
  const visited = [];
  const queue = [start];
  const pred = {};
  const getId = (cell) => `${cell.getX()}-${cell.getY()}`;
  pred[getId(start)] = null;
  while (queue.length > 0) {
    const current = queue.shift();
    if (current === end) break;
    visited.push(current);
    const neighbours = getNeighbours(current);
    neighbours.forEach((neighbour) => {
      if (visited.includes(neighbour)) return;
      pred[getId(neighbour)] = current;
      queue.push(neighbour);
    });
  }
  const route = [];
  let current = end;
  while (current !== start) {
    route.push(current);
    current = pred[getId(current)];
  }
  route.push(start);
  return route.reverse();
}

function nextPlayer() {
  CORNERS.forEach((corner) => {
    const cornerCell = getElement(...corner);
    cornerCell.ref.classList.remove("finishing");
  });
  const currentPlayer = state.board.find(
    (player) => player.type === PLAYER && player.number === state.currentPlayer
  );
  currentPlayer.ref.classList.remove("active");
  const currentTreasures = state.board.filter(
    (cell) => cell.getType() === TREASURE && cell.number === state.currentPlayer
  );
  currentTreasures.forEach((cell) => {
    cell.ref.classList.remove("show");
  });
  state.currentPlayer =
    state.currentPlayer === state.playerCount - 1 ? 0 : state.currentPlayer + 1;
  state.board
    .find(
      (player) =>
        player.type === PLAYER && player.number === state.currentPlayer
    )
    .ref.classList.add("active");
  const nextTreasures = state.board.filter(
    (cell) => cell.getType() === TREASURE && cell.number === state.currentPlayer
  );
  nextTreasures.forEach((cell) => {
    cell.ref.classList.add("show");
  });
  if (currentPlayerIsFinishing()) {
    document.documentElement.style.setProperty(
      "--finish-color",
      PLAYER_COLORS[state.currentPlayer]
    );
    const corner = getElement(...CORNERS[state.currentPlayer]);
    corner.ref.classList.add("finishing");
  }

  updateRightPanel();
}

function currentPlayerIsFinishing() {
  return state.found[state.currentPlayer] == state.treasureCount;
}

function won() {
  const root = document.getElementById("root");
  const winModal = document.createElement("div");
  winModal.classList.add("win-modal");

  const winModalContent = document.createElement("div");
  winModalContent.classList.add("win-modal-content");

  const winModalHeader = document.createElement("h1");
  winModalHeader.style.color = PLAYER_COLORS[state.currentPlayer];
  winModalHeader.innerText = `Player ${state.currentPlayer + 1} won!`;

  const winModalText = document.createElement("b");
  winModalText.style.color = "white";
  winModalText.innerText = `Congratulations! You found all the treasures!`;

  const footer = document.createElement("div");
  footer.classList.add("footer");
  const playAgainButton = document.createElement("button");
  playAgainButton.innerText = "Play again";
  playAgainButton.addEventListener("click", () => {
    root.removeChild(winModal);
    const { treasureCount, playerCount } = state;
    state = {
      page: "main",
      treasureCount,
      playerCount,
    };
    goTo("game");
  });
  const backToMainMenuButton = document.createElement("button");
  backToMainMenuButton.innerText = "Back to main menu";
  backToMainMenuButton.addEventListener("click", () => {
    root.removeChild(winModal);
    state = {
      page: "main",
    };
    goTo("main");
  });
  footer.appendChild(playAgainButton);
  footer.appendChild(backToMainMenuButton);

  winModalContent.appendChild(winModalHeader);
  winModalContent.appendChild(winModalText);
  winModalContent.appendChild(footer);

  winModal.appendChild(winModalContent);
  root.appendChild(winModal);
}
