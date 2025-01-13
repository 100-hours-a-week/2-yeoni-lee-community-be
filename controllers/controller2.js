//controller2.js

import fs from 'fs/promises';
import path from 'path';

const USER_FILE = path.resolve('./user.json');
//const MEMO_FILE = path.resolve('./memo.json');
//const COMMENT_FILE = path.resolve('./comment.json');
import {API_BASE_URL} from '../app.js';

// JSON 파일 읽기
const readUsers = async () => {
  const data = await fs.readFile(USER_FILE, 'utf-8');
  return JSON.parse(data);
};

// JSON 파일 쓰기
const writeUsers = async (data) => {
  await fs.writeFile(USER_FILE, JSON.stringify(data, null, 2), 'utf-8');
};

// 회원가입
const registerUser = async (req, res) => {
  try {
    const { email, password, nickname, } = req.body;
    const users = await readUsers();

    // 중복 확인
    const existingUser = users.find(
      (user) => user.email === email || user.nickname === nickname
    );
    if (existingUser) {
      return res.status(400).json({ error: '이미 사용 중인 이메일 또는 닉네임입니다.' });
    }

    // 공백 검증
    if (!email.trim() || !nickname.trim()) {
      return res.status(403).json({ error: '이메일과 닉네임을 입력해주세요.' });
    }

    const file = req.file;
    const newUser = {
      email,
      password,
      nickname,
      img: file ? `/profile/${file.filename}` : null,
    };

    users.push(newUser);
    await writeUsers(users);

    res.json({ redirectUrl: `${API_BASE_URL}/2_login` });
    //res.redirect(`${API_BASE_URL}/2_login`);
  } catch (err) {
    console.error('회원 저장 중 오류 발생:', err);
    res.status(500).json({ error: '회원 데이터를 저장하는 데 실패했습니다.' });
  }
};

// 로그인
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await readUsers();

    const user = users.find((u) => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    req.session.user = {
      email: user.email,
      nickname: user.nickname,
    };

    res.json({ redirectUrl: `${API_BASE_URL}/3_memo_list` });

    //res.redirect(`${API_BASE_URL}/3_memo_list`); // -> 얘가 범인
  } catch (err) {
    console.error('로그인 처리 중 오류 발생:', err);
    res.status(500).json({ error: '로그인 처리에 실패했습니다.' });
  }
};

// 사용자 정보 조회
const my_info = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const users = await readUsers();
    const user = users.find((u) => u.email === req.session.user.email);

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    res.status(200).json({
      email: user.email,
      nickname: user.nickname,
      img: user.img || '/profile/default.jpg',
    });
  } catch (err) {
    console.error('사용자 정보 조회 중 오류 발생:', err);
    res.status(500).json({ error: '사용자 정보를 가져오는 데 실패했습니다.' });
  }
};

// 비밀번호 수정
const updatePw = async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await readUsers();

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    user.password = password;
    await writeUsers(users);

    res.status(200).json({
      message: '비밀번호가 성공적으로 수정되었습니다.',
      redirectUrl: `${API_BASE_URL}/2_login`,
    });
  } catch (err) {
    console.error('비밀번호 수정 중 오류 발생:', err);
    res.status(500).json({ error: '비밀번호를 수정하는 데 실패했습니다.' });
  }
};

// 내 정보 수정
const look_my_info = async (req, res) => {
  try {
    const { nickname } = req.body;
    const file = req.file;
    const users = await readUsers();

    const user = users.find((u) => u.email === req.session.user.email);
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 닉네임 변경 시
    if (nickname && nickname !== user.nickname) {
      user.nickname = nickname;
      req.session.user.nickname = nickname;
    }

    // 프로필 사진 변경 시
    if (file) {
      user.img = `/profile/${file.filename}`;
      req.session.user.img = user.img;
    }

    await writeUsers(users);

    res.status(200).json({
      message: '정보 수정 성공',
      nickname: user.nickname,
      img: user.img,
    });
  } catch (err) {
    console.error('정보 수정 중 오류 발생:', err);
    res.status(500).json({ error: '정보 수정에 실패했습니다.' });
  }
};

// 회원 탈퇴
const delete_user = async (req, res) => {
  try {
    const { email } = req.body;
    const users = await readUsers();

    const updatedUsers = users.filter((user) => user.email !== email);
    if (updatedUsers.length === users.length) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    await writeUsers(updatedUsers);

    req.session.destroy((err) => {
      if (err) {
        console.error('세션 종료 중 오류 발생:', err);
        return res.status(500).json({ error: '회원 탈퇴 처리 중 오류가 발생했습니다.' });
      }
      res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
    });
  } catch (err) {
    console.error('회원 탈퇴 중 오류 발생:', err);
    res.status(500).json({ error: '회원 탈퇴에 실패했습니다.' });
  }
};

export { registerUser, loginUser, my_info, updatePw, look_my_info, delete_user };







//--------------건드리지 말 것 ---------------------------------------------
//--------------건드리지 말 것 ---------------------------------------------
//--------------건드리지 말 것 ---------------------------------------------
//--------------건드리지 말 것 ---------------------------------------------

/*
import { Op } from 'sequelize'; // 추가
import User from '../models/user.js';
import Memo from '../models/memo.js'; // Memo 모델 추가
import Comment from '../models/Comment.js'; // Comment 모델 추가
import {API_BASE_URL} from '../app.js';

const registerUser = async (req, res) => { //회원가입
  try {
    const { email, password, nickname } = req.body;

        // 중복 확인
        const existingUser = await User.findOne({
          where: { [Op.or]: [{ email }, { nickname }] },
        });
        if (existingUser) {
          return res.status(400).json({ error: '이미 사용 중인 이메일 또는 닉네임입니다.' });
        }
    
        // 공백 검증
        if (!email.trim() || !nickname.trim()) {
          return res.status(400).json({ error: '이메일과 닉네임을 입력해주세요.' });
        }
    
        const file = req.file;
        const userData = {
          email,
          password,
          nickname,
          img: file ? `/profile/${file.filename}` : null,
        };

    await User.create(userData);
    alert('회원가입 성공!');
    res.redirect(`${API_BASE_URL}/2_login`);
  } catch (err) {
    console.error('회원 저장 중 오류 발생:', err);
    res.status(500).json({ error: '회원 데이터를 저장하는 데 실패했습니다.' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email, password } });
    if (!user) {
      return res.status(401).send('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    req.session.user = {
      email: user.email,
      nickname: user.nickname,
    };

    res.redirect('api/memo_list');
  } catch (err) {
    console.error('로그인 처리 중 오류 발생:', err);
    res.status(500).json({ error: '로그인 처리에 실패했습니다.' });
  }
};

const my_info = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const user = await User.findOne({ where: { email: req.session.user.email } });
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    res.status(200).json({
      email: user.email,
      nickname: user.nickname,
      img: user.img ? `/profile/${user.img}` : null,
    });
  } catch (err) {
    console.error('사용자 정보 조회 중 오류 발생:', err);
    res.status(500).json({ error: '사용자 정보를 가져오는 데 실패했습니다.' });
  }
};

const updatePw = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    await user.update({ password });
    res.status(200).json({ 
      message: '비밀번호가 성공적으로 수정되었습니다.', redirectUrl: `${API_BASE_URL}/2_login`
    });

  } catch (err) {
    console.error('비밀번호 수정 중 오류 발생:', err);
    res.status(500).json({ error: '비밀번호를 수정하는 데 실패했습니다.' });
  }
};


const look_my_info = async (req, res) => {
  try {
    const { nickname } = req.body;
    const img = req.file ? req.file.filename : null;

    const user = await User.findOne({ where: { email: req.session.user.email } });
    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    // 닉네임 변경 시 게시글 및 댓글 업데이트
    if (nickname && nickname !== user.nickname) {
      await Memo.update({ username: nickname }, { where: { username: user.nickname } });
      await Comment.update({ username: nickname }, { where: { username: user.nickname } });
    }

    // 사용자 정보 업데이트
    await user.update({ nickname: nickname || user.nickname, img: img || user.img });

    // 세션 업데이트
    req.session.user.nickname = nickname || req.session.user.nickname;
    req.session.user.img = img ? `/profile/${img}` : req.session.user.img;

    res.status(200).json({
      message: '정보 수정 성공',
      nickname: user.nickname,
      img: img ? `/profile/${img}` : user.img,
    });
  } catch (err) {
    console.error('정보 수정 중 오류 발생:', err);
    res.status(500).json({ error: '정보 수정에 실패했습니다.' });
  }
};


const delete_user = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    await user.destroy();
    req.session.destroy(err => {
      if (err) {
        console.error('세션 종료 중 오류 발생:', err);
        return res.status(500).json({ error: '회원 탈퇴 처리 중 오류가 발생했습니다.' });
      }
      res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
    });
  } catch (err) {
    console.error('회원 탈퇴 중 오류 발생:', err);
    res.status(500).json({ error: '회원 탈퇴에 실패했습니다.' });
  }
}




export { registerUser, loginUser, my_info, updatePw, look_my_info, delete_user };
*/