import express from "express";
import bcrypt from "bcrypt";
import { requireAuth, requireGuest } from "#src/middleware/auth.js";

const router = express.Router();

// generate username base on email
const generateUsername = (email) =>
  `${email.split("@")[0].replace(/[^a-z0-9]/gi, "")}_${Math.random().toString(36).slice(2, 6)}`;

function registerAuthRoutes(app, userRepository, sessionRepository) {
  router.post("/register", requireGuest, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        error: "missing email or password",
      });

    const username = generateUsername(email);

    // check if user by this email exists
    const existingUser = await userRepository.findByEmail(email);

    // do not allow register with same email
    if (existingUser) {
      return res.status(409).json({
        error: "Email already registered",
      });
    }

    // hash password
    const passwordHash = await bcrypt.hash(
      password,
      12, // length of the salt being generated
    );

    // create user
    const user = await userRepository.createUser(username, email, passwordHash);

    return res.status(201).json({ user });
  });

  router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "missing email or password",
      });
    }

    // user with this email exists
    const user = await userRepository.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        error: "invalid email or password",
      });
    }

    // compare the password with hash
    const valid = await bcrypt.compare(password, user.password_hash);

    // unauthorized
    if (!valid) {
      return res.status(401).json({
        error: "invalid email or password",
      });
    }

    // create a session in db
    const session = await sessionRepository.create(user.id);

    // set http only cookie
    res.cookie(
      "session", // cookie name
      session.token, // cookie value
      {
        httpOnly: true,
        //only the same origin: goo.com/ can use the cookie session
        // so these should work: goo.com or api.goo.com or goo.com:433
        sameSite: "lax",
        secure: false, // off on http
        maxAge: 7 * 24 * 60 * 60 * 1000, // in mill
      }, //options
    );

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  });

  router.post("/logout", async (req, res) => {
    const token = req.cookies.session;

    if (token) {
      // delete session from db
      await sessionRepository.deleteByToken(token);
    }

    // clear browser cookie
    res.clearCookie("session");

    return res.status(204).json({ message: "logged out" });
  });

  router.get("/me", requireAuth, async (req, res) => {
    const token = req.cookies.session;

    if (!token) {
      return res.status(401).json({
        error: "not authenticated",
      });
    }

    const session = await sessionRepository.findByToken(token);

    if (!session) {
      return res.status(401).json({
        error: "expired session",
      });
    }

    const user = await userRepository.findById(session.user_id);

    if (!user) {
      return res.status(401).json({
        error: "user not found",
      });
    }

    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.created_at,
    });
  });

  app.use("/api/auth", router);
}

export default registerAuthRoutes;

/*

strict
   cookie is never sent on any cross-site request
   so: basically if you have the cookie -- and sending it from some other domain -- get, post, patch and nothing works!!

lax: (default)
   get requests work
   but post, and others don't work -- unless sent from the same domain
   -- so: attacker can not post from evil.com to your api -- with your cookie 

none
   - cookie is sent on every cross-site request -- including third-party iframes and hxr/fetch.
   - must be paired with secure: true -- or browser rejects the cookie entirely.
   - use this when front and back are on the different sites
      app.fuck.com
      api.foo.com

## development

secure: false -- localhost over HTTP -- can not user secure cookies. 
sameSite: "lax"
   - this should work in dev -- cause: localhost:3000 and localhost:4000 are same-site. port does not matter.

   for eg: these are different sites
      localhost:8000
      127.0.0.1:8000

      for cookie to work here, you need:
         sameSite: "none" + secure: true -- but secure needs https!!

## production

different origins -- same parent domain
Frontend: https://app.example.com
Backend: https://api.example.com

{
   httpOnly: true,
   sameSite: 'lax',
   secure: true, // required over https -- only set this up for https production
   maxAge: 7 * 24 * 60 * 60 * 1000,
}

# different sites

Frontend: https://myapp.vercel.app
Backend: https://myapi.fly.dev

{
   httpOnly: true,
   sameSite: 'none', // cross-site - required
   secure: true, // required with 'none',
   maxAge: __,
}

# then on the backend side -- we setup to only except our frontend and no other site
app.use(cors({
   origin: "http://myapp.vercel.app",
   credentials: true, // for cookie to come
}))

# and the frontend request should send

fetch(url, { credentials: "include" })
// or axios: { withCredentials: true }
*/
