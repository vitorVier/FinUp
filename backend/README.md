Backend — FII Fuzzy Ranking API
Como rodar
bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

Endpoints:

GET /health
POST /analysis/run — busca dados no Fundamentus (scraping) e roda a análise completa
POST /analysis/run-upload — recebe um .xlsx (campo arquivo, multipart/form-data) e roda a análise

Nenhum dos dois grava Excel ou imagem em disco — a resposta já vem com as tabelas (top10, ranking_completo, comparacao_fuzzy_tradicional, regras_fuzzy) e os dados de gráfico (charts) prontos para o front consumir e desenhar.

Estrutura
domain/       lógica fuzzy pura, sem I/O (screening, fuzzy_system, scoring, ranking)
services/     orquestração (analysis_service) e dados de gráfico (chart_data_service)
infra/        scraping do Fundamentus (fundamentus_client)
api/          rotas FastAPI e schemas Pydantic
main.py       bootstrap da app
Testado neste ambiente
Pipeline domain completo (screening → fuzzy → scoring → ranking) com dados sintéticos.
analysis_service.run_analysis de ponta a ponta, incluindo serialização 100% JSON.
Parsing e normalização pt-BR do fundamentus_client (números, percentuais, encoding) com uma tabela HTML sintética no formato real do Fundamentus.
API real via HTTP: /health, /analysis/run-upload com planilha válida (200), planilha com colunas faltando (422) e arquivo de tipo errado (400).
Não testado — precisa validar no seu ambiente
infra/fundamentus_client.fetch_fii_resultado() contra o site real. O sandbox onde rodei isso não tem fundamentus.com.br liberado na rede, então validei a lógica de parsing/normalização com uma tabela HTML sintética fiel ao formato documentado do site, mas não bati na página de verdade. Rode isso localmente antes de confiar no endpoint /analysis/run:
bash
  python3 -c "from infra.fundamentus_client import fetch_fii_resultado; print(fetch_fii_resultado().head())"

Se o Fundamentus tiver mudado alguma coluna, MAPA_COLUNAS/COLUNAS_PERCENTUAL em infra/fundamentus_client.py é o primeiro lugar a ajustar.

O que ficou fora do MVP (de propósito, por decisão sua)
Persistência/histórico de execuções (SQLite) — pode entrar depois como um services/history_service.py + uma tabela, sem mexer no resto.
Robustez de defuzzificação (comparar_metodos_defuzzificacao do código original) — dava para reintroduzir como um campo opcional na resposta se quiser esse painel de diagnóstico de volta.