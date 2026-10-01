import { sessionRepository, userRepository } from "#core";

export async function requireAuth(req, res, next) {
  // get token from cookie
  const token = req.cookies.session;

  if (!token) {
    return res.status(401).json({
      error: "authenticated required",
    });
  }

  // get the session by token
  // does not return expired session
  const session = await sessionRepository.findByToken(token);

  if (!session) {
    return res.status(401).json({
      error: "invalid or expired session",
    });
  }

  // find user by session
  const user = await userRepository.findById(session.user_id);

  if (!user) {
    return res.status(401).json({
      error: "user not found",
    });
  }

  //  set user on req object to access it inside all routes
  req.user = user;

  next();
}

export async function requireGuest(req, res, next) {
  const token = req.cookies.session;

  // just checking if token is not fake
  const session = await sessionRepository.findByToken(token);

  // return if token exist
  if (token && session) {
    return res.status(403).json({
      error: "already authenticated",
    });
  }

  next();
}
