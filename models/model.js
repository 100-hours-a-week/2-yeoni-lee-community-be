//model.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataFilePath = path.join(__dirname, '../user.json');
const memoFilePath = path.join(__dirname, '../memo.json');

// 사용자 데이터를 읽기
const getUsers = () => {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data || '[]'); // 데이터가 없으면 빈 배열 반환
  } catch (err) {
    if (err.code === 'ENOENT') {
      return []; // 파일이 없으면 빈 배열 반환
    }
    throw err; 
  }
};

const saveUsers = (users) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2), 'utf8');
};

const getMemos = () => {
    try {
      const data = fs.readFileSync(memoFilePath, 'utf8');
      return JSON.parse(data || '[]'); 
    } catch (err) {
      if (err.code === 'ENOENT') {
        return []; 
      }
      throw err; 
    }
  };

  const saveMemos = (memos) => {
  
    try {
      fs.writeFileSync(memoFilePath, JSON.stringify(memos, null, 2), 'utf8');
    } catch (err) {
      console.error('파일 저장 중 에러 발생:', err); 
      throw err; 
    }
  };

export {getUsers, saveUsers, getMemos, saveMemos,};