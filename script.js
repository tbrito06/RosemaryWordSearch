// Word list (uppercase)
const words = [
  "MOTHER","LOVE","LAWYER","BABA","GARDEN","LOYAL","FAMILY","FRIENDSHIP","PASSIONATE","ROSEMARY"
];

const size = 15;
let grid = [];
let isDragging = false;
let startCell = null;
let currentHighlighted = []; // cells currently highlighted while dragging
let foundWords = new Set();
let confettiLaunched = false;


// Build/initialize grid
function createEmptyGrid() {
  return Array.from({ length: size }, () => Array(size).fill(""));
}

function placeWord(grid, word) {
  word = word.toUpperCase();
  const directions = [
    [1,0], [-1,0], [0,1], [0,-1],
    [1,1], [1,-1], [-1,1], [-1,-1]
  ];

  let attempts = 0;
  while (attempts < 1000) {
    attempts++;
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];

    let fits = true;
    for (let i = 0; i < word.length; i++) {
      const r = row + dy * i;
      const c = col + dx * i;
      if (r < 0 || r >= size || c < 0 || c >= size) { fits = false; break; }
      if (grid[r][c] !== "" && grid[r][c] !== word[i]) { fits = false; break; }
    }

    if (fits) {
      for (let i = 0; i < word.length; i++) {
        const r = row + dy * i;
        const c = col + dx * i;
        grid[r][c] = word[i];
      }
      return true;
    }
  }
  // fallback: if we fail to place (extremely unlikely with these sizes), skip
  return false;
}

function fillGrid(grid) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "") grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
    }
  }
}

// Render table
function drawGrid() {
  const table = document.getElementById("puzzle");
  table.innerHTML = "";
  for (let r = 0; r < size; r++) {
    const tr = document.createElement("tr");
    for (let c = 0; c < size; c++) {
      const td = document.createElement("td");
      td.textContent = grid[r][c];
      td.dataset.row = r;
      td.dataset.col = c;
      td.classList.add("cell");
      // mouse events
      td.addEventListener("mousedown", onPointerDown);
      td.addEventListener("mouseover", onPointerOver);
      td.addEventListener("mouseup", onPointerUp);
      // touch events handled globally via touch handlers
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

// Word list rendering
function drawWordList() {
  const ul = document.getElementById("words");
  ul.innerHTML = "";
  words.forEach(w => {
    const li = document.createElement("li");
    li.textContent = w;
    li.dataset.word = w;
    li.classList.add("word-item");
    ul.appendChild(li);
  });
}

// Utilities
function cellFromEventTarget(target) {
  if (!target) return null;
  if (target.tagName && target.tagName.toLowerCase() === "td") return target;
  return null;
}

function clearHighlights() {
  currentHighlighted.forEach(cell => cell.classList.remove("selected"));
  currentHighlighted = [];
}

function cellsBetween(start, end) {
  // returns array of td elements if start->end forms a straight line; otherwise []
  if (!start || !end) return [];
  const r1 = Number(start.dataset.row), c1 = Number(start.dataset.col);
  const r2 = Number(end.dataset.row), c2 = Number(end.dataset.col);

  const dr = Math.sign(r2 - r1);
  const dc = Math.sign(c2 - c1);

  // Not a straight line if movement is not straight or diagonal
  const deltaR = Math.abs(r2 - r1);
  const deltaC = Math.abs(c2 - c1);
  if (!((deltaR === 0) || (deltaC === 0) || (deltaR === deltaC))) return [];

  const cells = [];
  let r = r1, c = c1;
  while (true) {
    const td = document.querySelector(`td[data-row="${r}"][data-col="${c}"]`);
    if (!td) return []; // should not happen
    cells.push(td);
    if (r === r2 && c === c2) break;
    r += dr;
    c += dc;
  }
  return cells;
}

function wordFromCells(cells) {
  return cells.map(td => td.textContent).join("");
}

// Selection handlers (mouse)
function onPointerDown(e) {
  // left button only
  if (e.button !== 0) return;
  const td = cellFromEventTarget(e.currentTarget);
  if (!td) return;
  isDragging = true;
  startCell = td;
  clearHighlights();
  td.classList.add("selected");
  currentHighlighted = [td];
  // prevent text selection
  e.preventDefault();
}

function onPointerOver(e) {
  if (!isDragging) return;
  const td = cellFromEventTarget(e.currentTarget);
  if (!td) return;
  // compute straight-line cells from startCell to current td
  const cells = cellsBetween(startCell, td);
  if (cells.length === 0) {
    // not a straight line — show only startCell as selected
    clearHighlights();
    startCell.classList.add("selected");
    currentHighlighted = [startCell];
    return;
  }
  // update highlight
  clearHighlights();
  cells.forEach(cell => cell.classList.add("selected"));
  currentHighlighted = cells;
}

function onPointerUp(e) {
  if (!isDragging) return;
  isDragging = false;
  // evaluate
  if (currentHighlighted.length > 0) {
    const candidate = wordFromCells(currentHighlighted);
    const candidateRev = candidate.split("").reverse().join("");
    if (words.includes(candidate) && !foundWords.has(candidate)) {
      markFound(currentHighlighted, candidate);
    } else if (words.includes(candidateRev) && !foundWords.has(candidateRev)) {
      markFound(currentHighlighted, candidateRev);
    } else {
      // not found — brief visual feedback then clear
      // (we simply clear selection)
    }
  }
  clearHighlights();
  startCell = null;
}

// Touch support (map touch to underlying td)
function touchStart(e) {
  if (e.changedTouches.length === 0) return;
  const t = e.changedTouches[0];
  const el = document.elementFromPoint(t.clientX, t.clientY);
  const td = cellFromEventTarget(el);
  if (!td) return;
  isDragging = true;
  startCell = td;
  clearHighlights();
  td.classList.add("selected");
  currentHighlighted = [td];
  e.preventDefault();
}

function touchMove(e) {
  if (!isDragging) return;
  if (e.changedTouches.length === 0) return;
  const t = e.changedTouches[0];
  const el = document.elementFromPoint(t.clientX, t.clientY);
  const td = cellFromEventTarget(el);
  if (!td) return;
  const cells = cellsBetween(startCell, td);
  if (cells.length === 0) {
    clearHighlights();
    startCell.classList.add("selected");
    currentHighlighted = [startCell];
    return;
  }
  clearHighlights();
  cells.forEach(cell => cell.classList.add("selected"));
  currentHighlighted = cells;
  e.preventDefault();
}

function touchEnd(e) {
  if (!isDragging) return;
  isDragging = false;
  if (currentHighlighted.length > 0) {
    const candidate = wordFromCells(currentHighlighted);
    const candidateRev = candidate.split("").reverse().join("");
    if (words.includes(candidate) && !foundWords.has(candidate)) {
      markFound(currentHighlighted, candidate);
    } else if (words.includes(candidateRev) && !foundWords.has(candidateRev)) {
      markFound(currentHighlighted, candidateRev);
    }
  }
  clearHighlights();
  startCell = null;
  e.preventDefault();
}

// Mark letters and list entry as found
function markFound(cells, word) {
  // Highlight each cell as “found”
  cells.forEach(cell => cell.classList.add("found"));
  foundWords.add(word);

  // Update word list
  const li = document.querySelector(`li[data-word="${word}"]`);
  if (li) li.classList.add("done");

  // Draw direction line
  drawWordLine(cells);

  // Check win
  checkWin();
}

// Align found word strike through with word orientation
function drawWordLine(cells) {
  const first = cells[0];
  const last = cells[cells.length - 1];

  const r1 = Number(first.dataset.row);
  const c1 = Number(first.dataset.col);
  const r2 = Number(last.dataset.row);
  const c2 = Number(last.dataset.col);

  // Find pixel positions
  const rect1 = first.getBoundingClientRect();
  const rect2 = last.getBoundingClientRect();

  const x1 = rect1.left + rect1.width / 2 + window.scrollX;
  const y1 = rect1.top + rect1.height / 2 + window.scrollY;
  const x2 = rect2.left + rect2.width / 2 + window.scrollX;
  const y2 = rect2.top + rect2.height / 2 + window.scrollY;

  const length = Math.hypot(x2 - x1, y2 - y1);
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);

  const line = document.createElement("div");
  line.className = "word-line";
  line.style.width = `${length}px`;
  line.style.transform = `rotate(${angle}deg)`;
  line.style.left = `${x1}px`;
  line.style.top = `${y1}px`;

  document.getElementById("word-lines").appendChild(line);
}


function checkWin() {
  if (foundWords.size === words.length && !confettiLaunched) {
    confettiLaunched = true;
    launchConfetti();  // start animation
    setTimeout(() => {
      alert("You found all the words! 🎉");
    }, 500);
  }
}


// New puzzle generator
function newPuzzle() {
  foundWords.clear();
  grid = createEmptyGrid();
  // Place words (try a few times if necessary)
  words.forEach(w => placeWord(grid, w));
  fillGrid(grid);
  drawGrid();
  drawWordList();
}

// Wire up button and global touch handlers
document.addEventListener("DOMContentLoaded", () => {
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) resetBtn.addEventListener("click", newPuzzle);

  // touch handlers on the table element
  const puzzleTable = document.getElementById("puzzle");
  puzzleTable.addEventListener("touchstart", touchStart, { passive: false });
  puzzleTable.addEventListener("touchmove", touchMove, { passive: false });
  puzzleTable.addEventListener("touchend", touchEnd, { passive: false });

  // also listen for mouseup anywhere (in case pointer is released outside a cell)
  document.addEventListener("mouseup", () => {
    if (isDragging) {
      onPointerUp();
    }
  });

  newPuzzle();
});


// Confetti generator
function launchConfetti() {
  const count = 80; // how many pieces
  const colors = ['#f94144','#f3722c','#f9c74f','#90be6d','#577590','#43aa8b'];

  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);

  for (let i = 0; i < count; i++) {
    const conf = document.createElement('div');
    conf.className = 'confetti';

    // random horizontal start
    const left = Math.random() * 100;
    conf.style.left = `${left}%`;

    // random size and color
    conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    conf.style.width = `${6 + Math.random() * 10}px`;
    conf.style.height = `${6 + Math.random() * 10}px`;

    // random delay so pieces are slightly staggered
    conf.style.animationDelay = `${Math.random() * 0.5}s`;

    container.appendChild(conf);
  }

  // remove after animation finishes
  setTimeout(() => container.remove(), 6000);
}
