const getClientIP = (req, res, next) => {
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  req.clientIP = ip;
  next();
};

module.exports = getClientIP;
