from __future__ import annotations
 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
 
from api.routers.analysis import router as analysis_router
 
app = FastAPI(title="FII Fuzzy Ranking API", version="0.1.0")
 
# Ajuste as origens para o endereço real do seu front em produção.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
 
app.include_router(analysis_router)
 
 
@app.get("/health")
def health():
    return {"status": "ok"}