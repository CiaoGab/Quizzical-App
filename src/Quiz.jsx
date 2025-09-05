import { useState, useEffect } from "react";
import mockData from "./mockData";
import { decode } from "html-entities";

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [error, setError] = useState("");

  const fetchQuiz = async () => {
    try {
      const cached = localStorage.getItem("quizData");
      if (cached) {
        setQuestions(JSON.parse(cached));
        return;
      }

      const res = await fetch(
        "https://opentdb.com/api.php?amount=5&category=21&type=multiple"
      );
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();

      const formatted = data.results.map((q) => ({
        question: decode(q.question),
        correct_answer: decode(q.correct_answer),
        incorrect_answers: q.incorrect_answers.map(decode),
        allAnswers: [
          ...q.incorrect_answers.map(decode),
          decode(q.correct_answer),
        ].sort(() => Math.random() - 0.5),
      }));

      setQuestions(formatted);
      localStorage.setItem("quizData", JSON.stringify(formatted));
    } catch (err) {
      console.warn("Using mockData due to API error:", err.message);

      const shuffled = mockData.map((q) => ({
        ...q,
        question: decode(q.question),
        correct_answer: decode(q.correct_answer),
        incorrect_answers: q.incorrect_answers.map(decode),
        allAnswers: [
          ...q.incorrect_answers.map(decode),
          decode(q.correct_answer),
        ].sort(() => Math.random() - 0.5),
      }));

      setQuestions(shuffled);
      localStorage.setItem("quizData", JSON.stringify(shuffled));
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, []);

  function checkAnswers() {
    const allAnswered = questions.every((_, index) => selectedAnswer[index]);

    if (!allAnswered) {
      setError("Please select an answer for each question.");
      return;
    }

    setError("");
    setIsChecked(true);
  }
  function newGame() {
    setIsChecked(false);
    setSelectedAnswer({});
    localStorage.removeItem("quizData");
    fetchQuiz();
  }

  return (
    <main className="quiz-container">
      {questions.map((item, index) => (
        <section className="question-wrapper" key={index}>
          <h1 className="question-text">{item.question}</h1>
          <fieldset>
            {item.allAnswers.map((answer, i) => {
              const isSelected = selectedAnswer[index] === answer;
              const isCorrect = answer === item.correct_answer;

              let style = {};
              if (isChecked) {
                if (isCorrect) {
                  style = { backgroundColor: "#94D7A2", color: "#293264" };
                } else if (isSelected) {
                  style = { backgroundColor: "#F8BCBC", color: "#293264" };
                } else {
                  style = { opacity: 0.6 };
                }
              }

              return (
                <div key={i}>
                  <input
                    className="radio-button"
                    type="radio"
                    id={`q${index}-a${i}`}
                    name={`question-${index}`}
                    value={answer}
                    checked={isSelected}
                    disabled={isChecked}
                    onChange={() =>
                      setSelectedAnswer((prev) => ({
                        ...prev,
                        [index]: answer,
                      }))
                    }
                  />
                  <label
                    className="label-button"
                    htmlFor={`q${index}-a${i}`}
                    style={style}
                  >
                    {answer}
                  </label>
                </div>
              );
            })}
          </fieldset>
          <hr />
        </section>
      ))}
      {error && <p className="select-error">{error}</p>}
      {isChecked ? (
        <button onClick={newGame} className="check">
          New Game
        </button>
      ) : (
        <button onClick={checkAnswers} className="check">
          Check Answers
        </button>
      )}
    </main>
  );
}
