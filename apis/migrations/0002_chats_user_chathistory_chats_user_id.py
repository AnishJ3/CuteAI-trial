# Generated by Django 5.0.7 on 2024-07-28 11:20

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('apis', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Chats',
            fields=[
                ('chat_id', models.AutoField(primary_key=True, serialize=False)),
                ('timestamp', models.DateTimeField(auto_now_add=True)),
            ],
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('user_id', models.BigAutoField(primary_key=True, serialize=False)),
                ('user_name', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='ChatHistory',
            fields=[
                ('prompt_id', models.AutoField(primary_key=True, serialize=False)),
                ('prompt', models.TextField()),
                ('answer', models.TextField()),
                ('chat_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='history', to='apis.chats')),
            ],
        ),
        migrations.AddField(
            model_name='chats',
            name='user_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='apis.user'),
        ),
    ]
