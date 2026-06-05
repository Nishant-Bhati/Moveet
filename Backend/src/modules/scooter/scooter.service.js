import Scooter from './scooter.model.js';

const formatScooter = (scooter) => {
  if (!scooter) return null;
  return {
    id: scooter._id,
    iotId: scooter.iotId || null,
    code: scooter.code,
    displayName: scooter.displayName || scooter.code,
    model: scooter.model || null,
    battery: scooter.battery,
    rangeKm: scooter.rangeKm,
    latitude: scooter.latitude,
    longitude: scooter.longitude,
    status: scooter.status,
    isLocked: scooter.isLocked,
    speed: scooter.speed,
    signalStrength: scooter.signalStrength,
    odometer: scooter.odometer,
    lastHeartbeat: scooter.lastHeartbeat ? scooter.lastHeartbeat.toISOString() : null,
    pricing: scooter.pricing ? {
      minutely: scooter.pricing.minutely,
      daily: scooter.pricing.daily,
    } : null,
  };
};

export const getNearby = async (lat, lng, radiusMeters = 2000) => {
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  const parsedRadius = parseFloat(radiusMeters);

  if (isNaN(parsedLat) || isNaN(parsedLng)) {
    throw new Error('Valid latitude and longitude are required');
  }

  // Find AVAILABLE scooters near the GeoJSON point within the max distance
  const scooters = await Scooter.find({
    status: 'AVAILABLE',
    location: {
      $nearSphere: {
        $geometry: {
          type: 'Point',
          coordinates: [parsedLng, parsedLat],
        },
        $maxDistance: parsedRadius,
      },
    },
  }).limit(20);

  return scooters.map(formatScooter);
};

export const getById = async (id) => {
  const scooter = await Scooter.findById(id);
  if (!scooter) {
    throw new Error('Scooter not found');
  }
  return formatScooter(scooter);
};

export const getByQr = async (code) => {
  const scooter = await Scooter.findOne({ qrCode: code });
  if (!scooter) {
    throw new Error('Scooter not found');
  }
  return formatScooter(scooter);
};

export const getFleetSummary = async () => {
  const response = await fetch('https://iot-backend-8ybk.onrender.com/fleet/summary');
  if (!response.ok) {
    throw new Error(`Failed to fetch fleet summary: ${response.statusText}`);
  }
  const result = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'Failed to retrieve fleet summary');
  }
  return result.data;
};

export default {
  getNearby,
  getById,
  getByQr,
  getFleetSummary,
};
