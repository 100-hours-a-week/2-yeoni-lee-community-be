const { getUsers, saveUsers, getMemos, saveMemos, } = require('../models/model');
//
// 회원가입 처리
const registerUser = (req, res) => {
  const file = req.file;

  // 요청 데이터에서 회원 정보 추출
  const userData = {
    email: req.body.email,
    password: req.body.password,
    nickname: req.body.nickname,
    img: file ? file.filename : null, // 업로드된 이미지 파일 이름
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

const addMemo = (req, res) => {
  const file = req.file;
  const memo = getMemos();

  // 요청 데이터에서 회원 정보 추출
  const memoData = {
    title: req.body.title, //제목
    context: req.body.context, //내용
    time: req.body.time, //시간
    username: req.body.username, //작성자
    img: file ? file.filename : null, // 업로드된 이미지 파일 이름
  };
  // 새 사용자 추가
  memo.push(memoData);

  // 사용자 데이터 저장
  try {
    saveMemos(memo);
    res.redirect('/memo_list');
  } catch (err) {
    res.status(500).json({ error: '데이터를 저장하는 데 실패했습니다.' });
  }
};

const getMemoList= (req, res) => {
  try {
    const memos = getMemoList(); // JSON 데이터에서 메모 읽기
    const limitedMemos = memos.slice(0, 3); // 최대 3개 메모 반환
    res.status(200).json(limitedMemos); // JSON 형식으로 클라이언트에 전달
  } catch (err) {
    res.status(500).json({ error: '메모 데이터를 가져오는 데 실패했습니다.' });
  }
};

////내 정보 보기////
const my_info = (req, res) => {
  userData = getUsers();

};

//요청 데이터에서 이메일, 닉네임, 프로필 사진 추출



// 두 함수 내보내기
module.exports = {
  registerUser,
  loginUser,
  addMemo,
  getMemoList,
};
