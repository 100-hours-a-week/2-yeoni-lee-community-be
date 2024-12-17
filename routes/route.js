/////es6///////
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import { addComment, deleteComment, likeMemo, increaseViewCount } from '../controllers/controller3.js';
import { addMemo, getMemoList, look_selected_memo, updateMemo, delete_memo } from '../controllers/controller.js';
import { registerUser, loginUser, my_info, updatePw, look_my_info, delete_user } from '../controllers/controller2.js';
import { isAuthenticated } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const uploadMemo = multer({
  dest: path.join(__dirname, '../uploads'), // 게시물 사진 경로
});
const uploadProfile = multer({
  dest: path.join(__dirname, '../profile'), // 프로필 사진 경로
});

// 2. 로그인
// 로그인 페이지 서빙
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '2_login.html'));
});
router.post('/login', loginUser);

// 로그아웃
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('로그아웃 중 오류 발생:', err);
      return res.status(500).send('로그아웃 실패');
    }
    res.clearCookie('connect.sid'); // 세션 쿠키 삭제
    res.redirect('/login'); // 로그인 페이지로 리다이렉트
  });
});

////////////1. 회원가입////////////
// 회원가입 페이지 서빙
router.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '1_signup.html'));
});
router.post('/signup', uploadProfile.single('img'), registerUser);
router.get('/successful_signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', 'successful_signup.html'));
});

////////////6. 게시물 작성////////////
// 게시물 작성 페이지 서빙
router.get('/add_memo', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '6_add_memo.html'));
});

router.post('/add_memo', isAuthenticated, uploadMemo.single('memo_img'), addMemo);


////////////3. 게시물 보기////////////
// 게시물 목록 보기 페이지 서빙 (HTML 반환)
router.get('/memo_list', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '3_memo_list.html'));
});
router.get('/api/memo_list', getMemoList);



//////////4. 게시물 상세보기/////////
router.get('/api/look_memo', look_selected_memo);
router.get('/look_memo', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '4_look_memo.html'));
});

//router.patch('/api/look_memo', updateMemo);

// 댓글 삭제 라우트 추가
router.delete('/delete_comment', isAuthenticated, deleteComment);

//////////5. 게시물 수정/////////
// 페이지 서빙
router.get('/mod_memo', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '5_mod_memo.html'));
});

router.patch('/mod_memo', isAuthenticated, updateMemo);


//////댓글달기////////
router.post('/add_comment', isAuthenticated, addComment);

//////////7. 내 정보 보기////////
// 페이지 서빙
router.get('/api/my_info', isAuthenticated, my_info);

// HTML 페이지 반환
router.get('/my_info', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '7_my_info.html'));
});
router.patch('/api/my_info', isAuthenticated, uploadProfile.single('img'), look_my_info);

//////////8. 비밀번호 수정/////////
// 페이지 서빙
router.get('/mod_pw', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '8_mod_pw.html'));
});
// 비밀번호 수정 데이터 처리
router.patch('/mod_pw', updatePw);

//////////회원탈퇴///////////
router.delete('/delete_user', isAuthenticated, delete_user);

router.post('/like_memo', isAuthenticated, likeMemo);
router.post('/increase_view', increaseViewCount);

////////게시물 삭제 /delete_memo //////
router.delete('/delete_memo', isAuthenticated, delete_memo);

export default router;
