import "./userInfo.css";
import { useUserStore} from "../../../lib/userStore";
import { auth } from "../../../lib/firebase";
const Userinfo = () => {

    const {currentUser} = useUserStore();
    return(
        
        <div className="userInfo">

            <div className="user">
                <img src = {currentUser.avatar || "./avatar.png"} alt = "User's avatar"/>
                <h2>{currentUser.username}</h2>
            </div>

            <div className="icons">
                <img src = "./more.png" alt = "more"/>
                <img src = "./video.png" alt = "video"/>
                <img src = "./edit.png" alt = "edit"/>
                <img src="./logout.png" alt="" onClick={()=>auth.signOut()}/>
            </div>
        </div>
    )
}

export default Userinfo