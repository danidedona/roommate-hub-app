import { useFirestoreCollection } from "./useFirestoreCollection";
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

export const useShoppingList = () => {
  const shoppingList = useFirestoreCollection(db, "shoppingList");

  const addShoppingItem = async (name, dueDate = "") => {
    if (!name?.trim()) return alert("Item name cannot be empty");
    try {
      await addDoc(collection(db, "shoppingList"), {
        name: name.trim(),
        isCompleted: false,
        dueDate,
      });
    } catch (err) {
      console.error("Error adding shopping item:", err);
    }
  };

  const toggleShoppingItem = async (id, isCompleted) => {
    try {
      await updateDoc(doc(db, "shoppingList", id), {
        isCompleted: !isCompleted,
      });
    } catch (err) {
      console.error("Error updating shopping item:", err);
    }
  };

  const deleteShoppingItem = async (id) => {
    try {
      await deleteDoc(doc(db, "shoppingList", id));
    } catch (err) {
      console.error("Error deleting shopping item:", err);
    }
  };

  const deleteBoughtItems = async () => {
    try {
      const snapshot = await getDocs(collection(db, "shoppingList"));
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.isCompleted) {
          deleteDoc(doc(db, "shoppingList", docSnap.id));
        }
      });
    } catch (err) {
      console.error("Error deleting bought items:", err);
    }
  };

  return {
    shoppingList,
    addShoppingItem,
    toggleShoppingItem,
    deleteShoppingItem,
    deleteBoughtItems,
  };
};
