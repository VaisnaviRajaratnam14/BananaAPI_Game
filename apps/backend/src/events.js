import { EventEmitter } from "events"

const emitter = new EventEmitter()

export function emit(event, payload) {
  emitter.emit(event, payload)
}

export function on(event, handler) {
  emitter.on(event, handler)
}

export const Events = {
  UserLoggedIn: "UserLoggedIn",
  OTPVerified: "OTPVerified",
  GameStarted: "GameStarted",
  PuzzleSolved: "PuzzleSolved",
  ScoreUpdated: "ScoreUpdated",
  AchievementUnlocked: "AchievementUnlocked"
}
