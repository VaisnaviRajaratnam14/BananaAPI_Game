const board = []

export function addScore(player, score) {
  board.push({ player, score })
  board.sort((a, b) => b.score - a.score)
  if (board.length > 50) board.length = 50
}

export function top(_req, res) {
  res.json({ top: board.slice(0, 10) })
}
