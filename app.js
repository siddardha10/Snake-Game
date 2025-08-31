const boundary = document.getElementById("boundary");
const snakeContainer = document.getElementById("snake");
const food = document.getElementById("food");
const keysBtn = document.getElementById("keys");
const pauseBtn = document.getElementById("pause");
const restartBtn = document.getElementById("restart");
const scoreDisplay = document.getElementById("score");
const mouseBtn = document.getElementById("mouse");

let snake = [{ x: 200, y: 200 }];
let dx = 20;
let dy = 0;
let interval;
let keysActive = false;
let gamePaused = false;
let score = 0;
let mouseActive = false;
let mouseTarget = null;
let cursorInBoundary = false;

// Function to clear all button selections
function clearButtonSelections() {
  keysBtn.classList.remove('selected');
  mouseBtn.classList.remove('selected');
  pauseBtn.classList.remove('selected');
}

// Function to set button selection
function setButtonSelection(button) {
  clearButtonSelections();
  button.classList.add('selected');
}

//Growth of snake
function drawSnake() {
  snakeContainer.innerHTML = "";
  snake.forEach(segment => {
    const segmentDiv = document.createElement("div");
    segmentDiv.className = "snake-segment";
    segmentDiv.style.left = segment.x + "px";
    segmentDiv.style.top = segment.y + "px";
    snakeContainer.appendChild(segmentDiv);
  });
}

function randomFood() {
  const maxX = boundary.clientWidth / 20;
  const maxY = boundary.clientHeight / 20;
  let x, y, overlap;
  do {
    x = Math.floor(Math.random() * maxX) * 20;
    y = Math.floor(Math.random() * maxY) * 20;
    overlap = snake.some(seg => seg.x === x && seg.y === y);
  } while (overlap);
  food.style.left = x + "px";
  food.style.top = y + "px";
  return { x, y };
}

let foodPos = randomFood();

function getDirectionToTarget(head, target) {
  const dx = target.x - head.x;
  const dy = target.y - head.y;
  if (Math.abs(dx) > Math.abs(dy)) {
    return { dx: dx > 0 ? 20 : -20, dy: 0 };
  } else if (Math.abs(dy) > 0) {
    return { dx: 0, dy: dy > 0 ? 20 : -20 };
  }
  return { dx: 0, dy: 0 };
}

function isCursorInBoundary(e) {
  const rect = boundary.getBoundingClientRect();
  return (
    e.clientX >= rect.left &&
    e.clientX < rect.right &&
    e.clientY >= rect.top &&
    e.clientY < rect.bottom
  );
}

function handleMouseMove(e) {
  if (isCursorInBoundary(e)) {
    cursorInBoundary = true;
    const rect = boundary.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / 20) * 20;
    const y = Math.floor((e.clientY - rect.top) / 20) * 20;
    mouseTarget = { x, y };
  } else {
    cursorInBoundary = false;
  }
}

boundary.addEventListener("mouseleave", () => {
  cursorInBoundary = false;
});
boundary.addEventListener("mouseenter", () => {
  cursorInBoundary = true;
});

function moveSnake() {
  if (gamePaused || (!keysActive && !mouseActive)) return;

  let nextDx = dx;
  let nextDy = dy;

  if (mouseActive) {
    if (!cursorInBoundary) {
      // Stop moving if cursor is not in the boundary
      return;
    }
    if (mouseTarget) {
      const head = snake[0];
      const dir = getDirectionToTarget(head, mouseTarget);
      if (!(dir.dx === -dx && dir.dy === -dy)) {
        nextDx = dir.dx;
        nextDy = dir.dy;
      }
    }
  }

  const head = { x: snake[0].x + nextDx, y: snake[0].y + nextDy };

  // Game over logic
  let hitWall = head.x < 0 || head.x >= boundary.clientWidth || head.y < 0 || head.y >= boundary.clientHeight;
  let hitSelf = snake.some(seg => seg.x === head.x && seg.y === head.y);

  if ((keysActive && (hitWall || hitSelf)) || (mouseActive && hitWall)) {
    alert("Game Over!");
    clearInterval(interval);
    keysActive = false;
    mouseActive = false;
    clearButtonSelections();
    document.removeEventListener("mousemove", handleMouseMove);
    return;
  }

  dx = nextDx;
  dy = nextDy;
  snake.unshift(head);
  if (head.x === foodPos.x && head.y === foodPos.y) {
    score += 10;
    scoreDisplay.textContent = "Score: " + score;
    foodPos = randomFood();
  } else {
    snake.pop();
  }

  drawSnake();
}

function handleKey(e) {
  if (!keysActive) return;
  
  // Handle spacebar for pause/resume
  if (e.code === 'Space') {
    e.preventDefault(); // Prevent page scrolling
    pauseBtn.click(); // Trigger the pause button click
    return;
  }
  
  switch (e.key) {
    case "ArrowUp": if (dy === 0) { dx = 0; dy = -20; } break;
    case "ArrowDown": if (dy === 0) { dx = 0; dy = 20; } break;
    case "ArrowLeft": if (dx === 0) { dx = -20; dy = 0; } break;
    case "ArrowRight": if (dx === 0) { dx = 20; dy = 0; } break;
  }
}

keysBtn.onclick = () => {
  if (!interval) interval = setInterval(moveSnake, 100);
  keysActive = true;
  mouseActive = false;
  setButtonSelection(keysBtn);
  document.removeEventListener("mousemove", handleMouseMove);
  alert("Keys activated. Use arrow keys to play!");
};

mouseBtn.onclick = () => {
  if (!interval) interval = setInterval(moveSnake, 100);
  mouseActive = true;
  keysActive = false;
  setButtonSelection(mouseBtn);
  document.addEventListener("mousemove", handleMouseMove);
  alert("Mouse mode activated. Move your cursor inside the boundary to control the snake!");
};

pauseBtn.onclick = () => {
  gamePaused = !gamePaused;
  pauseBtn.textContent = gamePaused ? "Resume" : "Pause";
  
  if (gamePaused) {
    setButtonSelection(pauseBtn);
  } else {
    // If resuming, restore the previous active button selection
    if (keysActive) {
      setButtonSelection(keysBtn);
    } else if (mouseActive) {
      setButtonSelection(mouseBtn);
    } else {
      pauseBtn.classList.remove('selected');
    }
  }
};

restartBtn.onclick = () => {
  snake = [{ x: 200, y: 200 }];
  dx = 20;
  dy = 0;
  score = 0;
  scoreDisplay.textContent = "Score: 0";
  foodPos = randomFood();
  gamePaused = false;
  pauseBtn.textContent = "Pause";
  keysActive = true;
  mouseActive = false;
  mouseTarget = null;
  document.removeEventListener("mousemove", handleMouseMove);
  drawSnake();
  clearInterval(interval);
  interval = setInterval(moveSnake, 100);
  
  // Set keys as selected after restart
  setButtonSelection(keysBtn);
};

document.addEventListener("keydown", handleKey);
drawSnake();

// Modal functionality for rules
function openRulesModal() {
  const modal = document.getElementById("rulesModal");
  modal.style.display = "block";
  
  // Close modal when clicking outside of it
  modal.onclick = function(event) {
    if (event.target === modal) {
      closeRulesModal();
    }
  }
  
  // Close modal with Escape key
  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && modal.style.display === "block") {
      closeRulesModal();
    }
  });
}

function closeRulesModal() {
  const modal = document.getElementById("rulesModal");
  modal.style.display = "none";
}