import { DataTypes } from 'sequelize';
import sequelize from './db.js'; // Sequelize 인스턴스
import Memo from './memo.js'; // Memo 모델

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  memoId: { // Foreign Key 통일
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Memo,
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

Memo.hasMany(Comment, { foreignKey: 'memoId', onDelete: 'CASCADE' });
Comment.belongsTo(Memo, { foreignKey: 'memoId' });

export default Comment;
