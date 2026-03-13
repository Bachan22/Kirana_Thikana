import jwt from "jsonwebtoken";

export function requireAuth(request, response, next) {
  const header = request.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return response.status(401).json({ message: "Missing authentication token." });
  }

  try {
    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, process.env.JWT_SECRET || "change-me-in-production");
    request.user = payload;
    return next();
  } catch (error) {
    return response.status(401).json({ message: "Invalid or expired token." });
  }
}
