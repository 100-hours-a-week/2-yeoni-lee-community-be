//controller.js
import {getMemos, saveMemos,} from '../models/model.js'
//const { getMemos, saveMemos, } = require('../models/model');
//

//메모 추가하기
const addMemo = (req, res) => {
  const file = req.file;
  const memos = getMemos(); // 기존 메모 데이터 가져오기

  const memoData = {
    title: req.body.title,
    context: req.body.context,
    time: req.body.time || new Date().toISOString(), // 현재 시간 디폴트 설정
    username: req.body.username,
    img: file ? `/uploads/${file.filename}` : null, // 업로드된 이미지 파일 경로
  };

  memos.push(memoData); // 새 메모 추가

  try {
    saveMemos(memos); // 메모 저장
    res.redirect('/memo_list'); // 목록 페이지로 리다이렉트
  } catch (err) {
    console.error('메모 저장 중 오류 발생:', err);
    res.status(500).json({ error: '데이터를 저장하는 데 실패했습니다.' });
  }
};


const getMemoList = (req, res) => {
  try {
    const memos = getMemos(); // JSON 데이터에서 메모 읽기
    const limitedMemos = memos.slice(-3).reverse(); // 배열의 끝에서 3개 가져오고, 최신순 정렬
    res.status(200).json(limitedMemos); // JSON 형식으로 클라이언트에 전달
  } catch (err) {
    res.status(500).json({ error: '메모 데이터를 가져오는 데 실패했습니다.' });
  }
};


const updateMemo = (req, res) => {
  const { title, context, time, username, comment, deleteCommentIndex } = req.body; // 요청 데이터에서 필드 추출
  const memos = getMemos(); // 기존 메모 데이터 로드

  // 제목으로 메모 찾기
  const memoIndex = memos.findIndex((memo) => memo.title === title);
  if (memoIndex === -1) {
    return res.status(404).json({ error: '수정하려는 게시물을 찾을 수 없습니다.' });
  }

  // 댓글
  if (comment) {
    if (!memos[memoIndex].comments) {
        memos[memoIndex].comments = [];
    }
    memos[memoIndex].comments.push({ username: '익명', text: comment });
  }

  // 기존 메모 데이터 수정
  const updatedMemo = {
    ...memos[memoIndex], // 기존 데이터 유지
    context: context || memos[memoIndex].context, // 내용 수정
    time: time || memos[memoIndex].time, // 시간 수정
    username: username || memos[memoIndex].username, // 작성자 수정
    img: req.file ? req.file.filename : memos[memoIndex].img, // 이미지 수정
  };

  // 수정된 메모를 기존 배열에 반영
  memos[memoIndex] = updatedMemo;

  // 수정된 데이터 저장
  try {
    saveMemos(memos);
    res.status(200).json(memos[memoIndex]); // 수정된 메모 반환
  } catch (err) {
    res.status(500).json({ error: '게시물을 수정하는 데 실패했습니다.' });
  }
};






// 두 함수 내보내기
/*
module.exports = {
  addMemo,
  getMemoList,
  updateMemo,
};*/

export {addMemo,getMemoList, updateMemo,};