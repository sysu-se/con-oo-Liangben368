export class Sudoku {
  constructor(grid, fixedGrid = null) {
    this.grid = grid.map(row => [...row]);
    // 兼容你的项目：fixedGrid 对应原来的 $grid（初始盘）
    this.fixedGrid = fixedGrid || grid.map(row => row.map(v => v !== 0));
  }

  // 核心填数
  guess(row, col, value) {
    if (this.fixedGrid[row][col]) return this;
    if (isNaN(value) || value < 0 || value > 9) return this;

    const newGrid = this.grid.map(r => [...r]);
    newGrid[row][col] = value;
    return new Sudoku(newGrid, this.fixedGrid);
  }

  // 兼容你的项目：获取无效单元格，返回数组 ['x,y', ...]
// 替换原来的 getInvalidCellsArray 方法
getInvalidCellsArray() {
  const _invalidCells = [];
  const grid = this.grid; // 当前用户盘
  const SUDOKU_SIZE = 9;
  const BOX_SIZE = 3;

  const addInvalid = (x, y) => {
    const xy = x + ',' + y;
    if (!_invalidCells.includes(xy)) _invalidCells.push(xy);
  };

  for (let y = 0; y < SUDOKU_SIZE; y++) {
    for (let x = 0; x < SUDOKU_SIZE; x++) {
      const value = grid[y][x];
      if (value) {
        // 检查行和列
        for (let i = 0; i < SUDOKU_SIZE; i++) {
          // 检查行
          if (i !== x && grid[y][i] === value) {
            addInvalid(x, y);
          }
          // 检查列
          if (i !== y && grid[i][x] === value) {
            addInvalid(x, i);
          }
        }

        // 检查3x3宫格
        const startY = Math.floor(y / BOX_SIZE) * BOX_SIZE;
        const endY = startY + BOX_SIZE;
        const startX = Math.floor(x / BOX_SIZE) * BOX_SIZE;
        const endX = startX + BOX_SIZE;
        
        for (let row = startY; row < endY; row++) {
          for (let col = startX; col < endX; col++) {
            if (row !== y && col !== x && grid[row][col] === value) {
              addInvalid(col, row);
            }
          }
        }
      }
    }
  }

  return _invalidCells;
}

  // 兼容你的项目：userGrid 就是当前的 grid
  getUserGrid() {
    return this.grid;
  }

  // 兼容你的项目：fixedGrid 就是初始的 grid
  getFixedGrid() {
    return this.fixedGrid;
  }

  isWon() {
    return this.grid.every(row => row.every(v => v !== 0)) && this.getInvalidCellsArray().length === 0;
  }

  toJSON() {
    return { grid: this.grid, fixedGrid: this.fixedGrid };
  }

  static fromJSON(json) {
    return new Sudoku(json.grid, json.fixedGrid);
  }
}
