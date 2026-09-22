# FII Fuzzy — Frontend

Frontend Next.js + TypeScript + Tailwind + componentes no padrão shadcn/ui + Recharts.

## Rodar

1. Rode sua API FastAPI em `http://localhost:8000`.
2. `npm install`
3. copie `.env.example` para `.env.local` se precisar mudar a URL da API.
4. `npm run dev`
5. abra `http://localhost:3000`.

## Integração

- `POST /analysis/run`: botão Atualizar via Fundamentus.
- `POST /analysis/run-upload`: upload `.xlsx`.
- O frontend usa diretamente `top10`, `ranking_completo`, `charts`, `log_triagem` e `regras_fuzzy` retornados pela API.
- O detalhe do fundo reutiliza as curvas de pertinência enviadas pelo backend e marca o valor atual do fundo.

## Observação

O backend atual informa no README que a robustez de defuzzificação ainda não é retornada pela API. Por isso o painel apresenta esse item como indisponível, sem inventar métricas.
