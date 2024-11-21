//controller2.js

const { getUsers, saveUsers, } = require('../models/model');


const registerUser = (req, res) => {
    const file = req.file;
  
    // 요청 데이터에서 회원 정보 추출
    const userData = {
      email: req.body.email,
      password: req.body.password,
      nickname: req.body.nickname,
      img: file ? file.filename : null, 
    };
  
    // 기존 사용자 데이터 가져오기
    const users = getUsers();
  
    // 새 사용자 추가
    users.push(userData);
  
    // 사용자 데이터 저장
    try {
      saveUsers(users);
  
      // 회원가입 완료 후 성공 페이지로 이동
      res.redirect('/successful_signup');
    } catch (err) {
      res.status(500).json({ error: '회원 데이터를 저장하는 데 실패했습니다.' });
    }
  };
  
  // 로그인 처리
  const loginUser = (req, res) => {
    // 요청 데이터에서 회원 정보 추출
    const userData = {
      email: req.body.email,
      password: req.body.password,
    };
    const users = getUsers();
  
    // 이메일과 비밀번호 확인
    const user = users.find(
      (u) => u.email === userData.email 
      && u.password === userData.password
      );
  
    if (user) {
      // 로그인 성공 -> 메모 리스트로 리다이렉트
      res.redirect('/memo_list');
    } else {
      // 로그인 실패 -> 에러 메시지 반환
      res.status(401).send('이메일 또는 비밀번호가 잘못되었습니다.');
    }
  };



////내 정보 보기////


const my_info = (req, res) => {
    // 요청에서 이메일 가져오기
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).send("이메일이 필요합니다.");
    }
  
    const users = getUsers();
  
    // 이메일로 사용자 검색
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
      return res.status(404).send("내 정보를 찾을 수 없습니다.");
    }
  };
  
  
  //요청 데이터에서 이메일, 닉네임, 프로필 사진 추출
  const updatePw = (req, res) => {
    const { email, password } = req.body; // 이메일과 새 비밀번호 추출
  
    const users = getUsers(); // 기존 사용자 데이터 로드
  
    // 이메일로 사용자 찾기
    const userIndex = users.findIndex((user) => user.email === email);
    if (userIndex === -1) {
        return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
  
    // 비밀번호 업데이트
    users[userIndex].password = password;
  
    // 수정된 데이터 저장
    try {
        saveUsers(users); // 전체 사용자 데이터 저장
        res.status(200).json({ message: '비밀번호가 성공적으로 수정되었습니다.' });
    } catch (err) {
        console.error('비밀번호 수정 중 오류 발생:', err);
        res.status(500).json({ error: '비밀번호를 수정하는 데 실패했습니다.' });
    }
  };
  

const look_my_info = (req, res) => {
    const { email, nickname } = req.body; // 요청 데이터에서 필드 추출
    const file = req.file; // 업로드된 파일
    const users = getUsers(); // 기존 사용자 데이터 로드
  
    // 이메일로 사용자 찾기
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
module.exports = {
    registerUser,
    loginUser,
    my_info,
    updatePw,
    look_my_info,
  };
  