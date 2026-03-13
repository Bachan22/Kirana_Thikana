import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import { areas, cities, stores } from "./seed-data.js";

const storageDir = path.resolve(process.cwd(), "storage");
const dbPath = path.join(storageDir, "black-store.db");

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

const db = new Database(dbPath);

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cities (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS areas (
      id TEXT PRIMARY KEY,
      city_id TEXT NOT NULL,
      name TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      demand_index INTEGER NOT NULL,
      total_orders INTEGER NOT NULL,
      active_riders INTEGER NOT NULL,
      nearby_shops INTEGER NOT NULL,
      avg_delivery_mins INTEGER NOT NULL,
      competition_index INTEGER NOT NULL,
      service_gap INTEGER NOT NULL,
      hotspots_json TEXT NOT NULL,
      notes TEXT NOT NULL,
      FOREIGN KEY (city_id) REFERENCES cities(id)
    );

    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY,
      area_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      FOREIGN KEY (area_id) REFERENCES areas(id)
    );
  `);

  const upsertCity = db.prepare(`
    INSERT INTO cities (id, name) VALUES (@id, @name)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name
  `);

  const upsertArea = db.prepare(`
    INSERT INTO areas (
      id, city_id, name, latitude, longitude, demand_index, total_orders, active_riders,
      nearby_shops, avg_delivery_mins, competition_index, service_gap, hotspots_json, notes
    ) VALUES (
      @id, @cityId, @name, @latitude, @longitude, @demandIndex, @totalOrders, @activeRiders,
      @nearbyShops, @avgDeliveryMins, @competitionIndex, @serviceGap, @hotspotsJson, @notes
    )
    ON CONFLICT(id) DO UPDATE SET
      city_id = excluded.city_id,
      name = excluded.name,
      latitude = excluded.latitude,
      longitude = excluded.longitude,
      demand_index = excluded.demand_index,
      total_orders = excluded.total_orders,
      active_riders = excluded.active_riders,
      nearby_shops = excluded.nearby_shops,
      avg_delivery_mins = excluded.avg_delivery_mins,
      competition_index = excluded.competition_index,
      service_gap = excluded.service_gap,
      hotspots_json = excluded.hotspots_json,
      notes = excluded.notes
  `);

  const upsertStore = db.prepare(`
    INSERT INTO stores (id, area_id, name, type, latitude, longitude)
    VALUES (@id, @areaId, @name, @type, @latitude, @longitude)
    ON CONFLICT(id) DO UPDATE SET
      area_id = excluded.area_id,
      name = excluded.name,
      type = excluded.type,
      latitude = excluded.latitude,
      longitude = excluded.longitude
  `);

  for (const city of cities) {
    upsertCity.run(city);
  }

  for (const area of areas) {
    upsertArea.run({
      ...area,
      hotspotsJson: JSON.stringify(area.hotspots)
    });
  }

  for (const store of stores) {
    upsertStore.run(store);
  }

  const existingUser = db.prepare("SELECT id FROM users WHERE email = ?").get("admin@blackstore.demo");
  if (!existingUser) {
    const passwordHash = bcrypt.hashSync("demo123", 10);
    db.prepare(`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `).run("admin@blackstore.demo", passwordHash, "Ayesha Khan", "Strategy Lead");
  }
}

export function getDatabase() {
  return db;
}
