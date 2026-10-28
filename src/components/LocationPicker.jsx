import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Leaflet's default pin image breaks when bundled with Vite,
// so we point it at the image files directly.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const NAIROBI = [-1.2864, 36.8172];

// Listens for taps/clicks on the map and reports the spot
function ClickHandler({ onChange }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// Moves the map when the pin changes (for example after "Use my location")
function FlyToPin({ value }) {
  const map = useMap();
  useEffect(() => {
    if (value) map.flyTo([value.lat, value.lng], Math.max(map.getZoom(), 15));
  }, [value, map]);
  return null;
}

function LocationPicker({ value, onChange }) {
  function useMyLocation() {
    if (!navigator.geolocation) {
      alert("Your browser doesn't support location.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert("Could not get your location. You can tap the map instead.")
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={useMyLocation}
          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
        >
          Use my location
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Clear pin
          </button>
        )}
        <span className="text-sm text-gray-500">
          {value ? "Pin placed. Tap elsewhere to move it." : "Tap the map to drop a pin."}
        </span>
      </div>

      <MapContainer
        center={value ? [value.lat, value.lng] : NAIROBI}
        zoom={12}
        className="mt-2 h-64 w-full rounded-lg border border-gray-300"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        <FlyToPin value={value} />
        {value && <Marker position={[value.lat, value.lng]} />}
      </MapContainer>
    </div>
  );
}

export default LocationPicker;