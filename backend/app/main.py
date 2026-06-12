from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.auth import router as auth_router
from app.api.profiles import router as profiles_router
from app.api.categories import router as categories_router
from app.api.transactions import router as transactions_router
from app.api.transfers import router as transfers_router
from app.api.dashboard import router as dashboard_router
from app.core.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title=settings.APP_NAME, version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(profiles_router)
app.include_router(categories_router)
app.include_router(transactions_router)
app.include_router(transfers_router)
app.include_router(dashboard_router)


@app.get("/health")
async def health_check():
    return {"status": "ok"}
