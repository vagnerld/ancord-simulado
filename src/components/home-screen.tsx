import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  exams,
  formatClock,
  formatPercent,
  loadAttempt,
  remainingMs,
  scoreExam,
  clearAttempt,
} from "@/lib/exam"

function openExam(id: number) {
  window.location.hash = `/${id}`
}

function openResult(id: number) {
  window.location.hash = `/${id}/resultado`
}

export function HomeScreen() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          Fevereiro de 2024
        </p>
        <h1 className="text-3xl font-semibold tracking-tight">
          Simulado ANCORD
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
          Escolha um dos 6 simulados, responda as 80 questões e veja o
          percentual no final. A aprovação é com 70%, ou seja, 56 acertos. Cada
          prova dura 2h30, e o relógio pausa quando você sai da tela.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {exams.map((exam) => {
          const attempt = loadAttempt(exam.id)
          const answered = attempt ? Object.keys(attempt.answers).length : 0
          const result =
            attempt?.submitted === true
              ? scoreExam(exam, attempt.answers)
              : null

          return (
            <Card key={exam.id}>
              <CardHeader>
                <CardTitle>{exam.title}</CardTitle>
                <CardDescription>80 questões</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {result ? (
                  <Badge variant={result.passed ? "secondary" : "destructive"}>
                    {result.passed ? "Aprovado" : "Reprovado"} ·{" "}
                    {formatPercent(result.percent)}
                  </Badge>
                ) : null}
                <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span>
                    {answered} de {exam.questions.length}
                  </span>
                  {attempt && !result ? (
                    <span className="font-mono tabular-nums">
                      {formatClock(remainingMs(attempt.elapsedMs))}
                    </span>
                  ) : null}
                </div>
                <Progress
                  value={(answered / exam.questions.length) * 100}
                  className="h-2"
                />
              </CardContent>
              <CardFooter className="gap-2">
                {result ? (
                  <Button onClick={() => openResult(exam.id)}>
                    Ver resultado
                  </Button>
                ) : (
                  <Button onClick={() => openExam(exam.id)}>
                    {answered > 0 ? "Continuar" : "Iniciar"}
                  </Button>
                )}
                {attempt ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      clearAttempt(exam.id)
                      openExam(exam.id)
                    }}
                  >
                    Refazer
                  </Button>
                ) : null}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Questões da apostila Simulados para a Ancord 2024, Academia Rafael Toro.
      </p>
    </main>
  )
}
