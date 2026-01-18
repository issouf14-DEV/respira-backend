"""
Migration pour ajouter les champs Ubidots manquants
"""
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('sensors', '0003_riskalert_sensoranalytics_sensordata_aqi_and_more'),
    ]

    operations = [
        # Ajouter les nouveaux champs pour les capteurs Ubidots
        migrations.AddField(
            model_name='sensordata',
            name='eco2',
            field=models.IntegerField(blank=True, help_text='CO2 équivalent (ppm) - CJMCU-811', null=True),
        ),
        migrations.AddField(
            model_name='sensordata',
            name='tvoc',
            field=models.IntegerField(blank=True, help_text='Composés organiques volatils (ppb) - CJMCU-811', null=True),
        ),
        migrations.AddField(
            model_name='sensordata',
            name='ubidots_device_id',
            field=models.CharField(blank=True, help_text='ID device Ubidots', max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='sensordata',
            name='ubidots_timestamp',
            field=models.BigIntegerField(blank=True, help_text='Timestamp Ubidots (Unix)', null=True),
        ),
        
        # Mettre à jour les help_text pour clarifier les capteurs
        migrations.AlterField(
            model_name='sensordata',
            name='spo2',
            field=models.IntegerField(blank=True, help_text='SpO2 (70-100%) - MAX30102', null=True),
        ),
        migrations.AlterField(
            model_name='sensordata',
            name='heart_rate',
            field=models.IntegerField(blank=True, help_text='Fréquence cardiaque (30-220 bpm) - MAX30102', null=True),
        ),
        migrations.AlterField(
            model_name='sensordata',
            name='temperature',
            field=models.FloatField(blank=True, help_text='Température ambiante (°C) - DHT11', null=True),
        ),
        migrations.AlterField(
            model_name='sensordata',
            name='humidity',
            field=models.IntegerField(blank=True, help_text='Humidité ambiante (%) - DHT11', null=True),
        ),
    ]