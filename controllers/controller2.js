//controller2.js
import {getUsers, saveUsers,} from '../models/model.js'

const registerUser = (req, res) => {
    const file = req.file;
    const userData = {
      email: req.body.email,
      password: req.body.password,
      nickname: req.body.nickname,
      img: file ? file.filename : null, 
    };

    const users = getUsers();
    users.push(userData);

    try {
      saveUsers(users);
  
      res.redirect('/successful_signup');
    } catch (err) {
      res.status(500).json({ error: '회원 데이터를 저장하는 데 실패했습니다.' });
    }
  };
  
  // 로그인 처리
  const loginUser = (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
  
    if (user) {
      // 세션에 사용자 정보 저장
      req.session.user = {
        email: user.email,
        nickname: user.nickname,
      };
      res.redirect('/memo_list');
    } else {
      res.status(401).send('이메일 또는 비밀번호가 잘못되었습니다.');
    }
  };


  const my_info = (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const { email } = req.session.user;
    const users = getUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    res.status(200).json({
        email: user.email,
        nickname: user.nickname,
        img: user.img ? `/profile/${user.img}` : null,
    });
};

const updatePw = (req, res) => {
  const { email, password } = req.body;

  const users = getUsers();
  const userIndex = users.findIndex((user) => user.email === email);

  if (userIndex === -1) {
      return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
  }

  users[userIndex].password = password;

  try {
      saveUsers(users);
      res.status(200).json({ message: '비밀번호가 성공적으로 수정되었습니다.' });
  } catch (err) {
      res.status(500).json({ error: '비밀번호를 수정하는 데 실패했습니다.' });
  }
};

const look_my_info = (req, res) => {
    const { nickname } = req.body;
    const img = req.file ? req.file.filename : null;

    const users = getUsers();
    const userIndex = users.findIndex((u) => u.email === req.session.user.email);

    if (userIndex === -1) {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }

    if (nickname) users[userIndex].nickname = nickname;
    if (img) users[userIndex].img = img;

    saveUsers(users);

    req.session.user.nickname = nickname || req.session.user.nickname;
    req.session.user.img = img || req.session.user.img;

    res.status(200).json({ message: '정보 수정 성공' });
};


  export {registerUser, loginUser, my_info, updatePw, look_my_info};