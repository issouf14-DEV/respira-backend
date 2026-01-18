from django.urls import path
from . import views

urlpatterns = [
    path('prediction-data/', views.ai_prediction_data, name='ai-prediction-data'),
]