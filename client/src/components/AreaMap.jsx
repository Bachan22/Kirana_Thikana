import { Circle, CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

export default function AreaMap({ areas, selectedArea, recommendedArea, onSelectArea }) {
  const center = selectedArea
    ? [selectedArea.latitude, selectedArea.longitude]
    : [20.5937, 78.9629];

  return (
    <div className="panel map-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Live Map</p>
          <h3>Stores, demand zones, and coverage gaps</h3>
        </div>
      </div>

      <MapContainer center={center} zoom={11} scrollWheelZoom className="leaflet-map">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {areas.map((area) => {
          const isSelected = area.id === selectedArea?.id;
          const isRecommended = area.id === recommendedArea?.id;

          return (
            <Circle
              key={area.id}
              center={[area.latitude, area.longitude]}
              radius={700 + area.launchScore * 12}
              pathOptions={{
                color: isRecommended ? "#ff8b3d" : isSelected ? "#6fd0ff" : "#7c8a9c",
                fillColor: isRecommended ? "#ff8b3d" : "#101622",
                fillOpacity: isRecommended ? 0.28 : 0.16
              }}
              eventHandlers={{ click: () => onSelectArea(area.id) }}
            >
              <Popup>
                <strong>{area.name}</strong>
                <br />
                Launch score: {area.launchScore}/100
                <br />
                Orders: {area.totalOrders.toLocaleString()}
              </Popup>
            </Circle>
          );
        })}

        {areas.flatMap((area) =>
          area.stores.map((store) => (
            <CircleMarker
              key={`${area.id}-${store.id}`}
              center={[store.latitude, store.longitude]}
              radius={8}
              pathOptions={{
                color: store.type === "pickup-hub" ? "#ffd166" : "#1e9bff",
                fillColor: store.type === "pickup-hub" ? "#ffd166" : "#1e9bff",
                fillOpacity: 0.9
              }}
            >
              <Popup>
                <strong>{store.name}</strong>
                <br />
                {store.type === "pickup-hub" ? "Pickup hub" : "Existing store"}
              </Popup>
            </CircleMarker>
          ))
        )}
      </MapContainer>
    </div>
  );
}
