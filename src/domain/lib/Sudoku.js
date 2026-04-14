export class Sudoku {
  constructor(grid, fixedGrid = null) {
    // 深拷贝，防止外部直接修改内部状态
    this.grid = grid.map(row => [...row]);
    // 固定格：初始非0的格子不可修改
    this.fixedGrid = fixedGrid || grid.map(row => row.map(v => v !== 0));
  }

  // 核心填数接口：返回全新的Sudoku实例，不修改原对象
  guess(row, col, value) {
    // 固定格不允许修改
    if (this.fixedGrid[row][col]) return this;
    // 数值合法性校验
    if (isNaN(value) || value < 0 || value > 9) return this;

    // 生成全新的grid，不修改原数组
    const newGrid = this.grid.map(r => [...r]);
    newGrid[row][col] = value;
    // 返回新实例
    return new Sudoku(newGrid, this.fixedGrid);
  }

  // 校验：返回所有无效单元格的集合，格式如 "0,1"
  getInvalidCells() {
    const invalid = new Set();
    const rowUsed = Array.from({ length: 9 }, () => new Set());
    const colUsed = Array.from({ length: 9 }, () => new Set());
    const boxUsed = Array.from({ length: 9 }, () => new Set());

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = this.grid[r][c];
        if (val === 0) continue;

        const boxIndex = Math.floor(r / 3) * 3 + Math.floor(c / 3);
        // 行、列、3x3宫有重复，标记为无效
        if (rowUsed[r].has(val) || colUsed[c].has(val) || boxUsed[boxIndex].has(val)) {
          invalid.add(`${r},${c}`);
        }
        rowUsed[r].add(val);
        colUsed[c].add(val);
        boxUsed[boxIndex].add(val);
      }
    }
    return invalid;
  }

  // 判断是否通关
  isWon() {
    // 所有格子填完，且无无效单元格
    const allFilled = this.grid.every(row => row.every(v => v !== 0));
    return allFilled && this.getInvalidCells().size === 0;
  }

  // 序列化：用于历史记录存储
  toJSON() {
    return { grid: this.grid, fixedGrid: this.fixedGrid };
  }

  // 反序列化：从历史记录恢复
  static fromJSON(json) {
    return new Sudoku(json.grid, json.fixedGrid);
  }
}
