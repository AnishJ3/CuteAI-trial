from django.urls import path
from . import views
from django.conf import settings

urlpatterns = [
    path('', views.getData),
    path('post/', views.postData),
    path('getChatHistory/', views.getChatHistory),
    path('newChatHistory/', views.newChatHistory),
    path('getChats/', views.getChats),
    path('newChat/', views.newChat),
    path('changeTitle/', views.changeTitle)
]
