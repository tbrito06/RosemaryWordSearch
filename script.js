const words = [
  "MOTHER","LOVE","LAWYER","BABA","GARDEN",
  "LOYAL","FAMILY","FRIENDSHIP","PASSIONATE","ROSEMARY"
];

const size = 15;
let grid = [];
let selecting = false;
let startCell = null;

// Create empty grid
function createEmptyGrid() {
  grid = Array.from({ length: size }, () => Array(size).fill(""));
}

// Place a word randomly
function placeWord(word) {
  const directions = [
    [1,0],[0,1],[-1,0],[0,-1],
    [1,1],[1,-1],[-1,1],[-1,-1]
  ];
  word = word.toUpperCase();

  while (true) {
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
      break;
    }
  }
}

// Fill unused cells with random letters
function fillGrid() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }
}

// Build the HTML table
function drawGrid() {
  const table = document.getElementById("puzzle");
  table.innerHTML = "";

  for (let r = 0; r < size; r++) {
    const row = document.createElement("tr");
    for (let c = 0; c < size; c++) {
      const cell = document.createElement("td");
      cell.textContent = grid[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener("click", handleCellClick);
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

// Draw word list
function drawWordList() {
  const list = document.getElementById("words");
  list.innerHTML = "";
  words.forEach(w => {
    const li = document.createElement("li");
    li.textContent = w;
    li.id = `word-${w}`;
    list.appendChild(li);
  });
}

// Handle selecting cells
function handleCellClick(e) {
  const cell = e.target;

  if (!selecting) {
    // Start selection
    selecting = true;
    startCell = cell;
    cell.classList.add("selected");
  } else {
    // End selection
    const endCell = cell;
    highlightSelection(startCell, endCell);
    selecting = false;
    startCell = null;
  }
}

// Check selected path for a word
function highlightSelection(start, end) {
  const r1 = Number(start.dataset.row);
  const c1 = Number(start.dataset.col);
  const r2 = Number(end.dataset.row);
  const c2 = Number(end.dataset.col);

  const dx = Math.sign(c2 - c1);
  const dy = Math.sign(r2 - r1);

  let letters = "";
  let cells = [];

  let r = r1, c = c1;

  while (true) {
    const td = document.querySelector(`td[data-row="${r}"][data-col="${c}"]`);
    cells.push(td);
    letters += td.textContent;

    if (r === r2 && c === c2) break;
    r += dy;
    c += dx;
  }

  if (words.includes(letters)) {
    // Correct word found
    cells.forEach(cell => cell.classList.add("found"));
    document.getElementById(`word-${letters}`).classList.add("done");
  } else {
    // Wrong guess → remove temp highlight
    cells.forEach(cell => cell.classList.remove("selected"));
  }
}

// Build everything
function buildPuzzle() {
  createEmptyGrid();
  words.forEach(placeWord);
  fillGrid();
  drawGrid();
  drawWordList();
}

document.getElementById("resetBtn").addEventListener("click", buildPuzzle);

// Initialize on page load
buildPuzzle();
