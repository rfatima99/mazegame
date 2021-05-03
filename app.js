const mazeContainer = document.querySelector('.maze');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const pixelRatio = window.devicePixelRatio || 1;
const lineWidth = 3;

let size = 40;

let width = 20;
let rows = 20;

let grid = [];
let maxDistance = 0;
let ballMoves = []
let won = false

let ballLoc
const isLinked = (cellA, cellB) => {
  const link = cellA.links.find(l => l.row === cellB.row && l.col === cellB.col);
  return link;
};

const getNeighbors = cell => {
  const list = [];

  if (cell.cw) list.push(grid[cell.cw.row][cell.cw.col])
  if (cell.ccw) list.push(grid[cell.ccw.row][cell.ccw.col])
  if (cell.inward) list.push(grid[cell.inward.row][cell.inward.col])

  cell.outward.forEach(out => {
    list.push(grid[out.row][out.col]);
  });

  return list;
};

const huntAndKill = () => {
  const randomRow = Math.floor(Math.random() * rows);
  const randomCol = Math.floor(Math.random() * grid[randomRow].length);

  let current = grid[randomRow][randomCol];

  while (current) {
    const unvisitedNeighbors = getNeighbors(current).filter(n => n.links.length === 0);
    const { length } = unvisitedNeighbors;

    if (length) {
      const rand = Math.floor(Math.random() * length);
      const { row, col } = unvisitedNeighbors[rand];

      current.links.push({ row, col });
      grid[row][col].links.push({ row: current.row, col: current.col });

      current = unvisitedNeighbors[rand];
    } else {
      current = null;

      loop:
      for (let row of grid) {
        for (let cell of row) {
          const visitedNeighbors = getNeighbors(cell).filter(n => n.links.length !== 0);

          if (cell.links.length === 0 && visitedNeighbors.length !== 0) {
            current = cell;

            const rand = Math.floor(Math.random() * visitedNeighbors.length);
            const { row, col } = visitedNeighbors[rand];

            current.links.push({ row, col });
            grid[row][col].links.push({ row: current.row, col: current.col });

            break loop;
          }
        }
      }
    }
  }

  renderMaze();
};

// const renderMaze = () => {
//   ctx.clearRect(0, 0, width * pixelRatio, width * pixelRatio);

//   // ctx.strokeStyle = '#000';
//   ctx.strokeStyle = 'white';
//   ctx.lineWidth = lineWidth;

//   for (let row of grid) {
//     for (let cell of row) {
//       if (cell.row) {
//         if (!cell.inward || !isLinked(cell, cell.inward)) {
//           ctx.beginPath();
//           ctx.moveTo(cell.innerCcwX, cell.innerCcwY);
//           ctx.lineTo(cell.innerCwX, cell.innerCwY);
//           ctx.stroke();
//         }

//         if (!cell.cw || !isLinked(cell, cell.cw)) {
//           ctx.beginPath();
//           ctx.moveTo(cell.innerCwX, cell.innerCwY);
//           ctx.lineTo(cell.outerCwX, cell.outerCwY);
//           ctx.stroke();
//         }

//         if (cell.row === grid.length - 1 && cell.col !== row.length * 0.75) {
//           ctx.beginPath();
//           ctx.moveTo(cell.outerCcwX, cell.outerCcwY);
//           ctx.lineTo(cell.outerCwX, cell.outerCwY);
//           ctx.stroke();
//         }
//       }
//     }
//   }
// };

const renderMaze = () => {
  ctx.clearRect(0, 0, width * pixelRatio, width * pixelRatio);

  ctx.strokeStyle = '#ffff';
  ctx.lineWidth = lineWidth;

  for (let row of grid) {
    for (let cell of row) {
      if (cell.row) {
        if (!cell.inward || !isLinked(cell, cell.inward)) {
          let x0=canvas.width/2
          let y0=canvas.height/2
          
          let x1 = cell.innerCcwX
          let y1 = cell.innerCcwY

          let x2 = cell.innerCwX
          let y2 = cell.innerCwY
          
          let r = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
          ctx.beginPath();
          
          ctx.arc(x0, y0, r,  Math.atan2(y1 - y0, x1 - x0), Math.atan2(y2 - y0, x2 - x0),false);
          // ctx.moveTo(cell.innerCcwX, cell.innerCcwY);
          // ctx.lineTo(cell.innerCwX, cell.innerCwY);
          ctx.stroke();
        }

        if (!cell.cw || !isLinked(cell, cell.cw)) {
          ctx.beginPath();
          ctx.moveTo(cell.innerCwX, cell.innerCwY);
          ctx.lineTo(cell.outerCwX, cell.outerCwY);
          ctx.stroke();
        }

        if (cell.row === grid.length - 1 && cell.col !== row.length * 0.75) {
          let x0=canvas.width/2
          let y0=canvas.height/2

          let x1 = cell.outerCcwX
          let y1 = cell.outerCcwY

          let x2 = cell.outerCwX
          let y2 = cell.outerCwY
          
          let r = Math.sqrt((x1 - x0) * (x1 - x0) + (y1 - y0) * (y1 - y0));
          ctx.beginPath();
          ctx.arc(x0, y0, r,  Math.atan2(y1 - y0, x1 - x0), Math.atan2(y2 - y0, x2 - x0),false);
          ctx.stroke();
        }
      }
    }
  }
};

const renderPath = () => {
  let row = grid.length - 1;
  let cell = { ...grid[row][grid[row].length * 0.75] };
  let nextCell = null;
  let { distance } = cell;

  ctx.strokeStyle = '#f00';


  ctx.beginPath();
  ctx.moveTo(cell.centerX, cell.centerY);

  while (distance > 0) {
    const link = cell.links.filter(l => grid[l.row][l.col].distance === distance - 1)[0];
    nextCell = { ...grid[link.row][link.col] };

    ctx.lineTo(cell.centerX, cell.centerY);

    distance -= 1;
    cell = { ...nextCell };
  }

  ctx.lineTo(width * 0.5 * pixelRatio, width * 0.5 * pixelRatio);
  ctx.stroke();
};

const calculateDistance = (row = 0, col = 0, value = 0) => {
  maxDistance = Math.max(maxDistance, value);

  grid[row][col].distance = value;
  grid[row][col].links.forEach(l => {
    const { distance } = grid[l.row][l.col];
    if (!distance && distance !== 0) {
      calculateDistance(l.row, l.col, value + 1);
    }
  });
};

const solveMaze = () => {
  calculateDistance();
  renderPath();
};

const createGrid = () => {
  const rowHeight = 1 / rows;

  grid = [];
  grid.push([{ row: 0, col: 0, links: [], outward: [] }]);

  for (let i = 1; i < rows; i++) {
    const radius = i / rows;
    const circumference = 2 * Math.PI * radius;
    const prevCount = grid[i - 1].length;
    const cellWidth = circumference / prevCount;
    const ratio = Math.round(cellWidth / rowHeight);
    const count = prevCount * ratio;

    const row = [];

    for (let j = 0; j < count; j++) {
      row.push({
        row: i,
        col: j,
        links: [],
        outward: [],
      })
    }

    grid.push(row);
  }

  grid.forEach((row, i) => {
    row.forEach((cell, j) => {
      if (cell.row > 0) {
        cell.cw = { row: i, col: (j === row.length - 1 ? 0 : j + 1) };
        cell.ccw = { row: i, col: (j === 0 ? row.length - 1 : j - 1) };

        const ratio = grid[i].length / grid[i - 1].length;
        const parent = grid[i - 1][Math.floor(j / ratio)];

        cell.inward = { row: parent.row, col: parent.col };
        parent.outward.push({ row: cell.row, col: cell.col });
      }
    });
  });

  positionCells();
};

const positionCells = () => {
  const center = width / 2;

  grid.forEach(row => {
    row.forEach(cell => {
      const angle = 2 * Math.PI / row.length;
      const innerRadius = cell.row * size
      const outerRadius = (cell.row + 1) * size
      const angleCcw = cell.col * angle;
      const angleCw = (cell.col + 1) * angle;

      cell.innerCcwX = Math.round(center + (innerRadius * Math.cos(angleCcw))) * pixelRatio + lineWidth / 2;
      cell.innerCcwY = Math.round(center + (innerRadius * Math.sin(angleCcw))) * pixelRatio + lineWidth / 2;
      cell.outerCcwX = Math.round(center + (outerRadius * Math.cos(angleCcw))) * pixelRatio + lineWidth / 2;
      cell.outerCcwY = Math.round(center + (outerRadius * Math.sin(angleCcw))) * pixelRatio + lineWidth / 2;
      cell.innerCwX = Math.round(center + (innerRadius * Math.cos(angleCw))) * pixelRatio + lineWidth / 2;
      cell.innerCwY = Math.round(center + (innerRadius * Math.sin(angleCw))) * pixelRatio + lineWidth / 2;
      cell.outerCwX = Math.round(center + (outerRadius * Math.cos(angleCw))) * pixelRatio + lineWidth / 2;
      cell.outerCwY = Math.round(center + (outerRadius * Math.sin(angleCw))) * pixelRatio + lineWidth / 2;

      const centerAngle = (angleCcw + angleCw) / 2;

      cell.centerX = (Math.round(center + (innerRadius * Math.cos(centerAngle))) * pixelRatio + lineWidth / 2 +
        Math.round(center + (outerRadius * Math.cos(centerAngle))) * pixelRatio + lineWidth / 2) / 2;
      cell.centerY = (Math.round(center + (innerRadius * Math.sin(centerAngle))) * pixelRatio + lineWidth / 2 +
        Math.round(center + (outerRadius * Math.sin(centerAngle))) * pixelRatio + lineWidth / 2) / 2;
    });
  });
};

const resize = change => {
  width = Math.min(mazeContainer.clientWidth, mazeContainer.clientHeight);

  if (change) {
    size = Math.floor(width / 2 / rows);
  } else {
    rows = Math.floor(width / 2 / size);
  }

  width = 2 * rows * size;

  canvas.width = width * pixelRatio + lineWidth;
  canvas.height = width * pixelRatio + lineWidth;

  canvas.style.width = `${width + lineWidth}px`;
  canvas.style.height = `${width + lineWidth}px`;
};

const createMaze = () => {

  resize();
  createGrid();
  huntAndKill();
};

createMaze();

const createButton = document.querySelector('button.create');
const createButton2 = document.querySelector('i.createIcon');

createButton2.addEventListener('click', () => {
  ballLoc = {
    x: (canvas.width / 2),
    y: (canvas.height / 2)
  }
  ballMoves.push(ballLoc)

  ballMoves = []
  won = false
  createMaze();
});

createButton.addEventListener('click', () => {
  ballLoc = {
    x: (canvas.width / 2),
    y: (canvas.height / 2)
  }
  ballMoves.push(ballLoc)

  ballMoves = []
  won = false
  createMaze();
});


window.addEventListener('resize', () => {

  resize(true);
  positionCells();
  renderMaze();
});
function showCoords(event) {
  let canvasRect = canvas.getBoundingClientRect();
  var x = (event.clientX - canvasRect.x) * pixelRatio;
  var y = (event.clientY - canvasRect.y) * pixelRatio;

  //console.log(coor);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderMaze()

  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fill();
  ball(x, y)
}

function clearCoor() {

}
function ball(mx, my) {
  if (!ballLoc) {
    ballLoc = {
      x: (canvas.width / 2),
      y: (canvas.height / 2)
    }
    ballMoves.push(ballLoc)
  }

  let x = ballLoc.x
  let y = ballLoc.y
  let collision = false
  let r = 1
  let p = ctx.getImageData(x - r, y - r, 2 * r, 2 * r).data;

  if (p.sort()[p.length - 1]) collision = true
  if (collision) ctx.fillStyle = 'red'
  else ctx.fillStyle = 'green'

  ctx.strokeStyle = 'blue'
  if (ballMoves.length >= 1) {
    ctx.beginPath();
    ctx.moveTo(ballMoves[0].x, ballMoves[0].y)
    for (let i = 1; i < ballMoves.length - 1; i++) {
      ctx.lineTo(ballMoves[i].x, ballMoves[i].y)
    }
    ctx.stroke();
  }

  if (canvas.height / 2 - ballLoc.y > canvas.height / 2 - 10 && x> canvas.width / 2+10) {
    if (!won) {
      alert('you win')
      won = true
    }
    solveMaze()
    return
  }
  if (collision) {
    if (ballMoves.length > 1) {
      ballMoves.pop()
      ballLoc = ballMoves[ballMoves.length - 1]
      collision = false;
    }
  }
  else {

    ballLoc = {
      x: (Math.abs(0.1 * mx + 0.9 * x - x) < 2) ? 0.1 * mx + 0.9 * x : x + 2 * Math.sign(.1 * mx + 0.9 * x - x),
      y: (Math.abs(.1 * my + 0.9 * y - y) < 2) ? .1 * my + 0.9 * y : y + 2 * Math.sign(.1 * my + 0.9 * y - y)

    }
    ballMoves.push(ballLoc)
  }

  ctx.beginPath();
  ctx.arc(ballLoc.x, ballLoc.y, 5, 0, 2 * Math.PI);
  ctx.fill();
}

// Register touch event handlers
someElement.addEventListener('touchstart', process_touchstart, false);
someElement.addEventListener('touchmove', process_touchmove, false);
someElement.addEventListener('touchcancel', process_touchcancel, false);
someElement.addEventListener('touchend', process_touchend, false);

// touchstart handler
function process_touchstart(ev) {
  // Use the event's data to call out to the appropriate gesture handlers
  switch (ev.touches.length) {
    case 1: handle_one_touch(ev); break;
    case 2: handle_two_touches(ev); break;
    case 3: handle_three_touches(ev); break;
    default: gesture_not_supported(ev); break;
  }
}

// Create touchstart handler
someElement.addEventListener('touchstart', function(ev) {
  // Iterate through the touch points that were activated
  // for this element and process each event 'target'
  for (var i=0; i < ev.targetTouches.length; i++) {
    process_target(ev.targetTouches[i].target);
  }
}, false);

// touchmove handler
function process_touchmove(ev) {
  // Set call preventDefault()
  ev.preventDefault();
}