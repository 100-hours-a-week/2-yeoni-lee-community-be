import Memo from '../models/memo.js'; // Sequelize Memo 모델
import Comment from '../models/Comment.js'; // Sequelize Comment 모델

// 댓글 추가
const addComment = async (req, res) => {
  try {
    const { memoId, text } = req.body;

    if (!memoId || !text) {
      return res.status(400).json({ error: '유효한 게시물 ID와 댓글 내용을 입력해주세요.' });
    }

    const memo = await Memo.findByPk(memoId);
    if (!memo) {
      return res.status(404).json({ error: '댓글을 추가하려는 게시물을 찾을 수 없습니다.' });
    }

    const comment = await Comment.create({
      memoId: memo.id,
      username: req.session.user?.nickname || '익명',
      text,
    });

    res.status(200).json({ message: '댓글이 성공적으로 추가되었습니다.', comment });
  } catch (err) {
    console.error('댓글 작성 중 오류 발생:', err);
    res.status(500).json({ error: '댓글 작성에 실패했습니다.' });
  }
};

// 댓글 삭제
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.body;

    if (!commentId) {
      return res.status(400).json({ error: '유효한 댓글 ID를 입력해주세요.' });
    }

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: '삭제하려는 댓글을 찾을 수 없습니다.' });
    }

    await comment.destroy();
    res.status(200).json({ message: '댓글이 성공적으로 삭제되었습니다.' });
  } catch (err) {
    console.error('댓글 삭제 중 오류 발생:', err);
    res.status(500).json({ error: '댓글 삭제에 실패했습니다.' });
  }
};

// 좋아요 처리
const likeMemo = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: '유효한 게시물 ID를 입력해주세요.' });
    }

    const memo = await Memo.findByPk(id);
    if (!memo) {
      return res.status(404).json({ error: '좋아요를 처리할 게시물을 찾을 수 없습니다.' });
    }

    await memo.increment('like');
    const updatedMemo = await Memo.findByPk(id); // 최신 좋아요 상태 가져오기
    res.status(200).json({ like: updatedMemo.like });
  } catch (err) {
    console.error('좋아요 처리 중 오류 발생:', err);
    res.status(500).json({ error: '좋아요 처리에 실패했습니다.' });
  }
};

// 조회수 증가
const increaseViewCount = async (req, res) => {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: '유효한 게시물 ID를 입력해주세요.' });
    }

    const memo = await Memo.findByPk(id);
    if (!memo) {
      return res.status(404).json({ error: '조회수를 증가할 게시물을 찾을 수 없습니다.' });
    }

    await memo.increment('view');
    const updatedMemo = await Memo.findByPk(id); // 최신 조회수 상태 가져오기
    res.status(200).json({ view: updatedMemo.view });
  } catch (err) {
    console.error('조회수 증가 중 오류 발생:', err);
    res.status(500).json({ error: '조회수 증가에 실패했습니다.' });
  }
};

export { addComment, deleteComment, likeMemo, increaseViewCount };
