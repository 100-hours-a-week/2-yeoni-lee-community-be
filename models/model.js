import User from './user.js';
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
