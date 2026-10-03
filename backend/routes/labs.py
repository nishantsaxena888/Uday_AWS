import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from pydantic import BaseModel
from typing import Optional

from ..database import get_db
from ..models import UserNote

router = APIRouter(prefix="/api/lab", tags=["Lab Notes"])


class LabNoteRequest(BaseModel):
    content: str = ""
    user_id: Optional[str] = "default-user"


@router.get("/{module_id}")
async def get_lab_note(module_id: str, user_id: str = "default-user", db: AsyncSession = Depends(get_db)):
    """Retrieves a user's rich-text lab notes for a module."""
    result = await db.execute(
        select(UserNote).where(
            UserNote.user_id == user_id,
            UserNote.module_id == module_id
        )
    )
    record = result.scalars().first()
    return {"content": record.note_content if record else ""}


@router.post("/{module_id}")
async def save_lab_note(module_id: str, payload: LabNoteRequest, db: AsyncSession = Depends(get_db)):
    """Upserts lab notes for a module. Empty content deletes the note."""
    try:
        result = await db.execute(
            select(UserNote).where(
                UserNote.user_id == payload.user_id,
                UserNote.module_id == module_id
            )
        )
        record = result.scalars().first()

        content = (payload.content or "").strip()
        if not content or content == "<br>":
            if record:
                await db.delete(record)
            await db.commit()
            return {"ok": True, "deleted": True}

        if record:
            record.note_content = content
            record.updated_at = datetime.datetime.utcnow()
        else:
            db.add(UserNote(
                user_id=payload.user_id,
                module_id=module_id,
                note_content=content,
                updated_at=datetime.datetime.utcnow()
            ))
        await db.commit()
        return {"ok": True}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save lab note: {str(e)}")
