import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

function App() {
  const [user, setUser] = useState<User | null>(null);

  const testLogin = async () => {
    try {
      await signInWithEmailAndPassword(
        auth,
        "test-member@test-union-achievement.com",   // 콘솔에서 만든 계정
        "1234!@#$lg"           // 비밀번호
      );
      console.log("로그인 성공");
    } catch (e) {
      console.error("로그인 실패", e);
    }
  };


  // 업적 불러오기

  const loadAchievements = async () => {
    const snap = await getDocs(collection(db, "achievements"));
    snap.forEach(doc => {
      console.log(doc.id, doc.data());
    });
  }

  return (
    <div>
      <button onClick={testLogin}>테스트 로그인</button>
      <button onClick={loadAchievements}>업적 불러오기</button>
    </div>
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;

      setUser(u);

      const ref = doc(db, "users", u.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        await setDoc(ref, {
          email: u.email,
          role: "member",
          createdAt: new Date(),
        });
      }
    });

    return unsub;
  }, []);

  if (!user) return <div>로그인 필요</div>;

  return <div>로그인 성공</div>;
}

export default App;
