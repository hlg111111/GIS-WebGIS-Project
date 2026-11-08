const EARTH_RADIUS_KM = 6371.0088;

export function pointInPolygon(point, ring) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const crosses = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (crosses) inside = !inside;
  }
  return inside;
}

export function pointInFeature(point, feature) {
  if (feature.geometry.type === 'Polygon') {
    return pointInPolygon(point, feature.geometry.coordinates[0]);
  }
  if (feature.geometry.type === 'MultiPolygon') {
    return feature.geometry.coordinates.some((polygon) => pointInPolygon(point, polygon[0]));
  }
  return false;
}

export function haversineKm(a, b) {
  const toRad = (value) => (value * Math.PI) / 180;
  const [lon1, lat1] = a;
  const [lon2, lat2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const latA = toRad(lat1);
  const latB = toRad(lat2);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(latA) * Math.cos(latB) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function centroid(feature) {
  const ring = feature.geometry.coordinates[0];
  const unique = ring.slice(0, -1);
  const sum = unique.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]);
  return [sum[0] / unique.length, sum[1] / unique.length];
}

export function featuresContainingPoints(areaFeature, pointFeatures) {
  return pointFeatures.filter((feature) => pointInFeature(feature.geometry.coordinates, areaFeature));
}

export function nearestFeature(origin, features) {
  return features
    .map((feature) => ({ feature, distanceKm: haversineKm(origin, feature.geometry.coordinates) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)[0] ?? null;
}

export function scorePark({ hazardCount, nearestServiceKm, highSeverityCount }) {
  const score = hazardCount * 20 + highSeverityCount * 15 + (nearestServiceKm > 2 ? 25 : 0);
  if (score >= 70) return { score, level: '高风险', color: '#b42318' };
  if (score >= 40) return { score, level: '中风险', color: '#b54708' };
  return { score, level: '低风险', color: '#027a48' };
}

