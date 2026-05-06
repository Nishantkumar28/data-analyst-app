"""Dataset model for uploaded file metadata and analysis state."""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Integer, Float, Text, ForeignKey
from database import Base


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # csv, xlsx, json
    file_size = Column(Integer, default=0)  # bytes
    row_count = Column(Integer, default=0)
    column_count = Column(Integer, default=0)
    columns_info = Column(Text, default="{}")  # JSON: column names, types, stats
    preview_data = Column(Text, default="[]")  # JSON: first N rows
    summary_stats = Column(Text, default="{}")  # JSON: basic statistics
    health_score = Column(Float, nullable=True)  # 0-100 quality score
    status = Column(String, default="uploaded")  # uploaded, processing, ready, error
    cleaned_file_path = Column(String, nullable=True)
    cleaning_log = Column(Text, default="[]")  # JSON: list of transformations applied
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Dataset {self.name}>"
