import { writable } from 'svelte/store';
// 导入领域对象API
import { domainGameApi } from './grid';

// -------------- 你原来的所有代码 全部保留 --------------
// 这里放你原本的 game store 代码（比如 gamePaused 之类的）
export const gamePaused = writable(false);
// ... 其他原有代码 ...

// -------------- 只添加这两个函数，其他不动 --------------
export function undo() {
  domainGameApi.undo();
}

export function redo() {
  domainGameApi.redo();
}
