import { writable } from 'svelte/store';
// 导入我们暴露的领域对象API
import { domainGameApi } from './grid';

// ... 保留你原有所有代码 ...

// 添加/替换 undo/redo 方法
export function undo() {
  domainGameApi.undo();
}

export function redo() {
  domainGameApi.redo();
}

// ... 保留你原有所有代码 ...

import { Sudoku } from './Sudoku';

export class Game {
  constructor(sudoku, history = [], historyIndex = -1) {
    this.sudoku = sudoku;
    this.history = history;
    this.historyIndex = historyIndex;

    // 初始化历史记录：开局状态入栈
    if (history.length === 0) {
      this.history = [sudoku.toJSON()];
      this.historyIndex = 0;
    }
  }

  // 填数操作：返回全新Game实例
  guess(row, col, value) {
    const newSudoku = this.sudoku.guess(row, col, value);
    // 状态无变化，直接返回原实例
    if (newSudoku === this.sudoku) return this;

    // 截断历史：撤销后做新操作，清除后面的重做栈
    const newHistory = this.history.slice(0, this.historyIndex + 1);
    newHistory.push(newSudoku.toJSON());

    // 返回新的Game实例
    return new Game(newSudoku, newHistory, newHistory.length - 1);
  }

  // 撤销操作
  undo() {
    // 无法撤销：已经是开局状态
    if (this.historyIndex <= 0) return this;
    const newIndex = this.historyIndex - 1;
    const newSudoku = Sudoku.fromJSON(this.history[newIndex]);
    return new Game(newSudoku, this.history, newIndex);
  }

  // 重做操作
  redo() {
    // 无法重做：已经是最新状态
    if (this.historyIndex >= this.history.length - 1) return this;
    const newIndex = this.historyIndex + 1;
    const newSudoku = Sudoku.fromJSON(this.history[newIndex]);
    return new Game(newSudoku, this.history, newIndex);
  }
}
