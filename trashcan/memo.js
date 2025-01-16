//memo.js
import { DataTypes } from 'sequelize';
import sequelize from './db.js';

const Memo = sequelize.define(
  'Memo', 
  {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  context: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  username: { //사진은 없어도 등록 가능
    type: DataTypes.STRING,
    allowNull: false,
  },
  img: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  like: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  view: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  comments: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
},
{charset: 'utf8mb4', // 문자셋 설정
  collate: 'utf8mb4_general_ci', // 대소문자 비교 규칙 설정
});

export default Memo;
