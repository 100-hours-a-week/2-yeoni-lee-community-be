const express = require('express');
const multer = require('multer');
const path = require('path');
const { registerUser, loginUser, addMemo, getMemoList } = require('../controllers/controller');

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '../uploads') }); // 업로드 설정

////////////2.로그인////////////
// 로그인 페이지 서빙
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '2_login.html'));
});

// 로그인 데이터 처리
router.post('/login', loginUser);

////////////1.회원가입////////////
// 회원가입 페이지 서빙
router.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '1_signup.html'));
});

// 회원가입 데이터 처리
router.post('/signup', upload.single('img'), registerUser);

// 회원가입 성공 페이지 서빙
router.get('/successful_signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', 'successful_signup.html'));
});

////////////6. 게시물 작성////////////
// 게시물 작성 페이지 서빙
router.get('/add_memo', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '6_add_memo.html'));
});

// 게시물 데이터 처리
router.post('/add_memo', upload.single('img'), addMemo);

////////////3. 게시물 보기////////////
// 게시물 목록 보기 페이지 서빙
router.get('/memo_list', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '3_memo_list.html'));
});

//////////4. 게시물 상세보기/////////
//페이지 서빙
router.get('/look_memo', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '4_look_memo.html'));
});




//////////5.게시물 수정/////////
//페이지 서빙
router.get('/mod_memo', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '5_add_memo.html'));
});




//////////7. 내 정보 보기////////
//페이지 서빙
router.get('/my_info', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '7_my_info.html'));
});


//////////8. 비밀번호 수정///////
//페이지 서빙
router.get('/mod_pw', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '8_mod_pw.html'));
});









module.exports = router;
