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
    const userData = {
      email: req.body.email,
      password: req.body.password,
    };
    const users = getUsers();
    const user = users.find(
      (u) => u.email === userData.email 
      && u.password === userData.password
      );
  
    if (user) {
      res.redirect('/memo_list');
    } else {
      res.status(401).send('이메일 또는 비밀번호가 잘못되었습니다.');
    }
  };


const my_info = (req, res) => {
    // 요청에서 이메일 가져오기
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).send("이메일이 필요합니다.");
    }
  
    const users = getUsers();
    const user = users.find((u) => u.email === email);
  
    if (user) {
      // 내 정보 응답
      const my_informations = {
        email: user.email,
        nickname: user.nickname,
        file: user.file,
      };
      return res.status(200).json(my_informations);
    } else {
      // 사용자 없음
      return res.status(404).send(`내 정보를 찾을 수 없습니다.`);
    }
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
        console.error('비밀번호 수정 중 오류 발생:', err);
        res.status(500).json({ error: '비밀번호를 수정하는 데 실패했습니다.' });
    }
  };
  

const look_my_info = (req, res) => {
    const { email, nickname } = req.body; 
    const file = req.file;
    const users = getUsers(); 

    const userIndex = users.findIndex((user) => user.email === email);
    if (userIndex === -1) {
      return res.status(404).json({ error: '존재하지 않는 이메일입니다.' });
    }
  
    // 기존 사용자 데이터 수정
    const updatedInfo = {
      ...users[userIndex], // 기존 데이터 유지
      nickname: nickname || users[userIndex].nickname, // 닉네임 수정
      img: file ? file.filename : users[userIndex].img // 이미지 수정
    };
  
    // 수정된 데이터를 기존 배열에 반영
    users[userIndex] = updatedInfo;
  
    // 수정된 데이터 저장
    try {
      saveUsers(users); // 데이터 저장
      res.status(200).json({
        message: '사용자 정보가 성공적으로 수정되었습니다.',
        user: updatedInfo
      });
    } catch (err) {
      console.error('사용자 정보 저장 중 오류 발생:', err);
      res.status(500).json({ error: '사용자 정보를 저장하는 데 실패했습니다.' });
    }
  };



// 두 함수 내보내기
/*
module.exports = {
    registerUser,
    loginUser,
    my_info,
    updatePw,
    look_my_info,
  };*/

  export {registerUser, loginUser, my_info, updatePw, look_my_info,};