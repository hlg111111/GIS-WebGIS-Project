import test from 'node:test';
import assert from 'node:assert/strict';
import { centroid, featuresContainingPoints, haversineKm, nearestFeature, pointInPolygon, scorePark } from '../src/spatial.mjs';
import fs from 'node:fs/promises';

test('pointInPolygon identifies inside and outside points', () => {
  const square = [[0,0],[1,0],[1,1],[0,1],[0,0]];
  assert.equal(pointInPolygon([0.5, 0.5], square), true);
  assert.equal(pointInPolygon([1.5, 0.5], square), false);
});

test('haversine distance is close to one degree of longitude at equator', () => {
  assert.ok(Math.abs(haversineKm([0, 0], [1, 0]) - 111.195) < 0.2);
});

test('demo data has expected spatial containment counts', async () => {
  const data = JSON.parse(await fs.readFile(new URL('../data/city-parks.geojson', import.meta.url)));
  const parks = data.layers.parks.features;
  const hazards = data.layers.hazards.features;
  const central = parks.find((park) => park.properties.id === 'park-001');
  const contained = featuresContainingPoints(central, hazards);
  assert.deepEqual(contained.map((item) => item.properties.id), ['hazard-001']);
});

test('nearest service is deterministic', async () => {
  const data = JSON.parse(await fs.readFile(new URL('../data/city-parks.geojson', import.meta.url)));
  const central = data.layers.parks.features.find((park) => park.properties.id === 'park-001');
  const center = centroid(central);
  const nearest = nearestFeature(center, data.layers.services.features);
  assert.equal(nearest.feature.properties.id, 'service-001');
  assert.ok(nearest.distanceKm < 2);
});

test('risk score thresholds are explainable', () => {
  assert.equal(scorePark({ hazardCount: 0, highSeverityCount: 0, nearestServiceKm: 0.5 }).level, '低风险');
  assert.equal(scorePark({ hazardCount: 2, highSeverityCount: 0, nearestServiceKm: 1 }).level, '中风险');
  assert.equal(scorePark({ hazardCount: 2, highSeverityCount: 1, nearestServiceKm: 3 }).level, '高风险');
});

