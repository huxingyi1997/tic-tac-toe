// 导入库
import React from "react";
import ReactDOM from "react-dom";
// 导入样式
import "./index.css";
import { getPosition, calculateWinner } from './utils.js';

// Square 组件渲染了一个单独的 <button>
// 组件只包含一个 render 方法，并且不包含 state，那么使用函数组件简化。父组件引入后，Square组件不需要再保存游戏的 state
function Square(props) {
  return (
    // 接收父组件参数
    <button className={props.className} onClick={props.onClick}>
      {props.value}
    </button>
  );
}

// Board 组件渲染了 9 个方块
class Board extends React.Component {
  // 将Board中的数据转移至Game父组件，无Constructor
  // 渲染棋盘
  renderSquare(i) {
    // return <Square />;
    let className = this.props.winner ?
      this.props.winner.includes(i) ?
        'square win' : 'square' : 'square';
    if (this.props.squares[i] === 'X') className += ' player1';
    if (this.props.squares[i] === 'O') className += ' player2';
    // 增加参数，修改一下 Square 的点击事件监听函数
    return (
      <Square
        // 从 Game 组件中接收 squares 和 onClick 这两个 props。
        key={i % 3 + 1}
        value={this.props.squares[i]}
        className={className}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    // 移到Game组件
    // 渲染改为行列循环遍历
    const n = 3;
    const looper = Array(n).fill().map((_, i) => i + 1);
    return (
      <div>
        {looper.map(row => {
          return (
            <div key={row} className="board-row">
              {
                looper.map(col => {
                  return this.renderSquare((row - 1) * 3 + col - 1);
                })
              }
            </div>
          )
        })}
      </div>
    );
  }
}

// Game 组件渲染了含有默认值的一个棋盘
class Game extends React.Component {
  // 点击事件
  handleClick(i) {
    // 历史，丢弃stepNumber后的数据，注意反向后的表达式
    let history = this.state.isStepsReverse ? this.state.history.slice(this.state.stepNumber) : this.state.history.slice(0, this.state.stepNumber + 1);
    // 当前状态
    const current = this.state.isStepsReverse ? history[0] : history[history.length - 1];
    const squares = current.squares.slice();
    // 当有玩家胜出时，或者某个 Square 已经被填充时，该函数不做任何处理直接返回
    if (calculateWinner(squares) || squares[i]) return;
    // 根据xIsNext判断
    squares[i] = this.state.xIsNext ? "X" : "O";
    // 拼接历史列表
    history = this.state.isStepsReverse ?
      [
        {
          squares: squares,
          position: i
        },
      ].concat(history.slice()) :
      history.slice().concat([
        {
          squares: squares,
          position: i
        },
      ]);
    const stepNumber = this.state.isStepsReverse ? 0 : history.length - 1;
    this.setState({
      history,
      // squares: squares,
      // 更新时间步
      stepNumber,
      // 翻转xIsNext
      xIsNext: !this.state.xIsNext,
    });
  }

  // 更新状态 stepNumber
  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: step % 2 === 0,
    });
  }

  // 反转历史记录
  reverseSteps() {
    this.setState({
      history: this.state.history.slice().reverse(),
      isStepsReverse: !this.state.isStepsReverse,
      stepNumber: this.state.history.length - 1 - this.state.stepNumber,
    })
  }
  // 为 Game 组件添加构造函数，保存历史步骤列表
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          // 记录每个操作的位置
          position: null,
        },
      ],
      // 步数
      stepNumber: 0,
      // 将 “X” 默认设置为先手棋
      xIsNext: true,
      // 历史步骤是否逆序
      isStepsReverse: false
    };
  }

  render() {
    // 状态变化，从子组件提升到父组件
    // 历史
    const history = this.state.history;
    // 当前状态，将代码从始终根据最后一次移动渲染修改为根据当前 stepNumber 渲染
    const current = history[this.state.stepNumber];
    // 计算胜者
    const winnerIndex = calculateWinner(current.squares);
    const winner = winnerIndex ? current.squares[winnerIndex[0]] : null;
    // 计算平局
    const isDraw = !winner && !current.squares.includes(null);
    // 历史步骤映射为代表按钮的 React 元素，然后可以展示出一个按钮的列表，点击这些按钮，可以“跳转”到对应的历史步骤。
    const moves = history.map((step, move) => {
      const display_moves = this.state.isStepsReverse ? history.length - move - 1 : move;
      const desc = display_moves ? "跳转至第" + display_moves + "步" : "游戏重新开始";
      let className = move === step ? 'current-step' : '';
      const position = getPosition(step.position);
      return (
        // 组件的 key 值并不需要在全局都保证唯一，只需要在当前的同一级元素之前保证唯一即可
        <li key={move}>
          <button className={className} onClick={() => this.jumpTo(move)}>{desc}{position}</button>
        </li>
      );
    });
    // 状态
    let status;
    let nextClass;
    // 判断是否获胜
    if (winner) {
      status = "胜者：" + winner;
      nextClass = winner === "X" ? "player1" : "player2";
    } else if (isDraw) {
      status = "平局";
      nextClass = "draw";
    } else {
      status = "下一步: " + (this.state.xIsNext ? "X" : "O");
      nextClass = this.state.xIsNext ? "player1" : "player2";
    }
    let players = [{
      "className": "player1",
      "name": "玩家1:X"
    }, {
      "className": "player2",
      "name": "玩家2:O"
    }];
    // 状态
    const isStepsReverse = this.state.isStepsReverse;
    let reverseButton = isStepsReverse ? "历史记录逆序" : "历史记录顺序";

    return (
      <div className="game">
        <div className="game-board">
          <div className="game-title">
            {players.map((player) => {
              return (<div className={player.className} key={player.className}>
                {player.name}
              </div>)
            })}
          </div>
          <Board
            // 绑定参数和事件
            winner={winnerIndex}
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div className={nextClass + ' status'}>{status}</div>
          <button className="reverse-steps" onClick={() => { this.reverseSteps() }}>{reverseButton}</button>
          <ol className="history-list">{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));
