import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";
import { useFirestoreCollection } from "./useFirestoreCollection";

export const usePayments = () => {
  const payments = useFirestoreCollection(db, "payments");

  const addPayment = async (payment) => {
    if (!payment.from || !payment.to || !payment.amount) return;
    try {
      await addDoc(collection(db, "payments"), {
        ...payment,
        amount: parseFloat(payment.amount),
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error("Error adding payment:", err);
    }
  };

  const deletePayment = async (id) => {
    try {
      await deleteDoc(doc(db, "payments", id));
    } catch (err) {
      console.error("Error deleting payment:", err);
    }
  };

  const updatePayment = async (id, updatedPayment) => {
    try {
      await updateDoc(doc(db, "payments", id), {
        ...updatedPayment,
        amount: parseFloat(updatedPayment.amount),
      });
    } catch (err) {
      console.error("Error updating payment:", err);
    }
  };

  return { payments, addPayment, deletePayment, updatePayment };
};
