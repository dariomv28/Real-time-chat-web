import "./chat.css"
import EmojiPicker from "emoji-picker-react"
import { arrayUnion, doc, onSnapshot, updateDoc } from "firebase/firestore";
import {useEffect, useRef, useState} from "react";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { getDoc } from "firebase/firestore";

const Chat = ({ setShowDetail }) => {
    const [chat, setChat] = useState();
    const [openEmoji, setOpenEmoji] = useState(false);
    const [text, setText] = useState("");
    const endRef = useRef(null);
    const {chatId, user, isCurrentUserBlocked, isReceiverBlocked} = useChatStore();
    const {currentUser} = useUserStore();
    const [timeUpdater, setTimeUpdater] = useState(0);

    const handleSend = async () => {
        if (text === "") return;

        try {
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createAt: new Date(),
                }),
            });

            const userIDs = [currentUser.id, user.id];

            userIDs.forEach(async(id) => {
                const userChatsRef = doc(db, "userchats", id);
                const userChatsSnapshot = await getDoc(userChatsRef);
                if(userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();
                    const chatIndex = userChatsData.chats.findIndex(c => c.chatId === chatId);
                    userChatsData.chats[chatIndex].lastMessage = text;
                    userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
                    userChatsData.chats[chatIndex].updatedAt = Date.now();
                    await updateDoc(userChatsRef, {
                        chats: userChatsData.chats,

                    });
                }
            });
            setText("");
        } catch(err) {
            console.log(err);
        }
    };

    const handleKeyPress = (e) => {
        if(e.key === "Enter" && !isCurrentUserBlocked && !isReceiverBlocked) {
            handleSend();
        }
    }

    const formatTime = (timeStamp) => {
        const now = new Date();
        const messageDate = timeStamp?.seconds
            ? new Date(timeStamp.seconds * 1000)
            : new Date(timeStamp);
        const diff = Math.floor((now - messageDate) / 1000);

        if (diff < 60) {
            return `${diff} seconds ago`;
        } else if (diff < 3600) {
            return `${Math.floor(diff / 60)} minutes ago`;
        } else if (diff < 86400) {
            return `${Math.floor(diff / 3600)} hours ago`;
        } else {
            return `${Math.floor(diff / 86400)} days ago`;
        }
    };
    

    useEffect(() => {
        endRef.current?.scrollIntoView({behavior: "smooth"});
    },[chat]);

    useEffect(() => {
        const unSub = onSnapshot(doc(db,"chats",chatId),(res) => {
            setChat(res.data());
        })

        return () => {
            unSub();
        }
    },[chatId]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeUpdater((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval); 
    }, []);


    console.log(chat)

    return(
        <div className='chat'>
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} alt=""/>
                    <div className="texts">
                        <span>{user?.username}</span>
                        {/* <p>Lorem ipsum dolor sit amet.</p> */}
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png"/>
                    <img src="./video.png"/>
                    <img src="./info.png" 
                        onClick={() => setShowDetail(prev => !prev)}
                    />
                </div>
            </div>

            <div className="center">
                {chat?.messages?.map((message) => (
                    <div className={message.senderId === currentUser?.id ? "message own" : "message"} key = {message?.createAt}>
                        <div className="texts">
                            {message.img && <img src={message.img} alt="" />}
                            <p>{message.text}</p>
                            <span>{formatTime(message?.createAt)}</span>
                        </div>
                    </div>
                ))}
                

                <div ref = {endRef}></div>
            </div>

            <div className="bottom">
                <div className="icons">
                    <img src="./img.png" alt=""/>
                    <img src="./camera.png" alt=""/>
                    <img src="./mic.png" alt=""/>
                </div>

                <div className="messageInput">

                  <input type="text" placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "You cannot send a message" : "Type a message..."} 
                  onChange={e => setText(e.target.value)} 
                  value={text} 
                  disabled = {isCurrentUserBlocked || isReceiverBlocked} 
                  onKeyDown={handleKeyPress}/>

                  <img src="./emoji.png" alt="" onClick={() => setOpenEmoji(prev => !prev)}/>

                </div>
                <div className="emojiPicker">
                   <EmojiPicker open = {openEmoji} onEmojiClick={e => {
                        setText(prev => prev += e.emoji);
                        setOpenEmoji(false);
                   }}/>
                </div>
                <button className="sendButton" onClick={handleSend} disabled = {isCurrentUserBlocked || isReceiverBlocked}>Send</button>
            </div>
        </div>
    )
}
export default Chat