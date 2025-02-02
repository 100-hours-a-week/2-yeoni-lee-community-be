//controller3.js

import pool from '../db.js';
import {addCommentToDB, getCommentsFromDB, deleteCommentFromDB,updateCommentInDB } from '../models/model.js';

const addComment = async (req, res) => {
  try {
    const { memoId, text } = req.body;
    const username = req.session.user.nickname; // 현재 로그인한 사용자 가져오기

    if (!username) {
      return res.status(401).json({ error: "로그인이 필요합니다." });
    }

    // 🔹 댓글 DB에 추가
    const result = await addCommentToDB(memoId, text, username);
    if (!result) {
      return res.status(404).json({ error: "게시물을 찾을 수 없습니다." });
    }

    // 🔹 최신 댓글 목록과 개수 반환
    res.status(200).json({ comments: result.comments, commentCount: result.commentCount });
  } catch (err) {
    console.error("🔥 [Error] 댓글 추가 중 오류 발생:", err);
    res.status(500).json({ error: "댓글 추가 실패" });
  }
};

const getComments = async (req, res) => {
  try {
    
    const { memoId } = req.query;
    if (!memoId) return res.status(400).json({ error: '게시물 ID가 필요합니다.' });

    const comments = await getCommentsFromDB(memoId);

    res.status(200).json({ comments });
  } catch (err) {
    console.error('🔥 [Error] 댓글 가져오기 중 오류 발생:', err);
    res.status(500).json({ error: '댓글을 가져오는 데 실패했습니다.' });
  }
};

const updateComment = async (req, res) => {
  try {
    const { commentId, text } = req.body;

    if (!req.session.user) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    // ✅ 댓글 업데이트 로직을 모델에서 처리
    const updatedComments = await updateCommentInDB(commentId, text, req.session.user.nickname);

    if (!updatedComments) {
      return res.status(403).json({ error: '댓글 수정 권한이 없거나 댓글을 찾을 수 없습니다.' });
    }

    res.status(200).json({ message: '댓글이 성공적으로 수정되었습니다.', comments: updatedComments });
  } catch (err) {
    console.error('🔥 [Error] 댓글 수정 중 오류 발생:', err);
    res.status(500).json({ error: '댓글 수정에 실패했습니다.' });
  }
};

const deleteComment = async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const { memoId, commentId } = req.body;
    const comments = await deleteCommentFromDB(commentId, memoId, req.session.user.nickname);
    if (!comments) return res.status(403).json({ error: '삭제 권한이 없습니다.' });

    res.status(200).json({ message: '댓글이 성공적으로 삭제되었습니다.', comments });
  } catch (err) {
    console.error('🔥 [Error] 댓글 삭제 중 오류 발생:', err);
    res.status(500).json({ error: '댓글 삭제에 실패했습니다.' });
  }
};

import { toggleLikeMemo, increaseViewCountDB } from '../models/model.js';


const likeMemo = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const { id } = req.body;
    const userEmail = req.session.user.email; // ✅ email → userEmail 변수명 확인

    console.log("🔹 [DEBUG] 좋아요 요청:", { id, userEmail }); // 🔍 디버깅 로그 추가

    const result = await toggleLikeMemo(id, userEmail); // ✅ userEmail을 전달

    res.status(200).json({ like: result.like, hasLiked: result.hasLiked });
  } catch (err) {
    console.error('🔥 [Error] 좋아요 처리 중 오류 발생:', err);
    res.status(500).json({ error: '좋아요 처리에 실패했습니다.' });
  }
};


// ✅ 조회수 증가 (한 번만 증가하도록 처리)
const increaseViewCount = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const { id } = req.query;
    const email = req.session.user.email;

    // 조회수 증가 모델 호출
    const updatedViewCount = await increaseViewCountDB(id, email);

    res.status(200).json({ view: updatedViewCount });
  } catch (err) {
    console.error('🔥 [Error] 조회수 증가 중 오류 발생:', err);
    res.status(500).json({ error: '조회수 증가 실패' });
  }
};

export { addComment, getComments, updateComment, deleteComment, likeMemo, increaseViewCount };

