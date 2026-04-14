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
  getInvalidCellsArray() {
    const invalid = [];
    const rowUsed = Array.from({ length: 9 }, () => new Set());
    const colUsed = Array.from({ length: 9 }, () => new Set());
    const boxUsed = Array.from({ length: 9 }, () => new Set());

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = this.grid[r][c];
        if (val === 0) continue;

        const boxIndex = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        if (rowUsed[r].has(val) || colUsed[c].has(val) || boxUsed[boxIndex].has(val)) {
          invalid.push(`${c},${r}`); // 注意：你的项目是 x,y 格式
        }
        rowUsed[r].add(val);
        colUsed[c].add(val);
        boxUsed[boxIndex].add(val);
      }
    }
    return invalid;
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
