// database/db.js
import { MongoClient } from "mongodb";

let db = null;

// MongoDB 연결 함수 exprort
export const connectDB = async () => {
  try {
    // 이미 연결되어 있다면 기존 연결 반환
    if (db) {
      return db;
    }

    // 새로운 연결 생성
    console.log("URL", process.env.MONGODB_URI);
    const client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();

    db = client.db(process.env.DB_NAME);
    console.log(`MongoDB 연결 성공! 데이터베이스: ${process.env.DB_NAME}`);

    return db;
  } catch (error) {
    console.error("MongoDB 연결 실패:", error);
    process.exit(1); //  프로그램을 강제로 종료 (1은 오류 코드를 의미)
  }
};

// DB 인스턴스만 반환하는 함수
export const getDB = () => {
  if (!db) {
    console.log("db", db);
    throw new Error(
      "데이터베이스가 연결되지 않았습니다. 먼저 connectDB()를 호출하세요."
    );
  }
  return db;
};

// export { connectDB, getDB };
