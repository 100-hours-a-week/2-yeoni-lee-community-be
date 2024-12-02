//route.js
/////es6///////
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import {addMemo, getMemoList, updateMemo,} from '../controllers/controller.js'
import {registerUser, loginUser, updatePw, look_my_info} from '../controllers/controller2.js'
import {getMemos, saveMemos} from '../models/model.js'
////커먼제이에스////
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '../uploads') }); // 업로드 설정
////////////////
////////////2.로그인////////////
// 로그인 페이지 서빙
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '2_login.html'));
});
router.post('/login', loginUser);



////////////1.회원가입////////////
// 회원가입 페이지 서빙
router.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '1_signup.html'));
});
router.post('/signup', upload.single('img'), registerUser);
router.get('/successful_signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', 'successful_signup.html'));
});







////////////6. 게시물 작성////////////
// 게시물 작성 페이지 서빙
router.get('/add_memo', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '6_add_memo.html'));
});
router.post('/add_memo', upload.single('memo_img'), addMemo);







////////////3. 게시물 보기////////////

// 게시물 목록 보기 페이지 서빙 (HTML 반환)
router.get('/memo_list', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '3_memo_list.html'));
});
router.get('/api/memo_list', getMemoList);









//////////4. 게시물 상세보기/////////
router.get('/api/look_memo', (req, res) => {
  const title = req.query.title; // 쿼리 파라미터로 제목 가져오기
  const memos = getMemos(); // JSON 데이터 읽기
  console.log('모든 메모:', memos); // 디버깅용 로그 추가
  console.log('요청받은 제목:', title); // 디버깅용 로그 추가

  const memo = memos.find((m) => m.title === title); // 제목으로 게시물 검색

  if (memo) {
      res.status(200).json(memo); // 게시물 데이터 반환
  } else {
      console.error('게시물을 찾을 수 없습니다.'); // 에러 로그 추가
      res.status(404).json({ error: '게시물을 찾을 수 없습니다.' }); // 에러 반환
  }
});
router.get('/look_memo', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '4_look_memo.html'));
});
router.patch('/api/look_memo', updateMemo);






//////////5.게시물 수정/////////
//페이지 서빙
router.get('/mod_memo', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '5_mod_memo.html'));
});
// 게시물 수정 데이터 처리
router.patch('/mod_memo', upload.single('img'), updateMemo);

//////////7. 내 정보 보기////////
//페이지 서빙
router.get('/my_info', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '7_my_info.html'));
});

router.patch('/my_info', upload.single('img'), look_my_info); 


//////////8. 비밀번호 수정/////////

// 페이지 서빙
router.get('/mod_pw', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '8_mod_pw.html'));
});

// 비밀번호 수정 데이터 처리
router.patch('/mod_pw', updatePw); // upload.single('img') 제거


//////////회원탈퇴///////////
router.delete('/delete_user', (req, res) => {
  const { email } = req.body;

  const users = getUsers();
  const filteredUsers = users.filter((user) => user.email !== email);

  if (filteredUsers.length === users.length) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
  }

  saveUsers(filteredUsers);

  res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
});


////////게시물 삭제 /delete_memo //////

router.delete('/delete_memo', (req, res) => {
  const { title } = req.body;

  const del = getMemos();
  const filteredMemos = del.filter((memo) => memo.title !== title);

  if (filteredMemos.length === del.length) {
      return res.status(404).json({ error: '메모를 찾을 수 없습니다.' });
  }

  saveMemos(filteredMemos);

  res.status(200).json({ message: '삭제완료.' });
});




//module.exports = router;
export default router;