import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyABOGI9AN4rRT2JSEuU-JdvLiY6QvY_mk4",
  authDomain: "generateku-b0ccb.firebaseapp.com",
  projectId: "generateku-b0ccb",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export { getFirestore };
