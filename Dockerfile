FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    postgresql-client libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements/ /app/requirements/
RUN pip install --no-cache-dir -r requirements/production.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "respira_project.wsgi:application", "--bind", "0.0.0.0:8000"]
