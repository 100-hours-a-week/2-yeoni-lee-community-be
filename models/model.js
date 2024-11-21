//model.js

const fs = require('fs');
const path = require('path');

// JSON 파일 경로
const dataFilePath = path.join(__dirname, '../user.json');
const memoFilePath = path.join(__dirname, '../memo.json');

// 사용자 데이터를 읽는 함수
const getUsers = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data || '[]'); // 데이터가 없으면 빈 배열 반환
  } catch (err) {
    if (err.code === 'ENOENT') {
      return []; // 파일이 없으면 빈 배열 반환
    }
    throw err; // 다른 오류는 다시 던짐
  }
};

// 사용자 데이터를 저장하는 함수
const saveUsers = (users) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2), 'utf8');
};

//메모 정보 불러오기
const getMemos = () => {
    try {
      const data = fs.readFileSync(memoFilePath, 'utf8');
      return JSON.parse(data || '[]'); // 데이터가 없으면 빈 배열 반환
    } catch (err) {
      if (err.code === 'ENOENT') {
        return []; // 파일이 없으면 빈 배열 반환
      }
      throw err; // 다른 오류는 다시 던짐
    }
  };

  //메모 저장ㅎㅏ기
  const saveMemos = (memos) => {
    const fs = require('fs');
    const memoFilePath = path.join(__dirname, '../memo.json'); // 경로 확인
  
    try {
      fs.writeFileSync(memoFilePath, JSON.stringify(memos, null, 2), 'utf8');
    } catch (err) {
      console.error('파일 저장 중 에러 발생:', err); // 디버깅용 로그 추가
      throw err; // 에러 다시 던짐
    }
  };
  

module.exports = {
  getUsers, //회원정보 가져오기
  saveUsers, //회원정보 저장하기
  getMemos,//게시물 정보 불러오기
  saveMemos,//게시물 저장하기
};
