const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
      return res.redirect('/login');
    }
  
    next();
  };

  const redirectToHomeIfLoggedIn = (req, res, next) => {
    if (req.session.userId) {
      return res.redirect('/forum');
    }
  
    next();
  };
  
  module.exports = {
    requireLogin,
    redirectToHomeIfLoggedIn
  };
  