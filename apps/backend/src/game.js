import { v4 as uuidv4 } from "uuid"
import axios from "axios"
import { emit, Events } from "./events.js"

const puzzles = new Map()

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function makeExternalBananaPuzzle() {
  try {
    const res = await axios.get("https://marcconrad.com/uob/banana/api.php?out=json")
    const { question, solution } = res.data
    const id = uuidv4()
    const payload = { 
      id, 
      type: "external", 
      question, 
      solution: String(solution), 
      hint: "Find the missing digit in the image!" 
    }
    puzzles.set(id, payload)
    return payload
  } catch (err) {
    console.error("External Banana API Error", err.message)
    return null
  }
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
  const ops = ["+", "-", "x", "/"]
  
  // Row 1: n1 op1 n2 = r1
  // Row 2: n3 op2 n4 = r2
  // Vertical equations (always addition in the image):
  // Col 1: n1 + n3 = v1
  // Col 2: n2 + n4 = v2
  // Col 3: r1 + r2 = v3
  // Row 3: v1 op3 v2 = v3

  let attempts = 0
  while (attempts < 1000) {
    attempts++
    const n1 = rand(10, 500), n2 = rand(2, 100), n3 = rand(10, 500), n4 = rand(2, 100)
    const op1 = ops[rand(0, 3)], op2 = ops[rand(0, 3)]
    
    let r1, r2
    if (op1 === "+") r1 = n1 + n2
    else if (op1 === "-") { r1 = n1 - n2; if (r1 <= 0) continue }
    else if (op1 === "x") { r1 = n1 * n2; if (r1 > 2000) continue }
    else { if (n1 % n2 !== 0) continue; r1 = n1 / n2 }

    if (op2 === "+") r2 = n3 + n4
    else if (op2 === "-") { r2 = n3 - n4; if (r2 <= 0) continue }
    else if (op2 === "x") { r2 = n3 * n4; if (r2 > 2000) continue }
    else { if (n3 % n4 !== 0) continue; r2 = n3 / n4 }

    // Result row results
    const v1 = n1 + n3, v2 = n2 + n4, v3 = r1 + r2
    
    // Check if any op3 satisfies v1 op3 v2 = v3
    let op3 = null
    if (v1 + v2 === v3) op3 = "+"
    else if (v1 - v2 === v3) op3 = "-"
    else if (v1 * v2 === v3) op3 = "x"
    else if (v1 % v2 === 0 && v1 / v2 === v3) op3 = "/"
    
    if (op3) {
      const H = 2 * size - 1 // 5
      const W = 2 * size - 1 // 5
      const tokens = Array(H * W).fill("")
      const idx = (r, c) => r * W + c

      // Row 1
      tokens[idx(0, 0)] = String(n1); tokens[idx(0, 1)] = op1 === "/" ? "÷" : op1 === "x" ? "×" : op1
      tokens[idx(0, 2)] = String(n2); tokens[idx(0, 3)] = "="; tokens[idx(0, 4)] = String(r1)
      // Row 2
      tokens[idx(2, 0)] = String(n3); tokens[idx(2, 1)] = op2 === "/" ? "÷" : op2 === "x" ? "×" : op2
      tokens[idx(2, 2)] = String(n4); tokens[idx(2, 3)] = "="; tokens[idx(2, 4)] = String(r2)
      // Row 3 (Results)
      tokens[idx(4, 0)] = String(v1); tokens[idx(4, 1)] = op3 === "/" ? "÷" : op3 === "x" ? "×" : op3
      tokens[idx(4, 2)] = String(v2); tokens[idx(4, 3)] = "="; tokens[idx(4, 4)] = String(v3)
      // Vertical operators
      tokens[idx(1, 0)] = "+"; tokens[idx(1, 2)] = "+"; tokens[idx(1, 4)] = "+"
      tokens[idx(3, 0)] = "="; tokens[idx(3, 2)] = "="; tokens[idx(3, 4)] = "="

      // Choose a missing digit within a number cell
      const numberPositions = []
      for (let r = 0; r < H; r++) {
        for (let c = 0; c < W; c++) {
          const t = tokens[idx(r, c)]
          if (t && /^[0-9]+$/.test(t)) numberPositions.push(idx(r, c))
        }
      }
      const posIdx = numberPositions[rand(0, numberPositions.length - 1)]
      const tokenStr = tokens[posIdx]
      const digitIdx = rand(0, tokenStr.length - 1)
      const solution = tokenStr[digitIdx]

      const id = uuidv4()
      const hint = "Find the missing digit to satisfy all equations"
      const payload = { id, type: "equations", gridW: W, gridH: H, tokens, missingIndex: posIdx, digitIndex: digitIdx, solution, hint }
      puzzles.set(id, payload)
      return payload
    }
  }
  return null
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

export async function puzzle(req, res) {
  const { difficulty = "easy", mode } = req.query
  let p = null
  if (mode === "equations") p = await makeExternalBananaPuzzle()
  else if (mode === "three" || mode === "threeDigits") p = makeThreeDigitsPuzzle()
  else p = makePuzzle(difficulty)
  
  if (!p) return res.status(500).json({ error: "puzzle_generation_failed" })
  
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
