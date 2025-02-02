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

    res.status(200).json({
      message: '회원가입 완료.',
      redirectUrl: `${API_BASE_URL}/2_login`,
    });
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

    const email = req.session.user.email; // ✅ 세션에서 이메일 가져오기
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ error: '새 비밀번호를 입력하세요.' });
    }


    // ✅ 비밀번호 업데이트
    const updated = await updatePassword(email, newPassword);
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

    if (!nickname) {
      return res.status(400).json({ error: '닉네임을 입력하세요.' });
    }

    console.log(`🔹 [DEBUG] 닉네임 변경 요청: ${req.session.user.email} -> ${nickname}`);

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
  const connection = await pool.getConnection(); // 🔹 트랜잭션 시작
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const email = req.session.user.email;

    // ✅ 사용자 정보 조회 (닉네임 포함)
    const [[user]] = await connection.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (!user) {
      connection.release();
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    const nickname = user.nickname; // 사용자의 닉네임

    await connection.beginTransaction(); // 🔹 트랜잭션 시작

    // ✅ 1. 사용자가 작성한 좋아요 삭제
    await connection.query('DELETE FROM Likes WHERE userEmail = ?', [email]);
    console.log(`🔹 [DEBUG] 좋아요 삭제 완료`);

    // ✅ 2. 사용자가 작성한 댓글 삭제
    await connection.query('DELETE FROM Comments WHERE username = ?', [nickname]);
    console.log(`🔹 [DEBUG] 댓글 삭제 완료`);

    // ✅ 3. 사용자가 작성한 게시물 삭제 (관련 댓글 및 좋아요도 자동 삭제됨)
    await connection.query('DELETE FROM Memos WHERE username = ?', [nickname]);
    console.log(`🔹 [DEBUG] 메모 삭제 완료`);

    // ✅ 4. 최종적으로 사용자 계정 삭제
    await connection.query('DELETE FROM Users WHERE email = ?', [email]);
    console.log(`🔹 [DEBUG] 사용자 계정 삭제 완료`);

    await connection.commit(); // 🔹 모든 작업 성공 시 커밋

    // ✅ 세션 삭제 (로그아웃)
    req.session.destroy((err) => {
      if (err) {
        console.error('🔥 [Error] 세션 종료 중 오류 발생:', err);
        return res.status(500).json({ error: '회원 탈퇴 처리 중 오류가 발생했습니다.' });
      }
      res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
    });
  } catch (err) {
    await connection.rollback(); // 🔹 오류 발생 시 롤백
    console.error('🔥 [Error] 회원 탈퇴 중 오류 발생:', err);
    res.status(500).json({ error: '회원 탈퇴에 실패했습니다.' });
  } finally {
    connection.release(); // 🔹 연결 반환
  }
};


export { registerUser, loginUser, my_info, updatePw, look_my_info, delete_user };
