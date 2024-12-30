import Memo from '../models/memo.js'; // Sequelize Memo 모델
import Comment from '../models/Comment.js'; // Sequelize Comment 모델

// 댓글 추가
// 댓글 추가
const addComment = async (req, res) => {
  try {
    const { memoId, text } = req.body;

    // 로그인 여부 확인
    if (!req.session.user) {
      return res.status(401).json({ error: '로그인이 필요합니다. 댓글을 작성할 수 없습니다.' });
    }

    // 필수 데이터 확인
    if (!text) {
      return res.status(400).json({ error: '댓글 내용을 입력해주세요.' });
    }

    // 댓글 데이터 추가
    await Comment.create({
      memoId,
      username: req.session.user.nickname,
      text,
    });

    // 해당 게시물의 전체 댓글 가져오기
    const comments = await Comment.findAll({
      where: { memoId: memoId },
      order: [['createdAt', 'DESC']],
    });

    res.status(201).json({ 
      message: '댓글이 성공적으로 추가되었습니다.',
      comments, // 모든 댓글 반환
    });
  } catch (err) {
    console.error('댓글 작성 중 오류 발생:', err);
    res.status(500).json({ error: '댓글 작성에 실패했습니다.' });
  }
};

// 댓글 목록 조회
const getComments = async (req, res) => {
  try {
    const { memoId } = req.query;

    if (!memoId) {
      return res.status(400).json({ error: '게시물 ID가 필요합니다.' });
    }

    const comments = await Comment.findAll({
      where: { memoId },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({ comments });
  } catch (err) {
    console.error('댓글 가져오기 중 오류 발생:', err);
    res.status(500).json({ error: '댓글을 가져오는 데 실패했습니다.' });
  }
};

// 댓글 수정
const updateComment = async (req, res) => {
  try {
      const { commentId, text } = req.body;

      if (!req.session.user) {
          return res.status(401).json({ error: '로그인이 필요합니다.' });
      }

      if (!commentId || !text) {
          return res.status(400).json({ error: '댓글 ID와 내용을 입력해주세요.' });
      }

      const comment = await Comment.findByPk(commentId);

      if (!comment) {
          return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
      }

      if (comment.username !== req.session.user.nickname) {
          return res.status(403).json({ error: '댓글 수정 권한이 없습니다.' });
      }

      await comment.update({ text });

      // 최신 댓글 목록 반환
      const comments = await Comment.findAll({
          where: { memoId: comment.memoId },
          order: [['createdAt', 'DESC']],
      });

      res.status(200).json({
          message: '댓글이 성공적으로 수정되었습니다.',
          comments,
      });
  } catch (err) {
      console.error('댓글 수정 중 오류 발생:', err);
      res.status(500).json({ error: '댓글 수정에 실패했습니다.' });
  }
};





// 댓글 삭제
const deleteComment = async (req, res) => {
  try {
    const { memoId, commentId } = req.body;

    // 필수 데이터 확인
    if (!commentId || !memoId) {
      return res.status(400).json({ error: '댓글 ID와 게시물 ID가 필요합니다.' });
    }

    // 삭제할 댓글 찾기
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });
    }

    // 작성자 확인
    if (comment.username !== req.session.user.nickname) {
      return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }

    // 댓글 삭제
    await comment.destroy();

    // 최신 댓글 목록 반환 (최신 댓글 순서)
    const comments = await Comment.findAll({
      where: { memoId },
      order: [['createdAt', 'DESC']], // 최신 댓글이 위로 오게 정렬
    });

    res.status(200).json({ 
      message: '댓글이 성공적으로 삭제되었습니다.',
      comments // 최신 댓글 목록 반환
    });
  } catch (err) {
    console.error('댓글 삭제 중 오류 발생:', err);
    res.status(500).json({ error: '댓글 삭제에 실패했습니다.' });
  }
};


// 좋아요 처리
const likeMemo = async (req, res) => {
  try {
    const { id } = req.body;

    if (!req.session.likedMemos) {
      req.session.likedMemos = []; // 세션에 좋아요 기록이 없으면 초기화
    }

    const memo = await Memo.findByPk(id);
    if (!memo) {
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    // 사용자가 이미 좋아요를 누른 경우
    if (req.session.likedMemos.includes(id)) {
      await memo.decrement('like'); // 좋아요 수 감소
      req.session.likedMemos = req.session.likedMemos.filter((memoId) => memoId !== id); // 세션에서 제거
      return res.status(200).json({ like: memo.like - 1 }); // 업데이트된 좋아요 수 반환
    }

    // 사용자가 좋아요를 누르지 않은 경우
    await memo.increment('like'); // 좋아요 수 증가
    req.session.likedMemos.push(id); // 세션에 기록
    res.status(200).json({ like: memo.like + 1 }); // 업데이트된 좋아요 수 반환
  } catch (err) {
    console.error('좋아요 처리 중 오류 발생:', err);
    res.status(500).json({ error: '좋아요 처리에 실패했습니다.' });
  }
};


const nolike = async (req, res) => {
  try {
      const { id } = req.body;
      const memo = await Memo.findByPk(id);

      if (!memo) {
          return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
      }

      await memo.decrement('like');
      const updatedMemo = await Memo.findByPk(id);
      res.status(200).json({ like: updatedMemo.like });
  } catch (err) {
      console.error('좋아요 취소 처리 오류 발생:', err);
      res.status(500).json({ error: '좋아요 취소 처리에 실패했습니다.' });
  }
};


// 조회수 증가
const increaseViewCount = async (req, res) => {
  const { id } = req.query;

  if (!id) {
      return res.status(400).json({ error: '게시물 ID가 필요합니다.' });
  }

  try {
      const memo = await Memo.findByPk(id);

      if (!memo) {
          return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
      }

      await memo.increment('view');
      res.status(200).json({ view: memo.view + 1 }); // 업데이트된 조회수 반환
  } catch (err) {
      console.error('조회수 증가 중 오류 발생:', err);
      res.status(500).json({ error: '조회수 증가에 실패했습니다.' });
  }
};


export { nolike, addComment, getComments, updateComment, deleteComment, likeMemo, increaseViewCount };
