import { useState, useEffect } from "react";
import { auth, googleProvider } from "./firebaseConfig";
import { signInWithPopup, onAuthStateChanged, signOut } from "firebase/auth";

export const useAuth = () => {
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUserId(result.user.uid);
      setUserEmail(result.user.email);
      console.log("Logged in as:", result.user.displayName, result.user.email);
    } catch (error) {
      console.error("Google sign-in error:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUserId(null);
    setUserEmail(null);
    console.log("User signed out");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        setUserEmail(user.email);
      } else {
        setUserId(null);
        setUserEmail(null);
      }
      setLoading(false); // Only mark loading false once we know auth state
    });

    return () => unsubscribe();
  }, []);

  return { userId, userEmail, loading, handleGoogleSignIn, handleSignOut };
};
