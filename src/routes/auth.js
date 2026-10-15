const router = require("express").Router();
const { protect, authorize } = require('../middleware/auth');
const passport = require("passport");
const jwt = require("jsonwebtoken");

// function isAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   }

//   res.status(401).json({
//     message: "Unauthorized",
//   });
// }


// Authentication: verifies the Bearer token and attaches req.user

// const protect = async (req, res, next) => {
//     // const User = await ;
//   try {
//     const header = req.headers.authorization || '';
//     if (!header.startsWith('Bearer ')) {
//       return res.status(401).json({ message: 'Not authorized, token missing' });
//     }
//     const decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
//     console.log(decoded);
//     const user = await mongodb.getDb().db('test').collection('Users').findOne({'googleId' : decoded.id});
//     console.log(user);
//     if (!user) return res.status(401).json({ message: 'User no longer exists' });
//     req.user = user;
//     next();
//   } catch (err) {
//     console.log(err);
//     return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
//   }
// };

// // Authorization: role-based access
// const authorize = (...roles) => (req, res, next) => {
//   if (!roles.includes(req.user.role)) {
//     return res.status(403).json({ message: 'Forbidden: insufficient permissions' });
//   }
//   next();
// };


router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});


// Login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Callback

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api-docs",
  }),
  (req, res) => {
    console.log(req);
    const token = jwt.sign(
      {
        id: req.user._id,
        email: req.user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  }
);

module.exports = router;