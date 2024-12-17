//controller2.js

import User from '../models/user.js';

const registerUser = async (req, res) => { //회원가입
  try {
    const file = req.file;
    const userData = {
      email: req.body.email,
      password: req.body.password,
      nickname: req.body.nickname,
      img: file ? file.filename : null,
    };

    await User.create(userData);
    res.redirect('/successful_signup');
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

    res.redirect('/memo_list');
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
    res.status(200).json({ message: '비밀번호가 성공적으로 수정되었습니다.' });
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

    await user.update({ nickname: nickname || user.nickname, img: img || user.img });

    req.session.user.nickname = nickname || req.session.user.nickname;
    req.session.user.img = img || req.session.user.img;

    res.status(200).json({ message: '정보 수정 성공' });
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
        return res.status(500).send('세션 종료 중 오류 발생');
      }
      res.status(200).json({ message: '회원 탈퇴가 완료되었습니다.' });
    });
  } catch (err) {
    console.error('회원 탈퇴 중 오류 발생:', err);
    res.status(500).json({ error: '회원 탈퇴에 실패했습니다.' });
  }
}

export { registerUser, loginUser, my_info, updatePw, look_my_info, delete_user };
