/////es6///////
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';


import { addComment, getComments, deleteComment, likeMemo, increaseViewCount, updateComment } from '../controllers/controller3.js';
import { addMemo, getMemoForEdit, getMemoList, look_selected_memo, updateMemo, delete_memo } from '../controllers/controller.js';
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

////////////1. 회원가입////////////

router.post('/api/signup', uploadProfile.single('img'), registerUser);

// 2. 로그인
// 로그인 페이지 서빙
router.post('/api/login', loginUser);

// 로그아웃
router.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('로그아웃 중 오류 발생:', err);
      return res.status(500).send('로그아웃 실패');
    }
    res.clearCookie('connect.sid'); // 세션 쿠키 삭제
    res.redirect('/login'); // 로그인 페이지로 리다이렉트
  });
});

////////////3. 게시물 보기////////////
router.get('/api/memo_list', getMemoList);

//////////4. 게시물 상세보기/////////
router.get('/api/look_memo', look_selected_memo);

//////////5. 게시물 수정/////////
router.get('/api/mod_memo', isAuthenticated, getMemoForEdit);
router.patch('/mod_memo', isAuthenticated, uploadMemo.single('memo_img'), updateMemo);

////////////6. 게시물 작성////////////
router.post('/api/add_memo', isAuthenticated, uploadMemo.single('memo_img'), addMemo);

////////게시물 삭제 /delete_memo //////
router.delete('/api/delete_memo', isAuthenticated, delete_memo);

//////댓글달기////////
router.post('/api/add_comment', isAuthenticated, addComment);
router.get('/api/comments', getComments); 
  // 댓글 삭제 라우트 추가
router.delete('/api/delete_comment', isAuthenticated, deleteComment);
router.patch('/api/edit_comment', isAuthenticated, updateComment);

//////////7. 내 정보 보기////////
router.get('/api/my_info', isAuthenticated, my_info);
router.patch('/api/my_info', isAuthenticated, uploadProfile.single('img'), look_my_info);
//////////8. 비밀번호 수정/////////
// 비밀번호 수정 데이터 처리
router.patch('/api/mod_pw', updatePw);
//////////회원탈퇴///////////
router.delete('/api/delete_user', isAuthenticated, delete_user);
router.post('/api/like_memo', isAuthenticated, likeMemo);
/////조회수 /////
router.post('/api/increase_view', increaseViewCount);
router.get('/api/increase_view', increaseViewCount);


export default router;
