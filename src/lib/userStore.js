import { create } from 'zustand';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
export const useUserStore = create((set) => ({
    // set is a function of create which update the state of store
  currentUser: null,
  isLoading: true,
  fetchUserInfo: async(uid) => {
    console.log("Fetching user info for UID:", uid);
    if (!uid) {
        return set({currentUser: null, isLoading: false});
    }
    try {
        const docRef = doc(db, "users", uid); // Create a reference to the document in firestore
        const docSnap = await getDoc(docRef); // Get that document
        if (docSnap.exists()) {
            console.log("User data found:", docSnap.data());
            set({currentUser: docSnap.data(), isLoading: false}); // docSnap.data() is the data of that documnt
        }
        else {
            console.log("No user data for UID:", uid);
            set({currentUser: null, isLoading: false});
        }
    } catch(err) {
        console.log(err)
        return set({currentUser: null, isLoading: false});
    }
  }
}));

