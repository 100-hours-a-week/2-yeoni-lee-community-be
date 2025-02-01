//controller3.js

import pool from '../db.js';
import {addCommentToDB, getCommentsFromDB, deleteCommentFromDB,updateCommentInDB, likeMemoInDB, increaseMemoViewCount} from '../models/model.js';

const addComment = async (req, res) => {
  try {
    const { memoId, text } = req.body;

    if (!req.session.user) {
      return res.status(401).json({ error: '로그인이 필요합니다. 댓글을 작성할 수 없습니다.' });
    }

    if (!text) return res.status(400).json({ error: '댓글 내용을 입력해주세요.' });

    const comments = await addCommentToDB(memoId, text, req.session.user.nickname);
    if (!comments) return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });

    res.status(201).json({ message: '댓글이 성공적으로 추가되었습니다.', comments});
  } catch (err) {
    console.error('🔥 [Error] 댓글 작성 중 오류 발생:', err);
    res.status(500).json({ error: '댓글 작성에 실패했습니다.' });
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

const likeMemo = async (req, res) => {
  try {
    const { id } = req.body;
    const likes = await likeMemoInDB(id);
    if (!likes) return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });

    res.status(200).json({ like: likes });
  } catch (err) {
    console.error('🔥 [Error] 좋아요 처리 중 오류 발생:', err);
    res.status(500).json({ error: '좋아요 처리에 실패했습니다.' });
  }
};



const increaseViewCount = async (req, res) => {
  try {
    const { id } = req.query;
    const views = await increaseMemoViewCount(id);
    if (!views) return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });

    res.status(200).json({ view: views });
  } catch (err) {
    console.error('🔥 [Error] 조회수 증가 중 오류 발생:', err);
    res.status(500).json({ error: '조회수 증가에 실패했습니다.' });
  }
};


export { addComment, getComments, updateComment, deleteComment, likeMemo, increaseViewCount };

