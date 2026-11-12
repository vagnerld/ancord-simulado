import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import {
  figureUrl,
  isChoice,
  loadAttempt,
  saveAttempt,
  type Attempt,
  type Exam,
} from "@/lib/exam"

export function ExamScreen({ exam }: { exam: Exam }) {
  const [attempt, setAttempt] = useState<Attempt>(
    () =>
      loadAttempt(exam.id) ?? {
        answers: {},
        index: 0,
        submitted: false,
      }
  )
  const [confirmOpen, setConfirmOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const skipScroll = useRef(true)

  useEffect(() => {
    if (attempt.submitted) {
      window.location.hash = `/${exam.id}/resultado`
    }
  }, [attempt.submitted, exam.id])

  useEffect(() => {
    if (skipScroll.current) {
      skipScroll.current = false
      return
    }
    cardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [attempt.index])

  const question = exam.questions[attempt.index]
  const answered = Object.keys(attempt.answers).length
  const selected = attempt.answers[String(question.number)]
  const blank = exam.questions.length - answered

  function update(next: Attempt) {
    setAttempt(next)
    saveAttempt(exam.id, next)
  }

  function goTo(index: number) {
    update({ ...attempt, index })
  }

  function finish() {
    update({ ...attempt, submitted: true })
    window.location.hash = `/${exam.id}/resultado`
  }

  function requestFinish() {
    if (blank > 0) {
      setConfirmOpen(true)
      return
    }
    finish()
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => {
              window.location.hash = ""
            }}
          >
            Simulados
          </button>
          <Button variant="outline" onClick={requestFinish}>
            Finalizar prova
          </Button>
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold tracking-tight">{exam.title}</h1>
          <p className="text-sm text-muted-foreground">
            Questão {question.number} de {exam.questions.length} · {answered}{" "}
            respondidas
          </p>
        </div>
        <Progress value={(answered / exam.questions.length) * 100} />
      </header>

      <details className="rounded-lg border px-3 py-2 text-sm">
        <summary className="cursor-pointer font-medium">
          Mapa das questões
        </summary>
        <div className="grid grid-cols-10 gap-1 pt-3">
          {exam.questions.map((item, index) => {
            const done = Boolean(attempt.answers[String(item.number)])
            const current = index === attempt.index
            return (
              <button
                key={item.number}
                type="button"
                onClick={() => goTo(index)}
                className={cn(
                  "h-8 rounded-md border text-xs",
                  current &&
                    "border-primary bg-primary text-primary-foreground",
                  !current && done && "bg-secondary",
                  !current && !done && "text-muted-foreground"
                )}
              >
                {item.number}
              </button>
            )
          })}
        </div>
      </details>

      <Card ref={cardRef} className="scroll-mt-6">
        <CardContent className="flex flex-col gap-5">
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
          <RadioGroup
            value={selected ?? ""}
            onValueChange={(value) => {
              if (!isChoice(value)) return
              update({
                ...attempt,
                answers: {
                  ...attempt.answers,
                  [String(question.number)]: value,
                },
              })
            }}
            className="gap-3"
          >
            {question.options.map((option) => (
              <label
                key={option.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-base leading-relaxed",
                  selected === option.id && "border-primary bg-primary/5"
                )}
              >
                <RadioGroupItem value={option.id} className="mt-1" />
                <span>
                  <span className="font-medium">{option.id}) </span>
                  <span className="whitespace-pre-line">{option.text}</span>
                </span>
              </label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="flex justify-between gap-3">
        <Button
          variant="outline"
          disabled={attempt.index === 0}
          onClick={() => goTo(attempt.index - 1)}
        >
          Anterior
        </Button>
        {attempt.index === exam.questions.length - 1 ? (
          <Button onClick={requestFinish}>Finalizar prova</Button>
        ) : (
          <Button onClick={() => goTo(attempt.index + 1)}>Próxima</Button>
        )}
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finalizar mesmo assim?</AlertDialogTitle>
            <AlertDialogDescription>
              {blank === 1
                ? "Falta 1 questão sem resposta. Ela conta como erro."
                : `Faltam ${blank} questões sem resposta. Elas contam como erro.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar respondendo</AlertDialogCancel>
            <AlertDialogAction onClick={finish}>
              Finalizar prova
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}
