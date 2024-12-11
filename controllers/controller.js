//controller.js
import {getMemos, saveMemos,} from '../models/model.js'

//메모 추가하기
const addMemo = (req, res) => {
  const file = req.file;
  const memos = getMemos(); 
  if (!req.session.user) {
    return res.status(401).send('로그인이 필요합니다.');
  }

  const memoData = {
    title: req.body.title,
    context: req.body.context,
    time: new Date().toISOString(), // 현재 시간 디폴트 설정
    username: req.session.user.nickname, //세션에서 닉네임 가져옴.
    img: file ? `/uploads/${file.filename}` : null, // 업로드된 이미지 파일 경로
  };

  memos.push(memoData); // 새 메모 추가

  try {
    saveMemos(memos); // 메모 저장
    res.redirect('/memo_list'); // 목록 페이지로 리다이렉트
  } catch (err) {
    console.error('메모 저장 중 오류 발생:', err);
    res.status(500).json({ error: '데이터를 저장하는 데 실패했습니다.' });
  }
};


const getMemoList = (req, res) => {
  try {
    const memos = getMemos(); // JSON 데이터에서 메모 읽기
    const limitedMemos = memos.slice(-3).reverse(); // 배열의 끝에서 3개 가져오고, 최신순 정렬
    res.status(200).json(limitedMemos); // JSON 형식으로 클라이언트에 전달
  } catch (err) {
    res.status(500).json({ error: '메모 데이터를 가져오는 데 실패했습니다.' });
  }
};

const updateMemo = (req, res) => {
  try {
    // 입력 데이터 검증
    const title = req.body.title;
    if (!title) {
      return res.status(400).json({ error: '제목이 필요합니다.' });
    }

    const memos = getMemos();

    // 게시물 찾기
    const memoIndex = memos.findIndex((memo) => memo.title === title);
    if (memoIndex === -1) {
      return res.status(404).json({ error: '수정하려는 게시물을 찾을 수 없습니다.' });
    }

    const { context, time } = req.body;

    // 수정된 데이터 생성
    const updatedMemo = {
      ...memos[memoIndex],
      context: context || memos[memoIndex].context,
      time: time || memos[memoIndex].time,
      img: req.file ? `/uploads/${req.file.filename}` : memos[memoIndex].img,
    };

    // 메모 배열 업데이트
    memos[memoIndex] = updatedMemo;
    saveMemos(memos);

    // 리다이렉트 URL 생성
    const redirectUrl = `/look_memo?title=${encodeURIComponent(updatedMemo.title)}&context=${encodeURIComponent(updatedMemo.context)}&username=${encodeURIComponent(updatedMemo.username)}&time=${encodeURIComponent(updatedMemo.time)}&img=${encodeURIComponent(updatedMemo.img)}`;

    // 성공 응답
    res.status(200).json({ message: '게시물이 성공적으로 수정되었습니다.', redirectUrl });
    
  } catch (err) {
    console.error('게시물 수정 중 오류:', err);
    res.status(500).json({ error: '게시물을 수정하는 데 실패했습니다.' });
  }
};



const addComment = (req, res) => {
  try {
    const memos = getMemos(); // 기존 메모 데이터 읽기
    const { title, comment } = req.body; // 요청 데이터

    const memoIndex = memos.findIndex((memo) => memo.title.trim() === title.trim());
    if (memoIndex === -1) {
      return res.status(404).json({ error: '댓글을 추가하려는 게시물을 찾을 수 없습니다.' });
    }

    if (!memos[memoIndex].comments) {
      memos[memoIndex].comments = [];
    }

    if (!comment || comment.trim() === '') {
      return res.status(400).json({ error: '댓글 내용이 비어 있습니다.' });
    }

    // 댓글 추가
    const newComment = {
      username: req.session.user?.nickname || '익명',
      text: comment,
      time: new Date().toISOString(),
    };

    memos[memoIndex].comments.push(newComment);

    // JSON 데이터 저장
    saveMemos(memos);

    // 응답에 전체 댓글 데이터 포함
    res.status(200).json({ message: '댓글이 성공적으로 추가되었습니다.', comments: memos[memoIndex].comments });
  } catch (err) {
    console.error('댓글 작성 중 오류 발생:', err);
    res.status(500).json({ error: '댓글 작성에 실패했습니다.' });
  }
};

const deleteComment = (req, res) => {
  try {
    const memos = getMemos(); // 기존 메모 데이터 읽기
    const { title, commentIndex } = req.body; // 요청 데이터

    const memoIndex = memos.findIndex((memo) => memo.title.trim() === title.trim());
    if (memoIndex === -1) {
      return res.status(404).json({ error: '댓글을 삭제하려는 게시물을 찾을 수 없습니다.' });
    }

    if (
      !memos[memoIndex].comments || // 댓글 배열이 없는 경우
      commentIndex < 0 || // 잘못된 인덱스
      commentIndex >= memos[memoIndex].comments.length
    ) {
      return res.status(400).json({ error: '유효하지 않은 댓글 인덱스입니다.' });
    }

    // 댓글 삭제
    memos[memoIndex].comments.splice(commentIndex, 1);

    // JSON 데이터 저장
    saveMemos(memos);

    // 삭제 후 전체 댓글 데이터 반환
    res.status(200).json({ message: '댓글이 성공적으로 삭제되었습니다.', comments: memos[memoIndex].comments });
  } catch (err) {
    console.error('댓글 삭제 중 오류 발생:', err);
    res.status(500).json({ error: '댓글 삭제에 실패했습니다.' });
  }
};

const likeMemo = (req, res) => {
  try {
    const memos = getMemos();
    const { title } = req.body;

    const memoIndex = memos.findIndex((memo) => memo.title.trim() === title.trim());
    if (memoIndex === -1) {
      return res.status(404).json({ error: '좋아요를 처리할 게시물을 찾을 수 없습니다.' });
    }

    // 좋아요 수 증가
    memos[memoIndex].like = (memos[memoIndex].like || 0) + 1;
    saveMemos(memos);

    res.status(200).json({ like: memos[memoIndex].like });
  } catch (err) {
    console.error('좋아요 처리 중 오류 발생:', err);
    res.status(500).json({ error: '좋아요 처리에 실패했습니다.' });
  }
};

const increaseViewCount = (req, res) => {
  try {
    const memos = getMemos();
    const { title } = req.query;

    const memoIndex = memos.findIndex((memo) => memo.title.trim() === title.trim());
    if (memoIndex === -1) {
      return res.status(404).json({ error: '조회수를 증가할 게시물을 찾을 수 없습니다.' });
    }

    // 조회수 증가
    memos[memoIndex].view = (memos[memoIndex].view || 0) + 1;
    saveMemos(memos);

    res.status(200).json({ view: memos[memoIndex].view });
  } catch (err) {
    console.error('조회수 증가 중 오류 발생:', err);
    res.status(500).json({ error: '조회수 증가에 실패했습니다.' });
  }
};


export { addMemo, getMemoList, updateMemo, addComment, deleteComment, likeMemo, increaseViewCount };



