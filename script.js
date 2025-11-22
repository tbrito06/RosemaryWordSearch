const words = [
  "MOTHER","LOVE","LAWYER","BABA","GARDEN",
  "LOYAL","FAMILY","FRIENDSHIP","PASSIONATE"
];

const size = 15;
const grid = Array.from({length: size}, () =>
  Array(size).fill("")
);

function placeWord(word) {
  word = word.toUpperCase();
  const directions = [
    [1,0], [-1,0], [0,1], [0,-1],
    [1,1], [1,-1], [-1,1], [-1,-1]
  ];

  let placed = false;
  while (!placed) {
    let row = Math.floor(Math.random() * size);
    let col = Math.floor(Math.random() * size);
    let [dx, dy] = directions[Math.floor(Math.random()*directions.length)];

    let fits = true;

    for (let i=0; i<word.length; i++) {
      let r = row + dy*i;
      let c = col + dx*i;
      if (r < 0 || c < 0 || r >= size || c >= size) { fits=false; break; }
      if (grid[r][c] !== "" && grid[r][c] !== word[i]) { fits=false; break; }
    }

    if (fits) {
      for (let i=0; i<word.length; i++) {
        let r = row + dy*i;
        let c = col + dx*i;
        grid[r][c] = word[i];
      }
      placed = true;
    }
  }
}

words.forEach(placeWord);

// Fill empty spaces
const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
for (let r=0; r<size; r++) {
  for (let c=0; c<size; c++) {
    if (grid[r][c] === "") {
      grid[r][c] = letters[Math.floor(Math.random()*letters.length)];
    }
  }
}

// Draw on canvas
const canvas = document.getElementById("wordsearch");
const ctx = canvas.getContext("2d");
ctx.font = "24px Arial";
ctx.textAlign = "center";
ctx.textBaseline = "middle";

const cell = canvas.width / size;

for (let r=0; r<size; r++) {
  for (let c=0; c<size; c++) {
    ctx.strokeRect(c*cell, r*cell, cell, cell);
    ctx.fillText(grid[r][c], c*cell + cell/2, r*cell + cell/2);
  }
}
