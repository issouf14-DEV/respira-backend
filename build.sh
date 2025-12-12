#!/bin/bash

echo "🚀 Installation des dépendances..."
pip install -r requirements_render.txt

echo "🔧 Collecte des fichiers statiques..."
python manage.py collectstatic --noinput --settings=respira_project.settings.production

echo "📦 Migration de la base de données..."
python manage.py migrate --settings=respira_project.settings.production

echo "✅ Build terminé avec succès!"