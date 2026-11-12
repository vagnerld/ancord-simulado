import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  clearAttempt,
  figureUrl,
  formatPercent,
  loadAttempt,
  scoreExam,
  type Choice,
  type Exam,
  type Question,
} from "@/lib/exam"
import { cn } from "@/lib/utils"

export function ResultScreen({ exam }: { exam: Exam }) {
  const attempt = loadAttempt(exam.id)
  const [onlyWrong, setOnlyWrong] = useState(true)
  const submitted = attempt?.submitted === true

  useEffect(() => {
    if (!submitted) window.location.hash = `/${exam.id}`
  }, [submitted, exam.id])

  if (!attempt?.submitted) return null

  const result = scoreExam(exam, attempt.answers)
  const wrong = exam.questions.filter(
    (question) => attempt.answers[String(question.number)] !== question.answer
  )
  const visible = onlyWrong ? wrong : exam.questions

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-3">
        <button
          type="button"
          className="w-fit text-sm text-muted-foreground hover:text-foreground"
          onClick={() => {
            window.location.hash = ""
          }}
        >
          Simulados
        </button>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {exam.title}
          </h1>
          <Badge variant={result.passed ? "secondary" : "destructive"}>
            {result.passed ? "Aprovado" : "Reprovado"}
          </Badge>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-4xl font-semibold tracking-tight">
            {formatPercent(result.percent)}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-base leading-relaxed">
          <p>
            Você acertou {result.correct} de {result.total}.
          </p>
          <p className="text-muted-foreground">
            O corte é {result.needed} acertos, que são 70%.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium">
          {onlyWrong
            ? `${wrong.length} ${wrong.length === 1 ? "questão para revisar" : "questões para revisar"}`
            : "Todas as questões"}
        </h2>
        <Button
          variant="outline"
          onClick={() => setOnlyWrong((value) => !value)}
        >
          {onlyWrong ? "Ver todas" : "Só as erradas"}
        </Button>
      </div>

      {wrong.length === 0 && onlyWrong ? (
        <p className="text-muted-foreground">Você acertou todas.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((question) => (
            <ReviewCard
              key={question.number}
              question={question}
              picked={attempt.answers[String(question.number)]}
            />
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={() => {
            clearAttempt(exam.id)
            window.location.hash = `/${exam.id}`
          }}
        >
          Refazer
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            window.location.hash = ""
          }}
        >
          Voltar aos simulados
        </Button>
      </div>
    </main>
  )
}

function ReviewCard({
  question,
  picked,
}: {
  question: Question
  picked?: Choice
}) {
  const right = picked === question.answer

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Questão {question.number}
          <Badge variant={right ? "secondary" : "destructive"}>
            {right ? "Certa" : "Errou"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 text-base leading-relaxed">
          {question.stem.split("\n").map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        {question.figure ? (
          <img
            src={figureUrl(question.figure)}
            alt="Tabela ou gráfico desta questão"
            className="w-full rounded-lg border bg-white"
          />
        ) : null}
        <div className="flex flex-col gap-2">
          {question.options.map((option) => {
            const isAnswer = option.id === question.answer
            const isPicked = option.id === picked
            return (
              <div
                key={option.id}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm leading-relaxed",
                  isAnswer && "border-emerald-600 bg-emerald-50",
                  isPicked &&
                    !isAnswer &&
                    "border-destructive bg-destructive/10"
                )}
              >
                <span className="font-medium">{option.id}) </span>
                <span className="whitespace-pre-line">{option.text}</span>
                {isAnswer ? (
                  <span className="mt-1 block text-xs font-medium text-emerald-800">
                    Resposta correta
                  </span>
                ) : null}
                {isPicked && !isAnswer ? (
                  <span className="mt-1 block text-xs font-medium text-destructive">
                    Sua resposta
                  </span>
                ) : null}
              </div>
            )
          })}
          {!picked ? (
            <p className="text-sm text-muted-foreground">
              Você deixou em branco.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
