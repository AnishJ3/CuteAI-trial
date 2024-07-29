from django.db import models

class Data(models.Model):
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=500)

class User(models.Model):
    user_id = models.BigAutoField(primary_key=True)
    user_name = models.CharField(max_length=100)

class Chats(models.Model):
    chat_id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    chat_title = models.TextField()
    def __str__(self):
        return f"Chat {self.chat_id} by {self.user_id}"

class ChatHistory(models.Model):
    prompt_id = models.AutoField(primary_key=True)
    chat_id = models.ForeignKey(Chats, on_delete=models.CASCADE, related_name='history')
    prompt = models.TextField()
    answer = models.TextField()

    def __str__(self):
        return f"Prompt {self.prompt_id} for Chat {self.chat_id}"