from django.shortcuts import render

from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import Data,ChatHistory,Chats
from .serializer import DataSerializer,ChatHistorySerializer, ChatsSerializer
from rest_framework import status
from src.chat_ai21 import get_response_llm


@api_view(['GET'])
def getData(request):
    app = Data.objects.all()
    serializer = DataSerializer(app, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def postData(request):
    serializer = DataSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    
    return Response(serializer.data)


@api_view(['POST'])
def getChatHistory(request):
    chat_id = request.data.get('chat_id')
    if chat_id is None:
        return Response({"error": "chat_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    chat_history = ChatHistory.objects.filter(chat_id=chat_id)
    if not chat_history.exists():
        return Response({"error": "No chat history found for the provided chat_id"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ChatHistorySerializer(chat_history, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])

def newChatHistory(request):
    # serializer = ChatHistorySerializer(data=request.data)
    # if serializer.is_valid():
    #     serializer.save()
    #     return Response(serializer.data, status=status.HTTP_201_CREATED)
    # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    prompt= request.data.get("prompt")
    chat_id = request.data.get("chat_id")
    response = get_response_llm(prompt)
    serializer= ChatHistorySerializer(data = {"prompt":prompt , "answer":response, "chat_id":chat_id})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def getChats(request):

    user_id = request.data.get("id")
    
    if user_id is None:
        return Response({"error":"The user_id is missing "}, status = 403)
    
    chats = Chats.objects.filter(user_id = user_id)
    serializer = ChatsSerializer(chats, many=True)
    return Response(serializer.data, status = 201)


@api_view(['POST'])
def newChat(request):
    
    user_id = request.data.get("user_id")
    chat_title = "z"
    serializer = ChatsSerializer(data={
        "user_id":user_id, "chat_title":chat_title
    })

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    print(serializer.errors) 
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def changeTitle(request):
    serializer = ChatHistorySerializer
    # user_id = request.data.get("user_id")
    chat_id = request.data.get("chat_id")
    chat_title = request.data.get("chat_title")

    if  not chat_id or not chat_title:
        return Response({"error": "chat_id, and chat_title are required"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        chat = Chats.objects.get(chat_id=chat_id)
        chat.chat_title = chat_title  # Assuming the title field is named `title`
        chat.save()

        return Response({"message": "Chat title updated successfully"}, status=status.HTTP_200_OK)
    except Chats.DoesNotExist:
        return Response({"error": "Chat not found"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
