from django.urls import path, include

urlpatterns = [
    path('users/', include('apps.users.urls')),
    path('sensors/', include('apps.sensors.urls')),
    path('environment/', include('apps.environment.urls')),
]
