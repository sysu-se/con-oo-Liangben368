# con-oo-Liangben368 - Review

## Review 结论

领域对象已经有基本雏形，但当前代码没有形成一个一致、可靠的“领域对象 -> Svelte store -> UI”闭环。真实接入层存在 store 语义错位、撤销重做未接到界面、导入路径不自洽等关键问题；按作业要求看，当前实现很难算作高质量地完成了“真实接入 Svelte 游戏流程”。

## 总体评价

| 维度 | 评价 |
| --- | --- |
| OOP | fair |
| JS Convention | fair |
| Sudoku Business | poor |
| OOD | poor |

## 缺点

### 1. Undo / Redo 按钮没有真正接入领域对象流程

- 严重程度：core
- 位置：src/components/Controls/ActionBar/Actions.svelte:26-35
- 原因：两个按钮只有 `title` 和 `disabled`，没有任何 `on:click` 处理。静态搜索也没有发现别处调用 `@sudoku/stores/game` 导出的 `undo()` / `redo()`，因此界面层的撤销重做实际上不可用，直接违反了作业要求中“Undo / Redo 必须调用你的领域对象逻辑”的核心流程。

### 2. 把 `fixedGrid` 冒充为旧的 `grid`，破坏了现有 UI 契约

- 严重程度：core
- 位置：src/node_modules/@sudoku/stores/grid.js:42-48
- 原因：这里把 `grid` 导出成了 `g.sudoku.getFixedGrid()`，即布尔矩阵，而现有组件仍按“数字盘面”消费它。例如 `src/node_modules/@sudoku/stores/keyboard.js:6-10` 用 `$grid[y][x] !== 0` 判断是否可输入，布尔值会让该判断恒为真，从而持续禁用键盘输入；`src/components/Board/index.svelte:48-51` 也把它当数独数字使用，`userNumber={$grid[y][x] === 0}` 会失真；`src/components/Modal/Types/Share.svelte:11` 还会把布尔矩阵传给 `encodeSudoku()`，分享码语义也会出错。这不是小兼容问题，而是接入层破坏了原始 store contract。

### 3. 真实接入层依赖的领域对象导入路径在工程内不自洽

- 严重程度：core
- 位置：src/node_modules/@sudoku/stores/grid.js:6-7
- 原因：这里导入的是 `$lib/domain/Game` 和 `$lib/domain/Sudoku`，但仓库里实际只有 `src/domain/lib/Game.js` 和 `src/domain/lib/Sudoku.js`，不存在 `src/lib/domain/*`；`rollup.config.js` 中也没有对应 alias 配置。仅从静态结构看，这条真实 UI 接入链的导入解析就是断的，说明 Svelte 接入没有被收敛成一个清晰、可验证的工程方案。

### 4. 领域对象向外暴露了可变内部状态，封装性不足

- 严重程度：major
- 位置：src/domain/lib/Sudoku.js:61-75
- 原因：`getUserGrid()`、`getFixedGrid()` 和 `toJSON()` 都直接返回内部数组引用，没有做 defensive copy。这样调用方可以绕过 `guess()` 直接改内部 grid，也可能污染 history 中保存的快照，破坏 `Sudoku` / `Game` 本应承担的状态边界。这既削弱 OOP 封装，也让 Svelte 响应式更新更依赖“外部自觉不要 mutate”。

### 5. 领域对象的输入约束不完整，仍然依赖 UI 保证正确性

- 严重程度：major
- 位置：src/domain/lib/Sudoku.js:8-14
- 原因：`guess()` 在检查边界前就访问 `this.fixedGrid[row][col]`，非法坐标会直接抛异常；同时只用 `isNaN(value)` 和范围判断，不能阻止 `1.5` 这类非整数值。作为数独领域对象，它应自己守住行列边界和 1-9/0 的业务约束，而不是默认上层调用永远正确。

### 6. 仓库中存在一套未打通且 API 已漂移的重复适配层

- 严重程度：minor
- 位置：src/domain/lib/stores/gameStore.js:1-49
- 原因：这个文件本身就在 `src/domain/lib/stores`，却写了 `../domain/Game` / `../domain/Sudoku` 这样的错误相对路径；同时 `invalidCells` 还调用了 `getInvalidCells()`，而 `Sudoku` 实际实现的是 `getInvalidCellsArray()`。静态搜索没有发现它被真实 UI 使用，说明项目里并存了两套接入思路，但没有收敛成单一清晰的 adapter，OOD 上比较混乱。

## 优点

### 1. `Sudoku` 采用了偏不可变的状态演进方式

- 位置：src/domain/lib/Sudoku.js:2-15
- 原因：构造函数会复制传入 grid，`guess()` 也基于复制后的新 grid 返回新 `Sudoku` 实例，而不是直接原地修改。这让历史管理更自然，也比把修改逻辑散落在组件里更符合领域对象建模。

### 2. `Game` 把撤销重做历史集中在领域层管理

- 位置：src/domain/lib/Game.js:15-37
- 原因：`guess()` 会在当前 `historyIndex` 处分叉并截断未来历史，`undo()` / `redo()` 再通过快照恢复 `Sudoku`。这比把历史逻辑放在 `.svelte` 组件里更符合职责分离，也满足了 Homework 里 `Game` 应承担的核心职责。

### 3. 真实 UI 的输入入口已经开始通过 store adapter 汇聚到领域对象

- 位置：src/node_modules/@sudoku/stores/grid.js:9-36
- 原因：`createGameStore()` 内部持有 `Game`，并把 `generate`、`decodeSencode`、`guess`、`applyHint`、`undo`、`redo` 都集中为对外 API。设计意图上，这是符合“View 不直接操作领域对象实例，而是消费 adapter/store”的方向的。

### 4. 派生状态被集中暴露，而不是散落在组件内重复计算

- 位置：src/node_modules/@sudoku/stores/grid.js:56-62
- 原因：`invalidCells` 和供撤销重做使用的 API 都在 store 层统一出口，说明作者意识到了 Svelte 层应更多消费响应式派生结果，而不是在每个组件里复制一份业务判断。

## 补充说明

- 本次结论全部基于静态阅读，没有运行 build、test 或实际手动操作界面。
- 按照你的范围要求，我只审查了 `src/domain/*`，以及与其真实接入相关的 Svelte 代码；当前实际接入点主要落在 `src/node_modules/@sudoku/stores/*`、`src/components/*` 和 `src/App.svelte`。
- 关于“导入路径不可解析”“Undo / Redo 在界面不可达”“`grid` 语义错位会破坏输入/分享流程”等判断，都是根据静态代码路径、store 暴露语义和组件消费方式推断出来的，未做运行时验证。
- `src/domain/lib/stores/gameStore.js` 看起来像一次未完成的 adapter 尝试；真实界面并没有通过它消费领域对象，这也是本次评审将其视为架构混乱信号而不是有效接入成果的原因。
