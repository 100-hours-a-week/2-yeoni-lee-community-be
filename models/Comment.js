import { DataTypes } from 'sequelize';
import sequelize from './db.js'; // Sequelize 인스턴스
import Memo from './memo.js'; // Memo 모델

const Comment = sequelize.define('Comment', {
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

Memo.hasMany(Comment, { foreignKey: 'memoId', onDelete: 'CASCADE' });
Comment.belongsTo(Memo, { foreignKey: 'memoId' });

export default Comment;
