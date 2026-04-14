# Sudoku Homework 1.1 设计文档
## 一、领域对象消费方式
1. View层消费对象
UI组件(Board/Cell)不直接接触Sudoku/Game，只消费原有store：$grid、$userGrid、$invalidCells。
通过适配器模式，在grid.js内部封装领域对象，对外接口完全兼容。

2. 数据流向
用户操作 → UI调用store方法 → store转发给Game领域对象 → Sudoku执行逻辑 → 生成新实例 → store更新 → UI自动刷新。

3. 操作入口
- 填数：userGrid.set → gameStore.guess → Game.guess → Sudoku.guess
- 撤销/重做：game.js的undo/redo → domainGameApi → Game.undo/redo
- 冲突检测：完全由Sudoku.getInvalidCellsArray实现

## 二、Svelte响应式机制
1. 依赖机制
使用Svelte 3的writable/derived store + 不可变对象设计。

2. 刷新原理
Sudoku/Game均为不可变对象，每次操作返回新实例。
store检测到对象引用变化，自动通知derived store更新，UI通过$语法订阅，自动刷新DOM。

3. 直接修改的问题
若直接mutate内部数组/对象，引用不变，store不会触发更新，UI不刷新，且历史记录会全部错乱。

## 三、相比HW1的改进
1. 职责边界重构
- Sudoku：仅管理棋盘数据、填数、冲突检测、序列化
- Game：仅管理历史栈、撤销重做、游戏生命周期
2. 不可变改造
从可变对象改为不可变，完美适配Svelte响应式
3. 接入真实UI
新增适配器层，让领域对象真正驱动UI，而非仅在测试中使用
4. 历史管理优化
自动截断撤销后的重做栈，符合正常数独操作逻辑

## 四、Trade-off
优点：
- UI与领域层完全解耦，后续修改逻辑不影响组件
- 响应式稳定，无界面不刷新问题
- 可独立测试领域对象
缺点：
每次操作生成新对象，有极小性能开销，9x9数独可完全忽略。
