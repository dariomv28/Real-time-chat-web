import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import {useUserStore} from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";

const App = () => {
  const {currentUser, isLoading, fetchUserInfo} = useUserStore(); // Create references to the original attributes and methods
  const {chatId, changeChat} = useChatStore();
  const [showDetail, setShowDetail] = useState(false);
  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      if(user) {
        console.log("User detected:", user);
        fetchUserInfo(user.uid);
      } else {
        console.log("No user logged in."); 
        fetchUserInfo(null); 
      }
      
    });
    return () => {
      unSub();
    };
  }, [fetchUserInfo]);  // When fetchUserInfo changes, it will trigger the code block

  console.log(currentUser);

  if(isLoading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className='container'>
      {
        currentUser? (
          <>
            <List />
            {chatId && <Chat setShowDetail = {setShowDetail}/>}
            {chatId && showDetail && <Detail />} 
          </>
        ) : (<Login />)
      }
      <Notification />
    </div>
  );
}

export default App