// 게시물 관련 모든 API 엔드포인트를 관리하는 라우터

import express from "express";

// Express에서 제공하는 미니 애플리케이션 객체를 생성
const postRouter = express.Router();

// 전역변수로 설정
let collection;

// 라우터 초기화 함수
export const initialRouter = (db) => {
  collection = db.collection("posts");
};

// =============================================================

/**
 * Server Sent Event
 */

// =============================================================

// GET /posts - 모든 게시물 조회
postRouter.get("/", async (req, res) => {
  // 데이터베이스에서 모든 게시물을 가져와서 반환
  try {
    const posts = await collection.find().toArray();
    console.log("get 실행됨!!");
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
  }
});

// POST /posts - 새 게시물 작성
postRouter.post("/", async (req, res) => {
  // 요청 body에서 게시물 데이터를 받아서 데이터베이스에 저장
  try {
    const post = req.body;
    const newItem = {
      ...post,
      likeCount: 0,
      likedUsers: [], //좋아요 한 UserID목록
      createdAt: new Date(),
    };
    const result = await collection.insertOne(newItem);
    res.status(201).json(result);
  } catch (error) {
    console.log(error);
  }
});

// PUT /posts/:id - 특정 게시물 수정
postRouter.put("/:id", async (req, res) => {
  // URL 파라미터에서 게시물 ID를 받아서 해당 게시물을 수정
  try {
    const { id } = req.params;
    console.log("🚀 ~ postRouter.put ~ id:", id);
    const post = req.body;
    const updateItem = {
      ...post,
      updatedAt: new Date(),
    };
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateItem }
    );
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
});

// DELETE /posts/:id - 특정 게시물 삭제
postRouter.delete("/:id", async (req, res) => {
  // URL 파라미터에서 게시물 ID를 받아서 해당 게시물을 삭제
  try {
    const { id } = req.params;
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
});

// PUT /posts/:id/like - 게시물 좋아요 토글
postRouter.put("/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // 현재 게시물 조회해서 좋아요 상태 확인
    const post = await collection.findOne({ _id: new ObjectId(id) });

    if (!post) {
      return res.status(404).json({ error: "게시물을 찾을 수 없습니다" });
    }

    // 해당유저가 이미 좋아요 했는지 여부 체크
    const isLiked = post.likedUsers?.includes(userId);

    if (isLiked) {
      // 좋아요 취소
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          // 업데이트 연산자
          $inc: { likeCount: -1 }, // 숫자 필드의 값을 감소시킴
          $pull: { likedUsers: userId }, // 배열에서 조건에 맞는 요소를 제거
        }
      );
      res
        .status(200)
        .json({ ...result, action: "unliked", likeCount: post.likeCount - 1 });
    } else {
      // 좋아요 추가
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        {
          // 업데이트 연산자
          $inc: { likeCount: 1 }, // 숫자 필드의 값을 증가시킴
          $addToSet: { likedUsers: userId }, // 배열에 중복되지 않는 요소만 추가 (중복 방지하며 추가)
        }
      );
      res
        .status(200)
        .json({ ...result, action: "liked", likeCount: post.likeCount + 1 });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "좋아요 처리 실패" });
  }
});

export default postRouter;
