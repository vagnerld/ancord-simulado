import { useEffect, useState } from "react"
import { ExamScreen } from "@/components/exam-screen"
import { HomeScreen } from "@/components/home-screen"
import { ResultScreen } from "@/components/result-screen"
import { exams } from "@/lib/exam"

type Route =
  | { name: "home" }
  | { name: "exam"; id: number }
  | { name: "result"; id: number }

function readRoute(): Route {
  const hash = window.location.hash.replace(/^#/, "")
  const result = hash.match(/^\/([1-6])\/resultado$/)
  if (result) return { name: "result", id: Number(result[1]) }
  const exam = hash.match(/^\/([1-6])$/)
  if (exam) return { name: "exam", id: Number(exam[1]) }
  return { name: "home" }
}

export function App() {
  const [route, setRoute] = useState<Route>(readRoute)

  useEffect(() => {
    const onHash = () => setRoute(readRoute())
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  const exam =
    route.name === "home"
      ? undefined
      : exams.find((item) => item.id === route.id)

  return (
    <div className="min-h-svh bg-background text-foreground">
      {route.name === "home" || !exam ? (
        <HomeScreen />
      ) : route.name === "exam" ? (
        <ExamScreen key={exam.id} exam={exam} />
      ) : (
        <ResultScreen key={exam.id} exam={exam} />
      )}
    </div>
  )
}

export default App
