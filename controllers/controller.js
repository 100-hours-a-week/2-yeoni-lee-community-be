import Memo from '../models/memo.js'; // Sequelize Memo 모델
import Comment from '../models/Comment.js'; // Sequelize Comment 모델

// 메모 추가하기
const addMemo = async (req, res) => {
  try {
    const file = req.file;
    if (!req.session.user) {
      return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    const memoData = {
      title: req.body.title,
      context: req.body.context,
      time: new Date(),
      username: req.session.user.nickname,
      img: file ? `/uploads/${file.filename}` : null,
      like: 0,
      view: 0,
      comments: 0,
    };

    const newMemo = await Memo.create(memoData);
    res.status(201).json({ message: '게시물이 성공적으로 추가되었습니다.', memo: newMemo });
  } catch (err) {
    console.error('게시물 저장 중 오류 발생:', err);
    res.status(500).json({ error: '게시물을 저장하는 데 실패했습니다.' });
  }
};

// 메모 목록 조회
const getMemoList = async (req, res) => {
  try {
    const memos = await Memo.findAll({
      limit: 3,
      order: [['time', 'DESC']],
      include: [Comment], // 댓글 포함
    });
    res.status(200).json(memos);
  } catch (err) {
    console.error('메모 목록 조회 중 오류 발생:', err);
    res.status(500).json({ error: '메모 데이터를 가져오는 데 실패했습니다.' });
  }
};

// 메모 상세 조회
const look_selected_memo = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: '유효한 게시물 ID가 필요합니다.' });
  }

  try {
    const memo = await Memo.findOne({ where: { id }, include: [Comment] });

    if (!memo) {
      return res.status(404).json({ error: '게시물을 찾을 수 없습니다.' });
    }

    res.status(200).json(memo);
  } catch (err) {
    console.error('메모 상세보기 중 오류 발생:', err);
    res.status(500).json({ error: '메모 데이터를 가져오는 데 실패했습니다.' });
  }
};

// 메모 수정
const updateMemo = async (req, res) => {
  try {
    const { id, title, context } = req.body;

    console.log('req.body:', req.body); // 요청 데이터
    console.log('req.file:', req.file); // 업로드된 파일 정보


    if (!id) {
      return res.status(400).json({ error: '게시물 ID가 필요합니다.' });
    }

    const memo = await Memo.findOne({ where: { id: Number(id) } });
    if (!memo) {
      return res.status(404).json({ error: '수정하려는 게시물을 찾을 수 없습니다.' });
    }

    // 업데이트할 필드만 조건적으로 설정
    const updatedFields = { title, context };
      if (req.file) {
         updatedFields.img = `/uploads/${req.file.filename}`;
      }

    await memo.update({ ...updatedFields, time: new Date() });
    res.status(200).json({ message: '게시물이 성공적으로 수정되었습니다.', memo });
  } catch (err) {
    console.error('게시물 수정 중 오류 발생:', err);
    res.status(500).json({ error: '게시물을 수정하는 데 실패했습니다.' });
  }
};

// 메모 삭제
const delete_memo = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ error: '게시물 ID가 필요합니다.' });
    }

    const memo = await Memo.findOne({ where: { id: Number(id) } });

    if (!memo) {
      return res.status(404).json({ error: '메모를 찾을 수 없습니다.' });
    }

    await memo.destroy();
    res.status(200).json({ message: '게시물이 성공적으로 삭제되었습니다.' });
  } catch (err) {
    console.error('메모 삭제 중 오류 발생:', err);
    res.status(500).json({ error: '메모 삭제에 실패했습니다.' });
  }
};

export { addMemo, getMemoList, look_selected_memo, updateMemo, delete_memo };
