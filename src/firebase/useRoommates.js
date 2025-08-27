import { useFirestoreCollection } from "./useFirestoreCollection";
import { db } from "./firebaseConfig";
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";

export const useRoommates = () => {
  const roommates = useFirestoreCollection(db, "roommates");

  const addRoommate = async (name, email = "") => {
    if (!name.trim()) return;
    try {
      await addDoc(collection(db, "roommates"), {
        name: name.trim(),
        email: email.trim() || null, // store email if provided
      });
    } catch (err) {
      console.error("Error adding roommate:", err);
    }
  };

  const deleteRoommate = async (id) => {
    try {
      await deleteDoc(doc(db, "roommates", id));
    } catch (err) {
      console.error("Error deleting roommate:", err);
    }
  };

  return { roommates, addRoommate, deleteRoommate };
};
