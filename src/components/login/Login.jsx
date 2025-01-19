import { useState } from "react"
import "./login.css"
import { toast } from "react-toastify"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { auth,db, storage } from "../../lib/firebase"
import {doc, setDoc} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import upload from "../../lib/upload"

const Login = () => {
    
    const [avatar, setAvatar] = useState({
        file: null, url: ""
    })

    const [loading, setLoading] = useState(false)
    const handleAvatar = e => {
        if(e.target.files[0]) {
            setAvatar({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    const handleLogin = async(e) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.target);
        const {email, password} = Object.fromEntries(formData);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            toast.success("Logged in successfully");
        } catch(err) {
            console.error("Error during login:", err);
            toast.error(err.message);
        } finally {
            setLoading(false)
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        
        const formData = new FormData(e.target); // Create an object of FormData from the submitted form
        const {username, email, password} = Object.fromEntries(formData); // Change that object into a Javascript object with username, email and password

        try {
            const res = createUserWithEmailAndPassword(auth, email, password); // Create new user res
            //const imgUrl = await upload(avatar.file)
            await setDoc(doc(db, "users", res.user.uid), {
                username,
                email,
                avatar: null,
                id: res.user.id,
                blocked: [],
            });
            await setDoc(doc(db, "userchats", res.user.uid), { // Create a document in userchats collection
                chats: [],
            });
            toast.success("User created successfully")
        } catch(err) {
            console.log(err)    
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return(
        <div className="login">
            <div className="item">
                <h2>Welcome back!</h2>
                <form onSubmit={handleLogin}>
                    <input type="text" placeholder="Email" name="email" />
                    <input type = "password" placeholder="Password" name="password"/>
                    <span>Forgot Password?</span>
                    <button disabled = {loading}>{loading ? "Loading" : "Login"}</button>
                </form>
            </div>
            <div className="item">
                <h2>NEW USER</h2>
                <span>Please register</span>
                <form onSubmit={handleRegister}>

                    <input type="text" placeholder="Username" name="username"/>
                    <input type="text" placeholder="Email" name="email" />
                    <input type = "password" placeholder="Password" name="password"/>
                    <label htmlFor="file">
                        <img src={avatar.url || "./avatar.png"} alt="" />
                        Your avatar
                    </label>
                    <input type="file" id="file" onChange={handleAvatar}/>
                    <button disabled = {loading}>{loading ? "Loading" : "Sign Up"}</button>
                </form>
            </div>
        </div>
        
    )
}

export default Login