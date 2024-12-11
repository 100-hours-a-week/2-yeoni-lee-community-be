//route.js
/////es6///////
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

import { getMemoList, updateMemo, addComment, deleteComment, likeMemo, increaseViewCount } from '../controllers/controller.js'
import { registerUser, loginUser, my_info, updatePw, look_my_info  } from '../controllers/controller2.js'
import { getMemos, saveMemos} from '../models/model.js'
import { isAuthenticated } from '../middleware/auth.js';

//const memoIndex = memos.findIndex((memo) => memo.title.trim() === title.trim());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const uploadMemo = multer({
  dest: path.join(__dirname, '../uploads'), // 게시물 사진 경로
});
const uploadProfile = multer({
  dest: path.join(__dirname, '../profile'), // 프로필 사진 경로
});


//2.로그인
// 로그인 페이지 서빙
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '2_login.html'));
});
router.post('/login', loginUser);

//로그아웃
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
////////////1.회원가입////////////
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

router.post('/add_memo', isAuthenticated, uploadMemo.single('memo_img'), (req, res) => {
  const file = req.file;
  const memos = getMemos();

  if (!req.session.user) {
    return res.status(401).send('로그인이 필요합니다.');
  }

  const memoData = {
    title: req.body.title,
    context: req.body.context,
    time: new Date().toISOString(),
    username: req.session.user.nickname, // 로그인된 사용자
    img: file ? `/uploads/${file.filename}` : null, // 업로드된 이미지 경로
  };

  memos.push(memoData);

  try {
    saveMemos(memos);
    res.redirect('/memo_list');
  } catch (err) {
    console.error('메모 저장 중 오류 발생:', err);
    res.status(500).json({ error: '데이터 저장에 실패했습니다.' });
  }
});


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



//router.post('/add_comment', isAuthenticated, addComment);

// 댓글 삭제 라우트 추가
//import { deleteComment } from '../controllers/controller.js';

router.delete('/delete_comment', isAuthenticated, deleteComment);


//////////5.게시물 수정/////////
//페이지 서빙
router.get('/mod_memo', (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '5_mod_memo.html'));
});
//router.patch('/mod_memo', isAuthenticated, uploadMemo.single('memo_img'), updateMemo);
router.patch('/mod_memo', isAuthenticated, uploadMemo.single('memo_img'), (req, res) => {
  console.log('요청 본문:', req.body); // 확인용 로그
  console.log('업로드된 파일:', req.file); // 업로드된 파일 확인

  const { title, context, time, username } = req.body;
  const file = req.file ? `/uploads/${req.file.filename}` : null;

  if (!title) {
      return res.status(400).json({ error: '제목이 필요합니다.' });
  }

  // 나머지 updateMemo 로직 처리
  updateMemo(req, res);
});



router.post('/add_comment', isAuthenticated, addComment);




//////////7. 내 정보 보기////////
//페이지 서빙
router.get('/api/my_info', isAuthenticated, (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: '로그인이 필요합니다.' });
  }

  const { email, nickname, img } = req.session.user;
  res.status(200).json({ email, nickname, img });
});

// HTML 페이지 반환
router.get('/my_info', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../m_html', '7_my_info.html'));
});

router.get('/api/my_info', isAuthenticated, my_info);
router.patch('/api/my_info', isAuthenticated, uploadProfile.single('img'), look_my_info);
//router.patch('/my_info', uploadProfile.single('img'), look_my_info); 
router.patch('/my_info', uploadProfile.single('img'), (req, res) => {
  const { nickname } = req.body;
  const img = req.file ? `/profile/${req.file.filename}` : null; // 프로필 사진 경로

  const users = getUsers();
  const userIndex = users.findIndex(user => user.email === req.session.user.email);
  if (userIndex === -1) {
    return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
  }

  // 사용자 정보 수정
  if (nickname) users[userIndex].nickname = nickname;
  if (img) users[userIndex].img = img;

  saveUsers(users);

  // 세션 업데이트
  req.session.user.nickname = nickname || req.session.user.nickname;
  req.session.user.img = img || req.session.user.img;

  res.status(200).json({
    message: '사용자 정보가 성공적으로 수정되었습니다.',
    user: users[userIndex],
  });
});


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
  const updatedUsers = users.filter(user => user.email !== email);

  if (users.length === updatedUsers.length) {
    return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
  }

  saveUsers(updatedUsers);

  // 세션 삭제
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('세션 종료 중 오류 발생');
    }
    res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
  });
});

//import { likeMemo, increaseViewCount } from '../controllers/controller.js';
//import { likeMemo, increaseViewCount } from '../controllers/controller.js';

router.post('/like_memo', isAuthenticated, likeMemo);
router.post('/increase_view', increaseViewCount);



////////게시물 삭제 /delete_memo //////

router.delete('/delete_memo', isAuthenticated, (req, res) => {
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