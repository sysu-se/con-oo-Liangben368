export class Sudoku {
  constructor(grid, fixedGrid = null) {
    this.grid = grid.map(row => [...row]);
    this.fixedGrid = fixedGrid || grid.map(row => row.map(v => v !== 0));
  }

  // 核心填数（支持填数字 / 清空为0）
  guess(row, col, value) {
    if (this.fixedGrid[row][col]) return this;
    if (isNaN(value) || value < 0 || value > 9) return this;

    const newGrid = this.grid.map(r => [...r]);
    newGrid[row][col] = value;
    return new Sudoku(newGrid, this.fixedGrid);
  }

  // 完全对齐你项目的冲突检测逻辑（100%兼容）
  getInvalidCellsArray() {
    const _invalidCells = [];
    const grid = this.grid;
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
          for (let i = 0; i < SUDOKU_SIZE; i++) {
            if (i !== x && grid[y][i] === value) {
              addInvalid(x, y);
            }
            if (i !== y && grid[i][x] === value) {
              addInvalid(x, i);
            }
          }

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

  getUserGrid() {
    return this.grid;
  }

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
