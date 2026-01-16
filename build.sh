#!/bin/bash
set -o errexit

echo "==> Python version:"
python --version

echo "==> Pip version:"
pip --version

echo "==> Installing dependencies..."
pip install --upgrade pip
pip install -r requirements_render.txt

echo "==> Collecting static files..."
python manage.py collectstatic --noinput --settings=respira_project.settings.production

echo "==> Running database migrations..."
python manage.py migrate --noinput --settings=respira_project.settings.production

echo "==> Build completed successfully!"