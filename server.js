const express = require("express");
const User = require("./models/User");
const cors = require("cors");
const passport = require("passport");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local").Strategy;
const PasswordRouter = require("./routes/authRoutes");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const path = require("path");

const { connectdb } = require("./ConnectionDb");
connectdb();

const app = express();

// Middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:8080", // Replace with your frontend address
    credentials: true,
  })
);

// Passport configuration
require("./config/passport");

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          return done(null, false, { message: "Incorrect email" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: "Incorrect password" });
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id); // Store user ID in the session
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Routes
app.use("/password", PasswordRouter);

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  function (req, res) {
    res.redirect("http://localhost:8080/Home"); // Replace with your frontend address
  }
);

app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    let user = await User.findOne({ email });

    if (user) {
      if (user.googleId && user.password) {
        return res.status(400).json({ message: "User already exists" });
      }
      if (!user.googleId && user.password) {
        return res.status(400).json({ message: "User already exists" });
      }
      if (user.googleId && !user.password) {
        user.password = hashedPassword;
        await user.save();
      }
    } else {
      user = new User({ username, email, password: hashedPassword });
      await user.save();
    }

    req.login(user, (err) => {
      if (err) {
        console.error("Error logging in user after registration:", err);
        return res.status(500).send("Internal server error");
      }
      return res.status(200).json({
        message: "Registered and logged in successfully",
        user,
      });
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(400).send("Registration failed");
  }
});

app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: "Internal server error" });
    }
    if (!user) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Internal server error" });
      }
      return res.status(200).json({ message: "Login successful", user });
    });
  })(req, res, next);
});

app.get("/auth/logout", function (req, res) {
  req.logout((err) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Error logging out" });
    }
    req.session.destroy(function (err) {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Error destroying session" });
      }
      res.json({ message: "Logout successful" });
    });
  });
});

app.get("/api/user/profile", async (req, res) => {
  try {
    if (req.user) {
      return res.json({ user: req.user });
    } else {
      return res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, "/client/build")));

// Catch-all route to serve React app
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "/client/build/index.html"))
);

const Port = 8080;
app.listen(Port, () => {
  console.log(`Server is Running at port ${Port}`);
});
