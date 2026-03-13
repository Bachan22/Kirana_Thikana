import { getDatabase } from "../data/database.js";

function mapArea(areaRow, storesByArea) {
  return {
    id: areaRow.id,
    cityId: areaRow.city_id,
    name: areaRow.name,
    latitude: areaRow.latitude,
    longitude: areaRow.longitude,
    demandIndex: areaRow.demand_index,
    totalOrders: areaRow.total_orders,
    activeRiders: areaRow.active_riders,
    nearbyShops: areaRow.nearby_shops,
    avgDeliveryMins: areaRow.avg_delivery_mins,
    competitionIndex: areaRow.competition_index,
    serviceGap: areaRow.service_gap,
    hotspots: JSON.parse(areaRow.hotspots_json),
    notes: areaRow.notes,
    stores: storesByArea.get(areaRow.id) ?? []
  };
}

export function findUserByEmail(email) {
  const db = getDatabase();
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
}

export function getCities() {
  const db = getDatabase();
  return db.prepare("SELECT id, name FROM cities ORDER BY name").all();
}

export function getAreasByCity(cityId) {
  const db = getDatabase();
  const areaRows = db.prepare("SELECT * FROM areas WHERE city_id = ? ORDER BY name").all(cityId);
  const storeRows = db.prepare("SELECT * FROM stores WHERE area_id IN (SELECT id FROM areas WHERE city_id = ?)").all(cityId);
  const storesByArea = new Map();

  for (const row of storeRows) {
    const list = storesByArea.get(row.area_id) ?? [];
    list.push({
      id: row.id,
      name: row.name,
      type: row.type,
      latitude: row.latitude,
      longitude: row.longitude
    });
    storesByArea.set(row.area_id, list);
  }

  return areaRows.map((row) => mapArea(row, storesByArea));
}
