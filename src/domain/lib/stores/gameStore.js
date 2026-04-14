import { writable, derived } from 'svelte/store';
import { Game } from '../domain/Game';
import { Sudoku } from '../domain/Sudoku';

// ====================== 初始数独盘面 ======================
// 0代表空单元格，你可以替换成项目里原来的初始盘面，和现有UI完全兼容
const INITIAL_SUDOKU_GRID = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

// ====================== 初始化领域对象 ======================
const initialSudoku = new Sudoku(INITIAL_SUDOKU_GRID);
const initialGame = new Game(initialSudoku);

// ====================== 创建Custom Store ======================
function createGameStore() {
  // 内部writable store，持有Game实例
  const { subscribe, update } = writable(initialGame);

  return {
    // 必须的subscribe方法，让Svelte可以用$语法订阅
    subscribe,

    // 暴露给UI的操作方法：所有操作都走领域对象，不直接改状态
    guess: (row, col, value) => update(game => game.guess(row, col, value)),
    undo: () => update(game => game.undo()),
    redo: () => update(game => game.redo()),
    // 可选：重置游戏，后续可扩展
    reset: () => update(() => new Game(new Sudoku(INITIAL_SUDOKU_GRID)))
  };
}

// ====================== 导出核心内容 ======================
// 1. 核心game store，UI调用它的操作方法
export const game = createGameStore();

// 2. 派生状态：UI直接订阅渲染，不用关心内部Game结构
export const grid = derived(game, $game => $game.sudoku.grid);
export const fixedGrid = derived(game, $game => $game.sudoku.fixedGrid);
export const invalidCells = derived(game, $game => $game.sudoku.getInvalidCells());
export const isWon = derived(game, $game => $game.sudoku.isWon());
