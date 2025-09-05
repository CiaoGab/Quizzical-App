import { useState, useEffect } from "react";
import Quiz from "./Quiz";

function App() {
  const [gameStarted, setGameStarted] = useState(false);

function startQuiz() {
    setGameStarted((prev) => !prev);
  }

  return !gameStarted ? (
    <>
      <main className="start-screen">
        <h1>Quizzical</h1>
        <p>Test your knowledge!</p>
        <button onClick={startQuiz}>Start Quiz</button>
      </main>
    </>
  ) : (
    <Quiz />
  );
}

export default App;
