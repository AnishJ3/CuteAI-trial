import './App.css';
import gptLogo from './assets/chatgpt.svg';
import addBtn from './assets/add-30.png';
import msgIcon from './assets/message.svg';
import home from './assets/home.svg';
import saved from './assets/bookmark.svg';
import rocket from './assets/rocket.svg';
import ChatWindow from './components/ChatWindow';
import { useState, useEffect } from 'react';
import Axios from 'axios';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';

function App() {
  const [queries, setQueries] = useState([]);
  const [chatWindows, setChatWindows] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [userID, setUserID] = useState(1);
  const [creatingChat, setCreatingChat] = useState(false);

  useEffect(() => {
    Axios.post("http://127.0.0.1:8000/getChats/", { id: userID })
      .then((res) => {
        if (res.status === 201) {
          console.log("Successfully fetched all the chats");
          const chats = res.data.map(chat => ({
            text: chat.chat_title,
            id: chat.chat_id,
            chat_id: chat.chat_id,
            timestamp: new Date(chat.timestamp),
          }));

          chats.sort((a, b) => b.timestamp - a.timestamp);

          setQueries(chats);
          setChatWindows(chats.map(chat => ({ id: chat.chat_id, messages: [] })));

          if (chats.length > 0) {
            setCurrentChatId(chats[0].chat_id);
          } else {
            setCurrentChatId(null);
          }
        } else {
          console.log("Not getting correctly fetched");
          setCurrentChatId(null);
        }
      })
      .catch((err) => {
        console.log(err);
        setCurrentChatId(null);
      });
  }, [userID]);

  const handleNewChatCreation = (newId) => {
    setCreatingChat(true);

    const newQuery = { text: `New Chat ${newId}`, id: newId, chat_id: newId, timestamp: new Date() };
    setQueries([...queries, newQuery]);

    setChatWindows([...chatWindows, { id: newQuery.id, messages: [] }]);
    setCurrentChatId(newId);
    console.log(`Current Chat ID: ${newQuery.id}`);
  };

  const addNewQuery = () => {
    if (creatingChat) return;

    const newId = (queries.length > 0 ? Math.max(...queries.map(q => q.id)) + 1 : 1);

    handleNewChatCreation(newId);
  };

  const handleChatClick = (chat_id) => {
    setCurrentChatId(chat_id);
    console.log(`Current Chat ID: ${chat_id}`);
  };

  const updateChatTitle = (chat_id, chat_title) => {
    setQueries(queries.map(query =>
      query.chat_id === chat_id ? { ...query, text: chat_title } : query
    ));
  };

  const addMessageToChat = (chat_id, message) => {
    setChatWindows(chatWindows.map(chat =>
      chat.id === chat_id ? { ...chat, messages: [...chat.messages, message] } : chat
    ));
  };

  const groupChatsByDate = (chats) => {
    const grouped = {
      today: [],
      yesterday: [],
      last30Days: []
    };

    chats.forEach(chat => {
      if (isToday(chat.timestamp)) {
        grouped.today.push(chat);
      } else if (isYesterday(chat.timestamp)) {
        grouped.yesterday.push(chat);
      } else if (differenceInDays(new Date(), chat.timestamp) <= 30) {
        grouped.last30Days.push(chat);
      }
    });

    return grouped;
  };

  const groupedChats = groupChatsByDate(queries);

  return (
    <div className="App">
      <div className="sideBar">
        <div className="upperSide">
          <div className="upperSideTop">
            <img src={gptLogo} alt="" className="logo" />
            <span className="Brand">Cute Ai</span>
          </div>
          <button className="midbutton" onClick={addNewQuery}>
            <img src={addBtn} alt="New Chat" className="addBtn" />New Chat
          </button>
          <div className="upperSideBottom scrollable">
            {groupedChats.today.length > 0 && (
              <>
                <h3>Today</h3>
                {groupedChats.today.map((query) => (
                  <button
                    className={`query ${query.chat_id === currentChatId ? 'active' : ''}`}
                    key={query.chat_id}
                    onClick={() => handleChatClick(query.chat_id)}
                  >
                    <img src={msgIcon} alt="Query" />{query.text}
                  </button>
                ))}
              </>
            )}
            {groupedChats.yesterday.length > 0 && (
              <>
                <h3>Yesterday</h3>
                {groupedChats.yesterday.map((query) => (
                  <button
                    className={`query ${query.chat_id === currentChatId ? 'active' : ''}`}
                    key={query.chat_id}
                    onClick={() => handleChatClick(query.chat_id)}
                  >
                    <img src={msgIcon} alt="Query" />{query.text}
                  </button>
                ))}
              </>
            )}
            {groupedChats.last30Days.length > 0 && (
              <>
                <h3>Last 30 Days</h3>
                {groupedChats.last30Days.map((query) => (
                  <button
                    className={`query ${query.chat_id === currentChatId ? 'active' : ''}`}
                    key={query.chat_id}
                    onClick={() => handleChatClick(query.chat_id)}
                  >
                    <img src={msgIcon} alt="Query" />{query.text}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
        <div className="lowerSide">
          <div className="listItems">
            <img src={home} alt="Home" className="listitemImg" />Home
          </div>
          <div className="listItems">
            <img src={saved} alt="Saved" className="listitemImg" />Saved
          </div>
          <div className="listItems">
            <img src={rocket} alt="Upgrade to Pro" className="listitemImg" />Upgrade to Pro
          </div>
        </div>
      </div>
      <div className="chatContainer">
        {chatWindows.map((chat) => (
          chat.id === currentChatId &&
          <ChatWindow 
            key={chat.id} 
            chatId={chat.id} 
            isActive={true} 
            updateChatTitle={updateChatTitle} 
            messages={chat.messages}
            addMessageToChat={addMessageToChat}
            onChatCreated={() => setCreatingChat(false)}
            user_id={userID}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
