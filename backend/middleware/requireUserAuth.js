
'use strict';

const requireUserAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Please log in to access this resource.'
    });
  }

  next();
};

module.exports = requireUserAuth;
