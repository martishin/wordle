import { useEffect, useReducer, useState } from "react"
import "./Wordle.css"

const WORD_LIST_API_URL = "/api"
const WORD_LENGTH = 5
const NUM_GUESSES = 6

interface State {
  guesses: (string | null)[]
  currentGuess: string
}

interface Action {
  key: string
  solution: string | null
}

function reducer(state: State, { key, solution }: Action): State {
  const { guesses, currentGuess } = state
  if (guesses[NUM_GUESSES - 1] != null || guesses.includes(solution)) {
    return state
  }

  switch (key) {
    case "Backspace":
      return {
        guesses,
        currentGuess: currentGuess.slice(0, -1),
      }
    case "Enter":
      if (currentGuess.length !== WORD_LENGTH) {
        return state
      }
      const currentGuessIndex = guesses.findIndex((guess) => guess == null)
      const guessesClone = [...guesses]

      guessesClone[currentGuessIndex] = currentGuess
      return {
        guesses: guessesClone,
        currentGuess: "",
      }
    default:
      const charCode = key.toLowerCase().charCodeAt(0)
      const isLetter =
        key.length === 1 && charCode >= "a".charCodeAt(0) && charCode <= "z".charCodeAt(0)
      if (currentGuess.length < WORD_LENGTH && isLetter) {
        return {
          guesses,
          currentGuess: currentGuess + key.toLowerCase(),
        }
      }
      return state
  }
}

export default function Wordle() {
  const [{ guesses, currentGuess }, dispatch] = useReducer(reducer, {
    guesses: Array(NUM_GUESSES).fill(null),
    currentGuess: "",
  })
  const [solution, setSolution] = useState(null)

  useEffect(() => {
    const fetchSolution = async () => {
      const response = await fetch(WORD_LIST_API_URL)
      const words = await response.json()
      setSolution(words[Math.floor(Math.random() * words.length)].toLowerCase())
    }

    fetchSolution()
  }, [])

  useEffect(() => {
    if (solution == null) return

    const onPressKey = (event: KeyboardEvent) => {
      dispatch({ key: event.key, solution })
    }

    window.addEventListener("keydown", onPressKey)

    return () => window.removeEventListener("keydown", onPressKey)
  }, [solution])

  const currentGuessIndex = guesses.findIndex((guess) => guess == null)

  return (
    <div className="board">
      {guesses.map((guess, i) => {
        return (
          <GuessLine
            key={i}
            guess={(i === currentGuessIndex ? currentGuess : guess ?? "").padEnd(WORD_LENGTH)}
            solution={solution}
            isFinal={currentGuessIndex > i || currentGuessIndex === -1}
          />
        )
      })}
    </div>
  )
}

interface GuessLineProps {
  guess: string
  solution: string | null
  isFinal: boolean
}

const GuessLine = ({ guess, solution, isFinal }: GuessLineProps) => {
  return (
    <div className="line">
      {guess.split("").map((char, i) => {
        let className = "tile"

        if (isFinal && solution) {
          if (char === solution[i]) {
            className += " correct"
          } else if (solution.includes(char)) {
            className += " close"
          } else {
            className += " incorrect"
          }
        }

        return (
          <div key={i} className={className}>
            {char}
          </div>
        )
      })}
    </div>
  )
}
