import axios from "axios";

const client = axios.create({
  baseURL: "/api"
});

export function setToken(token) {
  if (token) {
    client.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
}

export async function login(credentials) {
  const response = await client.post("/auth/login", credentials);
  return response.data;
}

export async function fetchCities() {
  const response = await client.get("/meta/cities");
  return response.data;
}

export async function fetchAreas(cityId) {
  const response = await client.get("/meta/areas", { params: { cityId } });
  return response.data;
}

export async function fetchDashboard(cityId, areaId) {
  const response = await client.get("/dashboard", { params: { cityId, areaId } });
  return response.data;
}
