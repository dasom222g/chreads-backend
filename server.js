import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./database/db.js";
import postRouter, { initialRouter } from "./routes/posts.js";
import { handleSSEConnection } from "./sse/sseManager.js";

// 환경변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT;

// cors 설정
app.use(cors());

// 프론트에서 받은 json형태의 데이터를 객체로 파싱(변환)하여 사용하도록 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SSE 연결 라우트 ('/events'경로로 들어온 경우 실행)
app.get("/events", handleSSEConnection);

// 라우트 연결
// '/posts' 경로로 들어오는 모든 HTTP 요청을 postsRouter에게 위임
app.use("/posts", postRouter);

app.listen(PORT, async () => {
  console.log("Server running at", PORT);

  // 서버 실행시 DB연결(한번만)
  const db = await connectDB();
  initialRouter(db);
});
