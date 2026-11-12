import examsData from "@/data/exams.json"

export type Choice = "A" | "B" | "C" | "D"

export type Question = {
  number: number
  code: string
  stem: string
  options: { id: Choice; text: string }[]
  answer: Choice
  figure?: string
}

export type Exam = {
  id: number
  title: string
  questions: Question[]
}

export type Attempt = {
  answers: Record<string, Choice>
  index: number
  submitted: boolean
}

export const PASS_PERCENT = 70
export const exams = examsData as Exam[]

const CHOICES: Choice[] = ["A", "B", "C", "D"]

export function isChoice(value: string): value is Choice {
  return CHOICES.includes(value as Choice)
}

export function storageKey(examId: number) {
  return `ancord-simulado:v1:${examId}`
}

export function loadAttempt(examId: number): Attempt | null {
  try {
    const raw = localStorage.getItem(storageKey(examId))
    if (!raw) return null
    const data = JSON.parse(raw) as Partial<Attempt>
    if (!data || typeof data.answers !== "object" || data.answers === null) {
      return null
    }
    const answers: Record<string, Choice> = {}
    for (const [key, value] of Object.entries(data.answers)) {
      if (typeof value === "string" && isChoice(value)) answers[key] = value
    }
    return {
      answers,
      index: typeof data.index === "number" ? data.index : 0,
      submitted: Boolean(data.submitted),
    }
  } catch {
    return null
  }
}

export function saveAttempt(examId: number, attempt: Attempt) {
  localStorage.setItem(storageKey(examId), JSON.stringify(attempt))
}

export function clearAttempt(examId: number) {
  localStorage.removeItem(storageKey(examId))
}

export function scoreExam(exam: Exam, answers: Record<string, Choice>) {
  const total = exam.questions.length
  const correct = exam.questions.filter(
    (question) => answers[String(question.number)] === question.answer
  ).length
  const percent = (correct / total) * 100
  return {
    correct,
    total,
    percent,
    passed: percent >= PASS_PERCENT,
    needed: Math.round((total * PASS_PERCENT) / 100),
  }
}

export function formatPercent(percent: number) {
  return (
    new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(
      percent
    ) + "%"
  )
}

export function figureUrl(name: string) {
  return `${import.meta.env.BASE_URL}figures/${name}`
}
