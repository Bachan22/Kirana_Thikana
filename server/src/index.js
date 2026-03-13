import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { initializeDatabase } from "./data/database.js";
import { buildCityRanking, buildInsights, buildRecommendation } from "./services/analytics-service.js";
import { findUserByEmail, getAreasByCity, getCities } from "./services/repository.js";
import { requireAuth } from "./middleware/auth.js";

initializeDatabase();

const app = express();
const port = Number(process.env.PORT || 4000);
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({ origin: clientUrl, credentials: false }));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", date: new Date().toISOString() });
});

app.post("/api/auth/login", async (request, response) => {
  const { email, password } = request.body ?? {};

  if (!email || !password) {
    return response.status(400).json({ message: "Email and password are required." });
  }

  const user = findUserByEmail(email);
  if (!user) {
    return response.status(401).json({ message: "Invalid email or password." });
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return response.status(401).json({ message: "Invalid email or password." });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || "change-me-in-production",
    { expiresIn: "8h" }
  );

  return response.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
});

app.get("/api/meta/cities", requireAuth, (_request, response) => {
  const data = getCities();
  return response.json(data);
});

app.get("/api/meta/areas", requireAuth, (request, response) => {
  const { cityId } = request.query;

  if (!cityId) {
    return response.status(400).json({ message: "cityId is required." });
  }

  return response.json(getAreasByCity(cityId));
});

app.get("/api/dashboard", requireAuth, (request, response) => {
  const { cityId, areaId } = request.query;

  if (!cityId) {
    return response.status(400).json({ message: "cityId is required." });
  }

  const areas = getAreasByCity(cityId);
  const ranked = buildCityRanking(areas);
  const selectedArea = ranked.find((area) => area.id === areaId) ?? ranked[0];
  const recommendedArea = ranked[0];

  return response.json({
    stats: [
      { label: "Total Orders", value: selectedArea.totalOrders, suffix: "/month" },
      { label: "Active Riders", value: selectedArea.activeRiders, suffix: "live" },
      { label: "Nearby Shops", value: selectedArea.nearbyShops, suffix: "tracked" },
      { label: "Launch Score", value: selectedArea.launchScore, suffix: "/100" }
    ],
    selectedArea,
    recommendedArea,
    insights: buildInsights(selectedArea),
    recommendation: buildRecommendation(recommendedArea),
    rankedAreas: ranked
  });
});

app.listen(port, () => {
  console.log(`Black Store API listening on http://localhost:${port}`);
});
