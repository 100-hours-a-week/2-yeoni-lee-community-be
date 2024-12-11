//middleware/auth.js
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
      next(); // 인증된 사용자, 다음 미들웨어로 이동
    } else {
      res.status(401).send('로그인이 필요합니다.');
    }
  };
  
  export { isAuthenticated };
  