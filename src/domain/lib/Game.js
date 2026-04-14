import { Sudoku } from './Sudoku';

export class Game {
  constructor(sudoku, history = [], historyIndex = -1) {
    this.sudoku = sudoku;
    this.history = history;
    this.historyIndex = historyIndex;

    if (history.length === 0) {
      this.history = [sudoku.toJSON()];
      this.historyIndex = 0;
    }
  }

  guess(row, col, value) {
    const newSudoku = this.sudoku.guess(row, col, value);
    if (newSudoku === this.sudoku) return this;

    const newHistory = this.history.slice(0, this.historyIndex + 1);
    newHistory.push(newSudoku.toJSON());

    return new Game(newSudoku, newHistory, newHistory.length - 1);
  }

  undo() {
    if (this.historyIndex <= 0) return this;
    const newIndex = this.historyIndex - 1;
    const newSudoku = Sudoku.fromJSON(this.history[newIndex]);
    return new Game(newSudoku, this.history, newIndex);
  }

  redo() {
    if (this.historyIndex >= this.history.length - 1) return this;
    const newIndex = this.historyIndex + 1;
    const newSudoku = Sudoku.fromJSON(this.history[newIndex]);
    return new Game(newSudoku, this.history, newIndex);
  }
}
