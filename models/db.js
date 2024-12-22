import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('database-1', 'admin', 'duswndl2871', {
  host: 'database-1.cvy64gkcwjwg.ap-northeast-2.rds.amazonaws.com', // 또는 데이터베이스 호스트
  dialect: 'mariadb', // 사용 중인 데이터베이스(MySQL, PostgreSQL 등)
  port: 13306
});

sequelize
  .authenticate()
  .then(() => console.log('Connected to the database!'))
  .catch((err) => console.error('Unable to connect to the database:', err));

export default sequelize;
