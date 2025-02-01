//controller2.js

import pool from '../db.js';
import {API_BASE_URL} from '../app.js';
import { getUserByEmail, newUsers, updatePassword, updateUserInfo } from '../models/model.js';

//회원가입
const registerUser = async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    const file = req.file;
    const img = file ? `/profile/${file.filename}` : null;

    // 모델을 통해 회원가입 처리
    const newUser = await newUsers(email, password, nickname, img);
    if (!newUser) {
      return res.status(400).json({ error: '이미 사용 중인 이메일 또는 닉네임입니다.' });
    }

    res.json({ redirectUrl: `${API_BASE_URL}/2_login` });
  } catch (err) {
    console.error('회원가입 중 오류:', err);
    res.status(500).json({ error: '회원가입 실패' });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await getUserByEmail(email, password);

    if (!user) return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' });

    req.session.user = {
      email: user.email,
      nickname: user.nickname,
      img: user.img,
    };

    res.json({ redirectUrl: `${API_BASE_URL}/3_memo_list` });
  } catch (err) {
    console.error('로그인 처리 중 오류 발생:', err);
    res.status(500).json({ error: '로그인 실패' });
  }
};

// ✅ 사용자 정보 조회
const my_info = async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ error: '로그인이 필요합니다.' });

    const user = await getUserByEmail(req.session.user.email);
    if (!user) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });

    res.status(200).json(user);
  } catch (err) {
    console.error('사용자 정보 조회 중 오류 발생:', err);
    res.status(500).json({ error: '정보 조회 실패' });
  }
};

const updatePw = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const { email = req.session.user.email, password } = req.body;  // ✅ 세션에서 이메일 가져오기

    if (!password) {
      return res.status(400).json({ error: '새 비밀번호를 입력하세요.' });
    }


    // ✅ 비밀번호 업데이트
    const updated = await updatePassword(email, password);
    if (!updated) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });

    res.status(200).json({
      message: '비밀번호가 성공적으로 수정되었습니다.',
      redirectUrl: `${API_BASE_URL}/2_login`,
    });
  } catch (err) {
    console.error('🔥 [Error] 비밀번호 수정 중 오류 발생:', err);
    res.status(500).json({ error: '비밀번호를 수정하는 데 실패했습니다.' });
  }
};


const look_my_info = async (req, res) => {
  try {
    const { nickname } = req.body;
    const file = req.file;

    if (!req.session.user) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const updatedUser = await updateUserInfo(req.session.user.email, nickname, file);
    if (!updatedUser) return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });

    req.session.user.nickname = updatedUser.nickname;
    req.session.user.img = updatedUser.img;

    res.status(200).json({
      message: '정보 수정 성공',
      nickname: updatedUser.nickname,
      img: updatedUser.img,
    });
  } catch (err) {
    console.error('🔥 [Error] 정보 수정 중 오류 발생:', err);
    res.status(500).json({ error: '정보 수정에 실패했습니다.' });
  }
};


const delete_user = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: '이메일을 입력하세요.' });
    }

    // ✅ 데이터베이스에서 사용자 조회
    const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // ✅ 사용자 삭제
    await pool.query('DELETE FROM Users WHERE email = ?', [email]);

    // ✅ 세션 삭제
    req.session.destroy((err) => {
      if (err) {
        console.error('🔥 [Error] 세션 종료 중 오류 발생:', err);
        return res.status(500).json({ error: '회원 탈퇴 처리 중 오류가 발생했습니다.' });
      }
      res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
    });
  } catch (err) {
    console.error('🔥 [Error] 회원 탈퇴 중 오류 발생:', err);
    res.status(500).json({ error: '회원 탈퇴에 실패했습니다.' });
  }
};

export { registerUser, loginUser, my_info, updatePw, look_my_info, delete_user };
