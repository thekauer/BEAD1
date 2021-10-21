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

function initializeBoard() {
  const creatBoard = () => {
    const board = [];
    for (let i = 0; i < 9; i++) {
      board.push([]);
      for (let j = 0; j < 9; j++) {
        board[i].push({
          x: i,
          y: j,
          players: [],
        });
      }
    }
    return board;
  };
  const createStarterBoard = (board) => {
    board[1][1].type = TURN;
    board[1][1].rotation = RIGHT;
    board[1][7].type = TURN;
    board[1][7].rotation = UP;
    board[7][1].type = TURN;
    board[7][1].rotation = DOWN;
    board[7][7].type = TURN;
    board[7][7].rotation = LEFT;

    board[7][3].type = STRAIGHT;
    board[7][3].rotation = UP;
    board[7][5].type = STRAIGHT;
    board[7][5].rotation = UP;

    board[1][3].type = TRIPLET;
    board[1][3].rotation = UP;
    board[1][5].type = TRIPLET;
    board[1][5].rotation = UP;

    board[3][7].type = TRIPLET;
    board[3][7].rotation = LEFT;
    board[5][7].type = TRIPLET;
    board[5][7].rotation = LEFT;

    board[3][1].type = TRIPLET;
    board[3][1].rotation = RIGHT;
    board[5][1].type = TRIPLET;
    board[5][1].rotation = RIGHT;

    board[3][3].type = TRIPLET;
    board[3][3].rotation = UP;
    board[5][3].type = TRIPLET;
    board[5][3].rotation = RIGHT;
    board[3][5].type = TRIPLET;
    board[3][5].rotation = LEFT;
    board[5][5].type = TRIPLET;
    board[5][5].rotation = DOWN;
    return board;
  };
  const createDoor = (x, y, type) => {
    const rotation = randomBetween(0, 3);
    const door = {
      x,
      y,
      type,
      rotation,
      players: [],
    };
    state.board[x][y] = door;
  };
  const fillBoard = () => {
    const left = [13, 15, 6];
    for (let i = 1; i < 8; i++) {
      for (let j = 1; j < 8; j++) {
        if (state.board[i][j].type !== undefined) continue;

        let type = randomBetween(0, 2);
        while (left[type] === 0) {
          type = randomBetween(0, 2);
        }
        left[type]--;
        createDoor(i, j, type);
      }
    }
    createDoor(0, 0, left.indexOf(1));
  };
  const createRefs = () => {
    state.board = state.board.map((row) =>
      row.map((cell) => {
        const door = document.createElement("div");
        door.classList.add("cell");
        if (cell.type !== undefined) {
          door.classList.add("door");
          door.style.transform = `rotate(${90 * cell.rotation}deg)`;
          door.style.backgroundImage = `url(./cell_${cell.type}.svg)`;
        }
        door.style.left = `${cell.x * WIDTH}px`;
        door.style.top = `${cell.y * HEIGHT}px`;
        return { ...cell, ref: door };
      })
    );
  };
  const board = creatBoard();
  state.board = createStarterBoard(board);
  fillBoard();
  createRefs();
}

function renderBoard() {
  const board = document.querySelector("#board");
  state.board.map((row) =>
    row.map((cell) => {
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
    })
  );
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
    if (state.board[x][y].x === undefined) {
      state.board[x][y] = { x, y, players: [] };
    }
    state.board[x][y].players.push(player);
  }
  state.currentPlayer = 0;
}

function shift(x, y) {
  for (let i = 1; i < 8; i++) {
    if (x === 0) {
      state.board[i][y].ref.style.left = `${(i + 1) * HEIGHT}px`;
    }
    if (x === 8) {
      state.board[i][y].ref.style.left = `${(i - 1) * HEIGHT}px`;
    }
    if (y === 0) {
      state.board[x][i].ref.style.top = `${(i + 1) * HEIGHT}px`;
    }
    if (y === 8) {
      state.board[x][i].ref.style.top = `${(i - 1) * HEIGHT}px`;
    }
  }
}
