import { useFirestoreCollection } from "./useFirestoreCollection";
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  query,
  getDocs,
} from "firebase/firestore";

export const useChores = () => {
  const chores = useFirestoreCollection(db, "chores");

  const addChore = async (name, assignedTo = [], dueDate = "") => {
    if (!name?.trim()) {
      alert("Please enter a chore name before submitting!");
      return;
    }
    try {
      await addDoc(collection(db, "chores"), {
        name: name.trim(),
        assignedTo,
        isCompleted: false,
        date: new Date().toISOString().split("T")[0], // creation date
        dueDate, // optional due date
      });
    } catch (err) {
      console.error("Error adding chore:", err);
    }
  };

  const toggleChoreStatus = async (id, isCompleted) => {
    try {
      await updateDoc(doc(db, "chores", id), { isCompleted: !isCompleted });
    } catch (err) {
      console.error("Error updating chore:", err);
    }
  };

  const assignChore = async (id, assignedTo) => {
    try {
      await updateDoc(doc(db, "chores", id), { assignedTo });
    } catch (err) {
      console.error("Error assigning chore:", err);
    }
  };

  const deleteChore = async (id) => {
    try {
      await deleteDoc(doc(db, "chores", id));
    } catch (err) {
      console.error("Error deleting chore:", err);
    }
  };

  const deleteCompletedChores = async () => {
    try {
      const q = query(collection(db, "chores"));
      const snapshot = await getDocs(q);
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.isCompleted) {
          deleteDoc(doc(db, "chores", docSnap.id));
        }
      });
    } catch (err) {
      console.error("Error deleting completed chores:", err);
    }
  };

  return {
    chores,
    addChore,
    toggleChoreStatus,
    assignChore,
    deleteChore,
    deleteCompletedChores,
  };
};
