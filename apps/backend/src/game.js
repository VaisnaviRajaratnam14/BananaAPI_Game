import { v4 as uuidv4 } from "uuid"
import { emit, Events } from "./events.js"

const puzzles = new Map()

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function makePuzzle(difficulty) {
  const size = difficulty === "hard" ? 4 : difficulty === "medium" ? 3 : 3
  const base = rand(2, 9)
  const values = []
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      values.push(base * (r + 1) + c)
    }
  }
  const missingIndex = rand(0, values.length - 1)
  const solution = values[missingIndex]
  values[missingIndex] = ""
  const id = uuidv4()
  const hint = `Row and column follow arithmetic patterns`
  const payload = { id, size, values, missingIndex, solution, hint }
  puzzles.set(id, payload)
  return payload
}

function makeEquationsPuzzle() {
  const size = 3
  const N = Array.from({ length: size }, () => Array(size).fill(0))
  // Seed top two rows and left two columns with 1..9
  N[0][0] = rand(1, 9)
  N[0][1] = rand(1, 9)
  N[1][0] = rand(1, 9)
  N[1][1] = rand(1, 9)
  // Row results
  N[0][2] = N[0][0] + N[0][1]
  N[1][2] = N[1][0] + N[1][1]
  // Column results
  N[2][0] = N[0][0] + N[1][0]
  N[2][1] = N[0][1] + N[1][1]
  // Final cell consistent both ways
  N[2][2] = N[2][0] + N[2][1] // equals N[0][2] + N[1][2]

  const H = 2 * size - 1 // 5
  const W = 2 * size - 1 // 5
  const tokens = Array(H * W).fill("")
  const idx = (r, c) => r * W + c
  // Place numbers and horizontal operators/equals/results
  for (let r = 0; r < size; r++) {
    tokens[idx(r * 2, 0)] = String(N[r][0])
    tokens[idx(r * 2, 1)] = "+"
    tokens[idx(r * 2, 2)] = String(N[r][1])
    tokens[idx(r * 2, 3)] = "="
    tokens[idx(r * 2, 4)] = String(N[r][2])
  }
  // Place vertical operators/equals/results
  for (let c = 0; c < size; c++) {
    tokens[idx(1, c * 2)] = "+"
    tokens[idx(3, c * 2)] = "="
    tokens[idx(4, c * 2)] = String(N[2][c])
  }
  // Choose a missing digit among number cells (avoid operators)
  const numberPositions = []
  for (let r = 0; r < H; r++) {
    for (let c = 0; c < W; c++) {
      const t = tokens[idx(r, c)]
      if (t && /^[0-9]+$/.test(t)) numberPositions.push(idx(r, c))
    }
  }
  const missingIndex = numberPositions[rand(0, numberPositions.length - 1)]
  const solution = tokens[missingIndex]
  tokens[missingIndex] = ""
  const id = uuidv4()
  const hint = "All equations use addition horizontally and vertically"
  const payload = { id, type: "equations", gridW: W, gridH: H, tokens, missingIndex, solution, hint }
  puzzles.set(id, payload)
  return payload
}

function makeThreeDigitsPuzzle() {
  const A = rand(0, 9)
  const B = rand(0, 9 - A)
  const C = A + B
  const digits = [A, B, C]
  const missingIndex = rand(0, 2)
  const solution = digits[missingIndex]
  const id = uuidv4()
  const hint = "A + B = C; fill the missing digit"
  const payload = { id, type: "threeDigits", digits, missingIndex, solution, hint }
  puzzles.set(id, payload)
  return payload
}

export function puzzle(req, res) {
  const { difficulty = "easy", mode } = req.query
  let p = null
  if (mode === "equations") p = makeEquationsPuzzle()
  else if (mode === "three" || mode === "threeDigits") p = makeThreeDigitsPuzzle()
  else p = makePuzzle(difficulty)
  emit(Events.GameStarted, { puzzleId: p.id, difficulty })
  res.json(p)
}

export function submit(req, res) {
  const { puzzleId, seconds, earned } = req.body
  const p = puzzles.get(puzzleId)
  if (!p) return res.status(400).json({ error: "invalid_puzzle" })
  emit(Events.PuzzleSolved, { puzzleId, seconds })
  emit(Events.ScoreUpdated, { puzzleId, earned })
  res.json({ ok: true })
}
