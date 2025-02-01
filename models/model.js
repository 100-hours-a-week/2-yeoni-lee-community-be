// model.js
import pool from '../db.js'; // ✅ pool을 추가해야 함

// ✅ 사용자 조회
const getUserByEmail = async (email, password = null) => {
  try {
    const condition = password ? 'AND password = ?' : '';
    const params = password ? [email, password] : [email];

    const [[user]] = await pool.query(`SELECT * FROM Users WHERE email = ? ${condition}`, params);
    return user;
  } catch (err) {
    console.error('🔥 [Error] 사용자 조회 중 오류 발생:', err);
    throw err;
  }
};
const checkUser = async (email, nickname) => {
  try {
    const [[existingUser]] = await pool.query(
      'SELECT * FROM Users WHERE email = ? OR nickname = ?',
      [email, nickname]
    );
    return existingUser;
  } catch (err) {
    console.error('🔥 [Error] 사용자 중복 확인 중 오류 발생:', err);
    throw err;
  }
};

// ✅ 회원가입 (새 사용자 저장)
const newUsers = async (email, password, nickname, img) => {
  try {
    
    const duplicateUser = await checkUser(email, nickname);
    if (duplicateUser) return null; // 중복된 사용자 존재

    const [result] = await pool.query(
      'INSERT INTO Users (email, password, nickname, img, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [email, password, nickname, img]
    );
    return { id: result.insertId, email, nickname, img };
  } catch (err) {
    console.error('🔥 [Error] 회원가입 중 오류 발생:', err);
    throw err;
  }
};

const updateUserInfo = async (email, nickname, file) => {
  try {
    let imgPath = file ? `/profile/${file.filename}` : null;
    const [[user]] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);

    if (!user) return null;

    await pool.query('UPDATE Users SET nickname = ?, img = ? WHERE email = ?', [
      nickname || user.nickname,
      imgPath || user.img,
      email,
    ]);

    return { nickname: nickname || user.nickname, img: imgPath || user.img };
  } catch (err) {
    console.error('🔥 [Error] 사용자 정보 수정 중 오류 발생:', err);
    throw err;
  }
};

const saveUser = async (userData) => {
  try {
    const { email, password, nickname, img } = userData;
    const [result] = await pool.query(
      'INSERT INTO Users (email, password, nickname, img, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())',
      [email, password, nickname, img]
    );
    return { id: result.insertId, ...userData };
  } catch (err) {
    console.error('사용자 데이터를 저장하는 중 오류 발생:', err);
    throw err;
  }
};

// ✅ 비밀번호 수정
const updatePassword = async (email, password) => {
  try {
    const [result] = await pool.query(
      'UPDATE Users SET password = ? WHERE email = ?', 
      [password, email]);
    return result.affectedRows > 0;
  } catch (err) {
    console.error('🔥 [Error] 비밀번호 수정 중 오류 발생:', err);
    throw err;
  }
};


// 🔹 메모 관련 함수
const getMemos = async () => {
  try {
    const [memos] = await pool.query('SELECT * FROM Memos ORDER BY createdAt DESC');
    return memos;
  } catch (err) {
    console.error('메모 목록 조회 중 오류 발생:', err);
    return [];
  }
};

// ✅ 특정 메모 조회
const getMemoById = async (id) => {
  try {
    const [[memo]] = await pool.query('SELECT * FROM Memos WHERE id = ?', [id]);
    if (!memo) return null;

    const [comments] = await pool.query('SELECT * FROM Comments WHERE memoId = ? ORDER BY createdAt DESC', [id]);

    return { memo, comments };
  } catch (err) {
    console.error('메모 및 댓글 조회 중 오류 발생:', err);
    throw err;
  }
};


// ✅ 메모 수정
const updateMemoById = async ({ id, title, context, img, user }) => {
  try {
    const [[memo]] = await pool.query('SELECT * FROM Memos WHERE id = ?', [id]);
    if (!memo || memo.username !== user) return null;

    await pool.query(
      'UPDATE Memos SET title = ?, context = ?, img = ?, updatedAt = NOW() WHERE id = ?',
      [title, context, img || memo.img, id]
    );
    return { id, title, context, img };
  } catch (err) {
    console.error('메모 수정 중 오류 발생:', err);
    throw err;
  }
};

// ✅ 메모 삭제
const deleteMemoById = async (id, user) => {
  try {
    const [[memo]] = await pool.query('SELECT * FROM Memos WHERE id = ?', [id]);
    if (!memo || memo.username !== user) return null;

    await pool.query('DELETE FROM Memos WHERE id = ?', [id]);
    return true;
  } catch (err) {
    console.error('메모 삭제 중 오류 발생:', err);
    throw err;
  }
};

const saveMemos = async (memoData) => {
  try {
    const { title, context, username, img } = memoData;
    // comments 필드를 빈 JSON 배열([])로 저장
    const [result] = await pool.query(
      `INSERT INTO Memos (title, context, username, img, time, createdAt, updatedAt, \`like\`, view, comments) 
       VALUES (?, ?, ?, ?, NOW(), NOW(), NOW(), 0, 0, '[]')`,
      [title, context, username, img]
    );
    return { id: result.insertId, ...memoData };
  } catch (err) {
    console.error('메모 데이터를 저장하는 중 오류 발생:', err);
    throw err;
  }
};

// ✅ 댓글 추가
const addCommentToDB = async (memoId, text, username) => {
  try {
    const [memo] = await pool.query('SELECT * FROM Memos WHERE id = ?', [memoId]);
    if (memo.length === 0) return null;

    await pool.query('INSERT INTO Comments (memoId, text, username, createdAt) VALUES (?, ?, ?, NOW())', [memoId, text, username]);

    const [updatedComments] = await pool.query('SELECT * FROM Comments WHERE memoId = ? ORDER BY createdAt DESC', [memoId]);
    return updatedComments;
  } catch (err) {
    console.error('🔥 [Error] 댓글 추가 중 오류 발생:', err);
    throw err;
  }
};

// ✅ 댓글 목록 조회
const getCommentsFromDB = async (memoId) => {
  try {
    const [comments] = await pool.query('SELECT * FROM Comments WHERE memoId = ? ORDER BY createdAt DESC', [memoId]);
    return comments;
  } catch (err) {
    console.error('🔥 [Error] 댓글 목록 조회 중 오류 발생:', err);
    throw err;
  }
};

// ✅ 댓글 수정
const updateCommentInDB = async (commentId, text, username) => {
  try {
    // ✅ 댓글 조회
    const [[comment]] = await pool.query('SELECT * FROM Comments WHERE id = ?', [commentId]);
    if (!comment || comment.username !== username) return null;

    // ✅ 댓글 업데이트
    await pool.query('UPDATE Comments SET text = ?, updatedAt = NOW() WHERE id = ?', [text, commentId]);

    // ✅ 최신 댓글 목록 반환
    const [updatedComments] = await pool.query(
      'SELECT * FROM Comments WHERE memoId = ? ORDER BY createdAt DESC',
      [comment.memoId]
    );
    return updatedComments;
  } catch (err) {
    console.error('🔥 [Error] 댓글 수정 중 오류 발생:', err);
    throw err;
  }
};


// ✅ 댓글 삭제
const deleteCommentFromDB = async (commentId, memoId, username) => {
  try {
    const [[comment]] = await pool.query('SELECT * FROM Comments WHERE id = ?', [commentId]);
    if (!comment || comment.username !== username) return null;

    await pool.query('DELETE FROM Comments WHERE id = ?', [commentId]);
    const [updatedComments] = await pool.query('SELECT * FROM Comments WHERE memoId = ? ORDER BY createdAt DESC', [memoId]);
    return updatedComments;
  } catch (err) {
    console.error('🔥 [Error] 댓글 삭제 중 오류 발생:', err);
    throw err;
  }
};

// ✅ 좋아요 처리
const likeMemoInDB = async (id) => {
  try {
    const [[memo]] = await pool.query('SELECT * FROM Memos WHERE id = ?', [id]);
    if (!memo) return null;

    await pool.query('UPDATE Memos SET `like` = `like` + 1 WHERE id = ?', [id]);

    return memo.like + 1;
  } catch (err) {
    console.error('🔥 [Error] 좋아요 처리 중 오류 발생:', err);
    throw err;
  }
};

// ✅ 조회수 증가
const increaseMemoViewCount = async (id) => {
  try {
    const [[memo]] = await pool.query('SELECT * FROM Memos WHERE id = ?', [id]);
    if (!memo) return null;

    await pool.query('UPDATE Memos SET view = view + 1 WHERE id = ?', [id]);

    return memo.view + 1;
  } catch (err) {
    console.error('🔥 [Error] 조회수 증가 중 오류 발생:', err);
    throw err;
  }
};



export { addCommentToDB, getCommentsFromDB, updateCommentInDB, 
  deleteCommentFromDB, likeMemoInDB, increaseMemoViewCount};

export {getMemos, saveMemos, getMemoById, updateMemoById, 
  deleteMemoById};

export {getUserByEmail, newUsers, updateUserInfo, saveUser, updatePassword};

