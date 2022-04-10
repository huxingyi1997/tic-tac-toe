// 通过数组排布获取棋子的行数和列数
export function getPosition(index) {
  if (typeof index !== 'number' || index < 0 || index > 9) {
    return '';
  }
  console.log(index);
  let row = Math.floor(index / 3) + 1, col = index % 3 + 1;
  let position = '(' + row + ', ' + col + ')';
  return position;
}


// 判断胜者
export function calculateWinner(squares) {
  // 获胜的序号
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    // 有人获胜
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
