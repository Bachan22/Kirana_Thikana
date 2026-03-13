import { Suspense, lazy, useEffect, useState } from "react";
import { fetchAreas, fetchCities, fetchDashboard, login, setToken } from "./api";
import LoginPanel from "./components/LoginPanel";
import RecommendationPanel from "./components/RecommendationPanel";

const AreaMap = lazy(() => import("./components/AreaMap"));
const RankingChart = lazy(() => import("./components/RankingChart"));

const SESSION_KEY = "black-store-fullstack-session";

function readSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export default function App() {
  const [session, setSession] = useState(() => readSession());
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [screenLoading, setScreenLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session?.token) {
      setToken(null);
      return;
    }

    setToken(session.token);
  }, [session]);

  useEffect(() => {
    if (!session?.token) {
      return;
    }

    async function loadCities() {
      try {
        setScreenLoading(true);
        const cityItems = await fetchCities();
        setCities(cityItems);
        const firstCityId = cityItems[0]?.id ?? "";
        setSelectedCityId(firstCityId);
      } catch (loadError) {
        setError(loadError.response?.data?.message || loadError.message);
      } finally {
        setScreenLoading(false);
      }
    }

    loadCities();
  }, [session]);

  useEffect(() => {
    if (!selectedCityId) {
      return;
    }

    async function loadAreas() {
      try {
        setScreenLoading(true);
        const areaItems = await fetchAreas(selectedCityId);
        setAreas(areaItems);
        setSelectedAreaId((currentAreaId) =>
          areaItems.some((area) => area.id === currentAreaId) ? currentAreaId : areaItems[0]?.id ?? ""
        );
      } catch (loadError) {
        setError(loadError.response?.data?.message || loadError.message);
      } finally {
        setScreenLoading(false);
      }
    }

    loadAreas();
  }, [selectedCityId]);

  useEffect(() => {
    if (!selectedCityId || !selectedAreaId) {
      return;
    }

    async function loadDashboard() {
      try {
        setScreenLoading(true);
        const data = await fetchDashboard(selectedCityId, selectedAreaId);
        setDashboard(data);
      } catch (loadError) {
        setError(loadError.response?.data?.message || loadError.message);
      } finally {
        setScreenLoading(false);
      }
    }

    loadDashboard();
  }, [selectedCityId, selectedAreaId]);

  async function handleLogin(credentials) {
    try {
      setLoginLoading(true);
      setError("");
      const result = await login(credentials);
      saveSession(result);
      setSession(result);
    } catch (loginError) {
      setError(loginError.response?.data?.message || loginError.message);
    } finally {
      setLoginLoading(false);
    }
  }

  function handleLogout() {
    clearSession();
    setSession(null);
    setCities([]);
    setAreas([]);
    setDashboard(null);
    setSelectedCityId("");
    setSelectedAreaId("");
  }

  if (!session?.token) {
    return <LoginPanel onSubmit={handleLogin} error={error} loading={loginLoading} />;
  }

  const selectedArea = dashboard?.selectedArea;
  const recommendedArea = dashboard?.recommendedArea;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <p className="eyebrow">Ops Dashboard</p>
        <h1>Black Store Command Center</h1>
        <p className="sidebar-copy">
          Compare cities, inspect demand hotspots, and identify the most profitable
          next store location.
        </p>

        <div className="sidebar-block">
          <span className="sidebar-label">Logged in as</span>
          <strong>{session.user.name}</strong>
          <small>{session.user.role}</small>
        </div>

        <div className="sidebar-block">
          <span className="sidebar-label">Controls</span>
          <label>
            <span>City</span>
            <select value={selectedCityId} onChange={(event) => setSelectedCityId(event.target.value)}>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Area</span>
            <select value={selectedAreaId} onChange={(event) => setSelectedAreaId(event.target.value)}>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="sidebar-block">
          <span className="sidebar-label">Launch recommendation</span>
          <strong>{recommendedArea?.name || "Loading..."}</strong>
          <small>{recommendedArea ? `${recommendedArea.launchScore}/100 launch score` : "Calculating..."}</small>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="content">
        <header className="content-header">
          <div>
            <p className="eyebrow">Decision Surface</p>
            <h2>
              {selectedArea ? `${selectedArea.name}, ${cities.find((city) => city.id === selectedCityId)?.name}` : "Loading"}
            </h2>
            <p>
              Orders, rider supply, nearby shops, and service gap are combined into a launch score.
            </p>
          </div>
          {screenLoading ? <span className="loading-pill">Refreshing data...</span> : null}
        </header>

        {error ? <div className="error-banner">{error}</div> : null}

        <section className="stats-grid">
          {dashboard?.stats.map((stat) => (
            <article key={stat.label} className="stat-card">
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.suffix}</small>
            </article>
          ))}
        </section>

        {dashboard ? (
          <>
            <section className="main-grid">
              <Suspense fallback={<section className="panel">Loading map...</section>}>
                <AreaMap
                  areas={dashboard.rankedAreas}
                  selectedArea={selectedArea}
                  recommendedArea={recommendedArea}
                  onSelectArea={setSelectedAreaId}
                />
              </Suspense>
              <RecommendationPanel
                selectedArea={selectedArea}
                recommendedArea={recommendedArea}
                insights={dashboard.insights}
                recommendation={dashboard.recommendation}
              />
            </section>

            <Suspense fallback={<section className="panel">Loading ranking chart...</section>}>
              <RankingChart areas={dashboard.rankedAreas} />
            </Suspense>
          </>
        ) : null}
      </main>
    </div>
  );
}
