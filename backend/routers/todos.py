from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/todos", tags=["todos"])

@router.get("", response_model=List[schemas.TodoOut])
def get_todos(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return (
        db.query(models.Todo)
        .filter(models.Todo.owner_id == current_user.id)
        .order_by(models.Todo.order, models.Todo.created_at)
        .all()
    )

@router.post("", response_model=schemas.TodoOut, status_code=201)
def create_todo(body: schemas.TodoCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    count = db.query(models.Todo).filter(models.Todo.owner_id == current_user.id).count()
    todo = models.Todo(**body.model_dump(), owner_id=current_user.id, order=count)
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo

@router.put("/{todo_id}", response_model=schemas.TodoOut)
def update_todo(todo_id: int, body: schemas.TodoUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id, models.Todo.owner_id == current_user.id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="할 일을 찾을 수 없습니다.")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(todo, field, value)
    db.commit()
    db.refresh(todo)
    return todo

@router.patch("/{todo_id}/done", response_model=schemas.TodoOut)
def toggle_done(todo_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id, models.Todo.owner_id == current_user.id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="할 일을 찾을 수 없습니다.")
    todo.completed = not todo.completed
    db.commit()
    db.refresh(todo)
    return todo

@router.delete("/{todo_id}", status_code=204)
def delete_todo(todo_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    todo = db.query(models.Todo).filter(models.Todo.id == todo_id, models.Todo.owner_id == current_user.id).first()
    if not todo:
        raise HTTPException(status_code=404, detail="할 일을 찾을 수 없습니다.")
    db.delete(todo)
    db.commit()
