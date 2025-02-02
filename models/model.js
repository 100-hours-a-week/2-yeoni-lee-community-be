// model.js
import pool from '../db.js'; // ✅ pool을 추가해야 함
//.then
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

const updateUserInfo = async (email, newNickname, file) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction(); // 🔹 트랜잭션 시작

    // ✅ 기존 사용자 정보 조회 (닉네임 가져오기)
    const [[user]] = await connection.query('SELECT * FROM Users WHERE email = ?', [email]);
    if (!user) {
      await connection.rollback();
      connection.release();
      return null;
    }

    const oldNickname = user.nickname; // 기존 닉네임
    let imgPath = file ? `/profile/${file.filename}` : user.img;

    console.log(`🔹 [DEBUG] ${email}의 닉네임 변경: ${oldNickname} -> ${newNickname}`);

    // ✅ Users 테이블에서 닉네임 및 프로필 이미지 업데이트
    const [updateUserResult] = await connection.query('UPDATE Users SET nickname = ?, img = ? WHERE email = ?', [
      newNickname,
      imgPath,
      email,
    ]);

    console.log(`🔹 [DEBUG] Users 업데이트 결과:`, updateUserResult);

    // ✅ 기존 닉네임을 기준으로 Memos, Comments 테이블의 닉네임 변경
    const [updateMemosResult] = await connection.query(
      'UPDATE Memos SET username = ? WHERE username = ?',
      [newNickname, oldNickname]
    );
    const [updateCommentsResult] = await connection.query(
      'UPDATE Comments SET username = ? WHERE username = ?',
      [newNickname, oldNickname]
    );

    console.log(`🔹 [DEBUG] Memos 업데이트 결과:`, updateMemosResult);
    console.log(`🔹 [DEBUG] Comments 업데이트 결과:`, updateCommentsResult);

    await connection.commit(); // 🔹 트랜잭션 커밋
    connection.release(); // 🔹 연결 반환

    return { nickname: newNickname, img: imgPath };
  } catch (err) {
    await connection.rollback(); // 🔹 오류 발생 시 롤백
    connection.release();
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
const updatePassword = async (email, newPassword) => {
  try {
    const [result] = await pool.query(
      'UPDATE Users SET password = ? WHERE email = ?', 
      [newPassword, email]);
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
    console.log('DB에서 가져온 메모:', memo); // 디버깅용 로그
    console.log('세션 사용자:', user); // 세션 사용자 로그
    if (!memo || memo.username !== user) return null;

    await pool.query(
      'UPDATE Memos SET title = ?, context = ?, img = ?, updatedAt = NOW() WHERE id = ?',
      [title, context, img || memo.img, id]
    );
    return { id, title, context, img, username: memo.username };
  } catch (err) {
    console.error('메모 수정 중 오류 발생:', err);
    throw err;
  }
};

// ✅ 메모 삭제
const deleteMemoById = async (id, user) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction(); // 🔹 트랜잭션 시작

    // ✅ 해당 메모가 존재하는지 확인
    const [[memo]] = await connection.query('SELECT * FROM Memos WHERE id = ?', [id]);
    if (!memo || memo.username !== user) {
      await connection.rollback();
      connection.release();
      return null;
    }

    console.log(`🔹 [DEBUG] ${id}번 메모 삭제 진행`);

    // ✅ 해당 메모의 모든 좋아요 삭제
    const [deleteLikes] = await connection.query('DELETE FROM Likes WHERE memoId = ?', [id]);
    console.log(`🔹 [DEBUG] Likes 삭제 완료 (${deleteLikes.affectedRows}개 삭제됨)`);

    // ✅ 해당 메모의 모든 댓글 삭제
    const [deleteComments] = await connection.query('DELETE FROM Comments WHERE memoId = ?', [id]);
    console.log(`🔹 [DEBUG] Comments 삭제 완료 (${deleteComments.affectedRows}개 삭제됨)`);

    // ✅ 최종적으로 Memos 테이블에서 해당 메모 삭제
    const [deleteMemo] = await connection.query('DELETE FROM Memos WHERE id = ?', [id]);
    console.log(`🔹 [DEBUG] Memos 삭제 완료 (${deleteMemo.affectedRows}개 삭제됨)`);

    await connection.commit(); // 🔹 트랜잭션 커밋
    connection.release();
    return true;
  } catch (err) {
    await connection.rollback(); // 🔹 오류 발생 시 롤백
    connection.release();
    console.error('🔥 [Error] 메모 삭제 중 오류 발생:', err);
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

    // 🔹 댓글 추가
    await pool.query('INSERT INTO Comments (memoId, text, username, createdAt) VALUES (?, ?, ?, NOW())', [memoId, text, username]);

    // 🔹 최신 댓글 개수 가져오기 (이 부분이 빠져있어서 오류 발생!)
    const [[commentCountResult]] = await pool.query(
      'SELECT COUNT(*) AS commentCount FROM Comments WHERE memoId = ?',
      [memoId]
    );

    // 🔹 최신 댓글 목록 가져오기
    const [updatedComments] = await pool.query(
      'SELECT * FROM Comments WHERE memoId = ? ORDER BY createdAt DESC',
      [memoId]
    );

    // ✅ 최신 댓글 개수를 반환하도록 수정
    return { comments: updatedComments, commentCount: commentCountResult.commentCount };
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


// ✅ 좋아요 추가/취소 (기존 좋아요 여부 확인 후 처리)
const toggleLikeMemo = async (memoId, userEmail) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction(); // 🔹 트랜잭션 시작

    // 🔹 사용자가 해당 게시물에 좋아요를 눌렀는지 확인
    const [[existingLike]] = await connection.query(
      'SELECT id FROM Likes WHERE memoId = ? AND userEmail = ?',
      [memoId, userEmail]
    );

    if (existingLike) {
      // ✅ 이미 좋아요를 눌렀다면 취소
      await connection.query('DELETE FROM Likes WHERE memoId = ? AND userEmail = ?', [memoId, userEmail]);
    } else {
      // ✅ 좋아요 추가
      await connection.query('INSERT INTO Likes (memoId, userEmail) VALUES (?, ?)', [memoId, userEmail]);
    }

    // 🔹 현재 좋아요 개수 가져오기
    const [[likeCount]] = await connection.query(
      'SELECT COUNT(*) AS likeCount FROM Likes WHERE memoId = ?',
      [memoId]
    );

    // ✅ `Memos` 테이블의 좋아요 수 업데이트
    await connection.query('UPDATE Memos SET `like` = ? WHERE id = ?', [likeCount.likeCount, memoId]);

    await connection.commit(); // 🔹 트랜잭션 커밋

    return { like: likeCount.likeCount, hasLiked: !existingLike };
  } catch (err) {
    await connection.rollback(); // 🔹 오류 발생 시 롤백
    console.error('🔥 [Error] 좋아요 처리 중 오류 발생:', err);
    throw err;
  } finally {
    connection.release(); // 🔹 연결 반환
  }
};

// ✅ 특정 게시물의 좋아요 수 조회 (동기화 검증용)
const getLikeCount = async (memoId) => {
  try {
    const [[likeCount]] = await pool.query(
      'SELECT `like` FROM Memos WHERE id = ?',
      [memoId]
    );
    return likeCount.like;
  } catch (err) {
    console.error('🔥 [Error] 좋아요 수 조회 중 오류 발생:', err);
    throw err;
  }
};


// ✅ 조회수 증가 (동일한 사용자는 한 번만 증가)
const increaseViewCountDB = async (id, email) => {
  try {
    // 동일한 계정이 이미 조회한 게시물인지 확인
    const [[existingView]] = await pool.query(
      'SELECT * FROM Views WHERE memoId = ? AND userEmail = ?', 
      [id, email]
    );

    if (!existingView) {
      // 조회수 증가
      await pool.query('INSERT INTO Views (memoId, userEmail) VALUES (?, ?)', [id, email]);
      await pool.query('UPDATE Memos SET view = view + 1 WHERE id = ?', [id]);

      // 🔹 조회수 증가 후 최신 조회수 조회
      const [[updatedMemo]] = await pool.query('SELECT view FROM Memos WHERE id = ?', [id]);
      return updatedMemo.view;
    } else {
      // 이미 조회한 경우 조회수 변경 없음
      const [[memo]] = await pool.query('SELECT view FROM Memos WHERE id = ?', [id]);
      return memo.view;
    }
  } catch (err) {
    console.error('🔥 [Error] 조회수 증가 중 오류 발생:', err);
    throw err;
  }
};



export { toggleLikeMemo, increaseViewCountDB };

export { getLikeCount };

export { addCommentToDB, getCommentsFromDB, updateCommentInDB, 
  deleteCommentFromDB, likeMemoInDB, increaseMemoViewCount};

export {getMemos, saveMemos, getMemoById, updateMemoById, 
  deleteMemoById};

export {getUserByEmail, newUsers, updateUserInfo, saveUser, updatePassword};

