import AddNewUser from "./addNewUser/AddNewUser";
import "./chatList.css"
import {useState} from "react";
import { useUserStore } from "../../../lib/userStore";
import { useEffect } from "react";
import {doc, onSnapshot, getDoc, updateDoc} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

const ChatList = () => {
    const [addMode, setAddMode] = useState(false);
    const {currentUser} = useUserStore();
    const [chats, setChats] = useState([]);
    const {chatId,changeChat} = useChatStore();
    const [input, setInput] = useState("");

    useEffect(() => {
        const unSub = onSnapshot(
            doc(db, "userchats", currentUser.id),
            async (res) => {
                const items = res.data().chats;

                const promises = items.map(async(item)=>{
                    const userDocRef = doc(db, "users", item.receiverId);
                    const userDocSnap = await getDoc(userDocRef);
                    const user = userDocSnap.data();
                    return {...item, user};
                });

                const chatData = await Promise.all(promises);

                setChats(chatData.sort((a,b) => b.updatedAt - a.updatedAt));
            }
        );
        return () => {
            unSub();
        };
    },[currentUser.id]);

    console.log(chats);

    const handleSelect = async (chat) => {
        const userChats = chats.map((item) => {
            const {user, ...rest} = item;
            return rest;
        });
        const chatIndex = userChats.findIndex(item => item.chatId === chat.chatId);
        userChats[chatIndex].isSeen = true;
        const userChatsRef = doc(db, "userchats", currentUser.id);
        try {
            await updateDoc(userChatsRef, {
                chats: userChats,
            })
            changeChat(chat.chatId, chat.user);
        } catch(err) {
            console.log(err);
        }
        
    }

    const filteredChats = chats.filter(c=>c.user.username.toLowerCase().includes(input.toLowerCase()))

    return (
        <div className="chatList">
            <div className="search">
                <div className="searchBar">
                    <img src = "./search.png" alt = "search"/>
                    <input type = "text" placeholder="Search" onChange = {(e) => setInput(e.target.value)}/>
                </div>
                <img src = {addMode ? "./minus.png" : "./plus.png"} alt = "plus" className="add" 
                        onClick={() => setAddMode((prev) => !prev)}/>
            </div>

            {filteredChats.map((chat) => (
                <div className="items" key = {chat.chatId} onClick={()=>handleSelect(chat)}
                style={{
                    backgroundColor: chat?.isSeen ? "transparent" : "rgba(94, 94, 213, 0.452)", 
                }}>
                    <img src={chat.user.avatar || "./avatar.png"} alt=""/>
                    <div className="texts">
                        <span>{chat.user.blocked.includes(currentUser.id)? "User" : chat.user.username}</span>
                        <p>{chat.lastMessage.length > 15 ?
                        chat.lastMessage.substring(0,15) + "..." : 
                        chat.lastMessage}</p>
                    </div>
                </div>
            ))}
            {addMode && <AddNewUser/>}
        </div>
    )
}

export default ChatList;