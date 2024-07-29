import React, { useState, useEffect, useRef } from 'react';
import userIcon from '../assets/user.png';
import gptimagelogo from '../assets/ai.png';
import sendbtn from '../assets/send.svg';
import Axios from 'axios';

const ChatWindow = ({ chatId, isActive, updateChatTitle, addMessageToChat, onChatCreated, user_id }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatId !== null && chatId !== -1) {
      Axios.post('http://127.0.0.1:8000/getChatHistory/', { chat_id: chatId })
        .then((res) => {
          if (res.status === 200) {
            console.log('Successfully fetched Chat History');
            setMessages(res.data);
          } else {
            console.log('Chat history not found');
          }
        })
        .catch((err) => {
          console.log('Chat ID not found');
        });
    }
  }, [chatId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (input.trim() === '') return;

    const newMessage = { prompt: input, answer: '', chat_id: chatId };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    if (messages.length === 0 && chatId !== -1) {
      Axios.post('http://127.0.0.1:8000/newChat/', { "user_id": user_id })
        .then((res) => {
          if (res.status === 201) {
            const newChatId = res.data.chat_id;

            Axios.put('http://127.0.0.1:8000/changeTitle/', { chat_id: newChatId, chat_title: input })
              .then((res) => {
                if (res.status === 200) {
                  updateChatTitle(newChatId, input);
                }
              })
              .catch((err) => console.log(err));

            Axios.post('http://127.0.0.1:8000/newChatHistory/', { prompt: input, chat_id: newChatId })
              .then((res) => {
                if (res.status === 201) {
                  const updatedMessage = {
                    prompt: input,
                    answer: res.data.answer,
                    chat_id: newChatId,
                  };

                  setMessages((prevMessages) =>
                    prevMessages.map((msg) =>
                      msg.prompt === input && !msg.answer ? updatedMessage : msg
                    )
                  );

                  onChatCreated(); 
                } else {
                  console.log('Chat cannot be added to history');
                }
              })
              .catch((err) => {
                console.log(err);
              });
          }
        })
        .catch((err) => {
          console.log("Cannot create new chat", err);
        });
    } else {
      Axios.post('http://127.0.0.1:8000/newChatHistory/', { prompt: input, chat_id: chatId })
        .then((res) => {
          if (res.status === 201) {
            const updatedMessage = {
              prompt: input,
              answer: res.data.answer,
              chat_id: chatId,
            };

            setMessages((prevMessages) =>
              prevMessages.map((msg) =>
                msg.prompt === input && !msg.answer ? updatedMessage : msg
              )
            );
          } else {
            console.log('Chat cannot be added to history');
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }

    setInput('');
  };

  return (
    <div className={`mainBar ${isActive ? 'active' : ''}`}>
      <div className="chats">
        {messages.map((msg, index) => (
          <div key={index}>
            <div className="chat prompt">
              <img className="chatimg" src={userIcon} alt="user" />
              <p>{msg.prompt}</p>
            </div>
            {msg.answer && (
              <div className="chat response">
                <img className="chatimg" src={gptimagelogo} alt="ai" />
                <p>{msg.answer}</p>
              </div>
            )}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div className="chatfooter">
        <div className="inp">
          <input 
            type="text" 
            placeholder="Send a message" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') sendMessage(); }}
          />
          <button className="send" onClick={sendMessage}>
            <img src={sendbtn} alt="send" />
          </button>
        </div>
        <p>© 2024 Cute Ai. All rights reserved.</p>
      </div>
    </div>
  );
};

export default ChatWindow;
