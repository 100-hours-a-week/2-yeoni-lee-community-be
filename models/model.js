import fs from 'fs/promises';
import path from 'path';

const USER_FILE = path.resolve('./user.json');
const MEMO_FILE = path.resolve('./memo.json');

// JSON 파일 읽기
const readJSON = async (file) => {
  const data = await fs.readFile(file, 'utf-8');
  return JSON.parse(data);
};

// JSON 파일 쓰기
const writeJSON = async (file, data) => {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8');
};

// 사용자 관련 함수
const getUsers = async () => {
  try {
    return await readJSON(USER_FILE);
  } catch (err) {
    console.error('사용자 데이터를 가져오는 중 오류 발생:', err);
    return [];
  }
};

const saveUser = async (userData) => {
  try {
    const users = await readJSON(USER_FILE);
    userData.id = users.length ? users[users.length - 1].id + 1 : 1; // ID 자동 생성
    users.push(userData);
    await writeJSON(USER_FILE, users);
    return userData;
  } catch (err) {
    console.error('사용자 데이터를 저장하는 중 오류 발생:', err);
    throw err;
  }
};

// 메모 관련 함수
const getMemos = async () => {
  try {
    return await readJSON(MEMO_FILE);
  } catch (err) {
    console.error('메모 데이터를 가져오는 중 오류 발생:', err);
    return [];
  }
};

const saveMemos = async (memoData) => {
  try {
    const memos = await readJSON(MEMO_FILE);
    memoData.id = memos.length ? memos[memos.length - 1].id + 1 : 1; // ID 자동 생성
    memos.push(memoData);
    await writeJSON(MEMO_FILE, memos);
    return memoData;
  } catch (err) {
    console.error('메모 데이터를 저장하는 중 오류 발생:', err);
    throw err;
  }
};

export { getUsers, saveUser, getMemos, saveMemos };



//-------------
/*import User from './user.js';
import Memo from './memo.js';

const getUsers = async () => {
  return await User.findAll();
};

const saveUser = async (userData) => {
  return await User.create(userData);
};

const getMemos = async () => {
  return await Memo.findAll();
};

const saveMemos = async (memoData) => {
  return await Memo.create(memoData);
};

export { getUsers, saveUser, getMemos, saveMemos };
*/