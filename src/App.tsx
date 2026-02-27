import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp, addDoc, query, where } from "firebase/firestore";
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

  // 업적 달성 처리

  const achieve = async (achievementId: string) => {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    await setDoc(
      doc(db, "users", user.uid, "userAchievements", achievementId),
      {
        achievedAt: serverTimestamp(),
        rewardGiven: true
      }
    );

    console.log("업적 달성 저장 완료");
  }

  // 활동 기록 추가 함수

  const addAttendance = async () => {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    await addDoc(collection(db, "activities"), {
      userId: user.uid,
      type: "attendance",
      approved: true,
      createdAt: serverTimestamp()
    });

    console.log("출석 기록 추가 완료");

    checkAttendanceAchievement();
  }

  // 출석 개수 세는 함수

  const checkAttendanceAchievement = async () => {
    const user = auth.currentUser;
    if (!user) {
      return;
    }

    const q = query(
      collection(db, "activities"),
      where("userId", "==", user.uid),
      where("type", "==", "attendance"),
      where("approved", "==", true)
    );

    const snap = await getDocs(q);
    const count = snap.size;

    console.log("출석 횟수:", count);

    const achRef = doc(db, "achievements", "attend_5");
    const achSnap = await getDoc(achRef);

    if (!achSnap.exists()) {
      return;
    }

    const { threshold, rewardPoint } = achSnap.data();

    if (count >= threshold) {
      const userAchRef = doc(
        db,
        "users",
        user.uid,
        "userAchievements",
        "attend_5"
      );

      const userAchSnap = await getDoc(userAchRef);

      if (!userAchSnap.exists()) {
        await setDoc(userAchRef, {
          achievedAt: serverTimestamp(),
          rewardPoint,
        });

        await addDoc(collection(db, "pointTransaction"), {
          userId: user.uid,
          amount: rewardPoint,
          type: "achievement",
          referenceId: "attend_5",
          createdAt: serverTimestamp(),
          createdBy: "system"
        });

        console.log("업적 자동 지급 완료");
      } else {
        console.log("이미 지급된 업적");
      }
    }
  }

  return (
    <div>
      <button onClick={testLogin}>테스트 로그인</button>
      <button onClick={loadAchievements}>업적 불러오기</button>
      <button onClick={() => achieve("attend_5")}>
        업적 달성 테스트
      </button>
      <button onClick={addAttendance}>출석 추가</button>
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
