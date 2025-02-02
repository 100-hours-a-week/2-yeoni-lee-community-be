//controller.js
import pool from '../db.js';
import { getMemos, saveMemos, getMemoById, updateMemoById,increaseMemoViewCount, deleteMemoById } from '../models/model.js';

import {API_BASE_URL} from '../app.js';

// 메모 추가하기
const addMemo = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const { title, context } = req.body;
    const file = req.file;
    const username = req.session.user.nickname;
    const img = file ? `/uploads/${file.filename}` : '/uploads/default-memo.jpeg';
    const memo = await saveMemos({ title, context, username, img });

    res.json({ redirectUrl: `${API_BASE_URL}/3_memo_list`, memo });
  } catch (err) {
    console.error('메모 추가 중 오류:', err);
    res.status(500).json({ error: '메모 추가 실패' });
  }
};


// 메모 목록 조회

const getMemoList = async (req, res) => {
  try {
    const memos = await getMemos();
    res.status(200).json(memos);
  } catch (err) {
    console.error('🔥 [Error] 메모 목록 조회 중 오류 발생:', err);
    res.status(500).json({ error: '메모 데이터를 가져오는 데 실패했습니다.' });
  }
};

const look_selected_memo = async (req, res) => {
  try {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: '유효한 게시물 ID가 필요합니다.' });
  
      const memo = await getMemoById(id);
      if (!memo) return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
  
      // 조회수 증가
      await increaseMemoViewCount(id);
  
      res.status(200).json(memo);
    } catch (err) {
      console.error('메모 상세 조회 중 오류:', err);
      res.status(500).json({ error: '메모 데이터를 가져오는 데 실패했습니다.' });
    }
};

// 메모 수정

const updateMemo = async (req, res) => {
  try {
    console.log('세션 정보:', req.session.user); // 세션 디버깅 로그 추가
    const { id, title, context } = req.body;
    const file = req.file;
    const img = file ? `/uploads/${file.filename}` : null;

    if (!req.session.user || !req.session.user.nickname) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const memo = await updateMemoById({ id, title, context, img, user: req.session.user.nickname });
    if (!memo) return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });

    if (memo.username !== req.session.user.nickname) {
      return res.status(403).json({ error: '수정 권한이 없습니다.' });
    }

    res.status(200).json({ message: '게시물이 수정되었습니다.' });
  } catch (err) {
    console.error('메모 수정 중 오류 발생:', err);
    res.status(500).json({ error: '게시물 수정 실패' });
  }
};




// 메모 삭제

const delete_memo = async (req, res) => {
  try {
    const { id } = req.body;
    const [[memo]] = await pool.query('SELECT * FROM Memos WHERE id = ?', [id]);
    if (!memo) return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });

    if (memo.username !== req.session.user.nickname) {
      return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }

    const success = await deleteMemoById(id, req.session.user.nickname);
    if (!success) return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });

    res.status(200).json({ message: '게시물이 삭제되었습니다.' });
  } catch (err) {
    console.error('게시물 삭제 중 오류 발생:', err);
    res.status(500).json({ error: '게시물 삭제 실패' });
  }
};

const getMemoForEdit = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: '게시물 ID가 필요합니다.' });
    }

    // ✅ 데이터베이스에서 해당 ID의 메모를 조회
    const [memos] = await pool.query('SELECT * FROM Memos WHERE id = ?', [id]);

    if (memos.length === 0) {
      return res.status(404).json({ error: '해당 게시물을 찾을 수 없습니다.' });
    }

    res.status(200).json({ memo: memos[0] });
  } catch (err) {
    console.error('🔥 [Error] 게시물 불러오기 중 오류 발생:', err);
    res.status(500).json({ error: '게시물을 불러오는 데 실패했습니다.' });
  }
};


export { addMemo, getMemoList, look_selected_memo, updateMemo, delete_memo, getMemoForEdit };