from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base, utcnow


class PageProgress(Base):
    """Reading progress and notes for one page of a study document."""
    __tablename__ = "page_progress"

    doc_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    page_id: Mapped[str] = mapped_column(String(160), primary_key=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_visited_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    note: Mapped[str] = mapped_column(Text, default="", nullable=False)


class QuizSession(Base):
    __tablename__ = "quiz_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    mode: Mapped[str] = mapped_column(String(16), nullable=False)  # practice | exam
    question_ids: Mapped[list] = mapped_column(JSON, nullable=False)
    time_limit_seconds: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    score: Mapped[int | None] = mapped_column(Integer)

    attempts: Mapped[list["QuestionAttempt"]] = relationship(back_populates="session")


class QuestionAttempt(Base):
    """One answer to one multiple-choice question, from the reader or a quiz."""
    __tablename__ = "question_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    question_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    session_id: Mapped[int | None] = mapped_column(
        ForeignKey("quiz_sessions.id", ondelete="CASCADE"), index=True)
    selected: Mapped[str] = mapped_column(String(16), nullable=False)  # "A" or "A,C"
    correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    context: Mapped[str] = mapped_column(String(16), nullable=False)  # reader | practice | exam
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow,
                                                 index=True, nullable=False)

    session: Mapped[QuizSession | None] = relationship(back_populates="attempts")


class CardState(Base):
    """Spaced-repetition schedule for one flashcard. No row = never studied."""
    __tablename__ = "card_states"

    card_id: Mapped[str] = mapped_column(String(32), primary_key=True)
    state: Mapped[str] = mapped_column(String(12), nullable=False)  # learning | review | relearning
    step: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    interval_days: Mapped[float] = mapped_column(Float, default=0, nullable=False)
    ease: Mapped[float] = mapped_column(Float, default=2.5, nullable=False)
    reps: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    lapses: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class CardReview(Base):
    __tablename__ = "card_reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    card_id: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 again, 2 hard, 3 good, 4 easy
    state_before: Mapped[str] = mapped_column(String(12), nullable=False)  # new | learning | ...
    interval_days: Mapped[float] = mapped_column(Float, nullable=False)
    reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow,
                                                  index=True, nullable=False)


class DrillAttempt(Base):
    """A subnetting answer: a generated problem (kind) or a worked drill (item_id)."""
    __tablename__ = "drill_attempts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    kind: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    item_id: Mapped[str | None] = mapped_column(String(32), index=True)
    correct: Mapped[bool] = mapped_column(Boolean, nullable=False)
    duration_ms: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow,
                                                 index=True, nullable=False)


class LabProgress(Base):
    __tablename__ = "lab_progress"

    lab_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    note: Mapped[str] = mapped_column(Text, default="", nullable=False)


class LabItemCheck(Base):
    """A ticked task or verification item. Unticking deletes the row."""
    __tablename__ = "lab_item_checks"

    item_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    lab_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    checked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)


class Setting(Base):
    __tablename__ = "settings"

    key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[str] = mapped_column(Text, nullable=False)


class TerminalProgress(Base):
    """A terminal lab: the simulated network's saved state and which tasks currently pass."""
    __tablename__ = "terminal_progress"

    lab_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    state: Mapped[str] = mapped_column(Text, nullable=False)
    passing: Mapped[list] = mapped_column(JSON, default=list, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)


class TerminalTaskPass(Base):
    """The first time a terminal lab task passed. Kept through resets, it feeds the activity map."""
    __tablename__ = "terminal_task_passes"

    lab_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    task_no: Mapped[int] = mapped_column(Integer, primary_key=True)
    passed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True, nullable=False)
