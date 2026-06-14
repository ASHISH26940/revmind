FROM python:3.11-slim

WORKDIR /app/backend

COPY backend/ .
COPY data/ /app/data/

RUN pip install --no-cache-dir .

RUN python seed.py

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
