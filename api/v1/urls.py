from django.urls import path, include

urlpatterns = [
    path('users/', include('apps.users.urls')),
    path('sensors/', include('apps.sensors.urls')),
    path('environment/', include('apps.environment.urls')),
    path('ai/', include('apps.ai_prediction.urls')),
    path('chatbot/', include('chatbot.urls')),  # ✅ Routes chatbot IA
]
