import "./addNewUser.css"
import { arrayUnion, collection, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { getDocs } from "firebase/firestore";
import { useState } from "react";
import { setDoc } from "firebase/firestore";
import { useUserStore } from "../../../../lib/userStore";
import { doc } from "firebase/firestore";


const AddNewUser = () => {

    const [user,setUser] = useState(null);
    const {currentUser} = useUserStore();

    const handleSearch = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const username = formData.get("username");
        try {
            const userRef = collection(db, "users");
            const q = query(userRef, where("username", "==", username));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                setUser(querySnapshot.docs[0].data());
            }
        } catch(err) {
            console.log(err);
        }
    }

    const handleAdd = async(e) => {
        
        const chatRef = collection(db, "chats");
        const userChatsRef = collection(db, "userchats")
        
        try {
            const newChatRef = doc(chatRef)
            await setDoc(newChatRef, {
                createdAt: serverTimestamp(),
                messages: [],
            });

            await updateDoc(doc(userChatsRef, user.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: currentUser.id,
                    updatedAt: Date.now(),
                })
            });

            await updateDoc(doc(userChatsRef, currentUser.id), {
                chats: arrayUnion({
                    chatId: newChatRef.id,
                    lastMessage: "",
                    receiverId: user.id,
                    updatedAt: Date.now(),
                })
            });

            console.log(newChatRef.id)

        } catch(err) {
            console.log(err)
        }
    }

    return (
        <div className="addNewUser">
            <form onSubmit={handleSearch}>
                <input type="text" name="username" placeholder="Enter username" />
                <button>Search</button>
            </form> 
            {user && <div className="user">
                <div className="detail">
                    <img src={user.avatar || "./avatar.png"} alt="" />
                    <span>{user.username}</span>
                </div>
                <button onClick={handleAdd}>Add</button>
            </div>}
        </div>
    )
}

export default AddNewUser