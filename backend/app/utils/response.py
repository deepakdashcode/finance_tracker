from typing import Any

from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse


def success_response(data: Any, status_code: int = 200) -> JSONResponse:
    return JSONResponse(content={"success": True, "data": jsonable_encoder(data)}, status_code=status_code)


def error_response(message: str, status_code: int = 400) -> JSONResponse:
    return JSONResponse(content={"success": False, "message": message}, status_code=status_code)
