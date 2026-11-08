import { centroid, featuresContainingPoints, nearestFeature, scorePark } from './spatial.mjs';

const BBOX = [108.93, 34.20, 109.08, 34.31];
const state = { data: null, selectedId: null };
const svg = document.querySelector('#map');
const parkSelect = document.querySelector('#park-select');
const analyzeButton = document.querySelector('#analyze');
const analysis = document.querySelector('#analysis');
const status = document.querySelector('#status');

function project([lon, lat]) {
  const x = ((lon - BBOX[0]) / (BBOX[2] - BBOX[0])) * 900;
  const y = 600 - ((lat - BBOX[1]) / (BBOX[3] - BBOX[1])) * 600;
  return [x, y];
}

function svgElement(name, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', name);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function drawBase() {
  svg.replaceChildren();
  svg.append(svgElement('rect', { x: 0, y: 0, width: 900, height: 600, fill: '#e9f1f0' }));
  for (let lon = BBOX[0]; lon <= BBOX[2] + 0.0001; lon += 0.025) {
    const [x] = project([lon, BBOX[1]]);
    svg.append(svgElement('line', { x1: x, y1: 0, x2: x, y2: 600, class: 'map-grid' }));
    const label = svgElement('text', { x: x + 4, y: 594, class: 'map-axis' });
    label.textContent = lon.toFixed(3);
    svg.append(label);
  }
  for (let lat = BBOX[1]; lat <= BBOX[3] + 0.0001; lat += 0.02) {
    const [, y] = project([BBOX[0], lat]);
    svg.append(svgElement('line', { x1: 0, y1: y, x2: 900, y2: y, class: 'map-grid' }));
    const label = svgElement('text', { x: 4, y: y - 4, class: 'map-axis' });
    label.textContent = lat.toFixed(3);
    svg.append(label);
  }
  svg.append(svgElement('path', { d: 'M 580 -10 C 525 130 650 210 590 350 S 560 520 650 620', fill: 'none', stroke: '#84c4d5', 'stroke-width': 16, opacity: .55 }));
}

function renderParks() {
  if (!document.querySelector('#toggle-parks').checked) return;
  state.data.layers.parks.features.forEach((feature) => {
    const points = feature.geometry.coordinates[0].map(project).map(([x, y]) => `${x},${y}`).join(' ');
    const polygon = svgElement('polygon', { points, class: `park${feature.properties.id === state.selectedId ? ' selected' : ''}` });
    polygon.addEventListener('click', () => selectPark(feature.properties.id));
    svg.append(polygon);
    const [cx, cy] = project(centroid(feature));
    const label = svgElement('text', { x: cx, y: cy, 'text-anchor': 'middle', class: 'park-label' });
    label.textContent = feature.properties.name;
    svg.append(label);
  });
}

function renderPoints() {
  if (document.querySelector('#toggle-hazards').checked) {
    state.data.layers.hazards.features.forEach((feature) => {
      const [x, y] = project(feature.geometry.coordinates);
      const severityClass = feature.properties.severity === '中' ? 'medium' : feature.properties.severity === '低' ? 'low' : '';
      const circle = svgElement('circle', { cx: x, cy: y, r: 7, class: `hazard ${severityClass}` });
      circle.append(svgElement('title')).textContent = `${feature.properties.type} / ${feature.properties.severity}`;
      svg.append(circle);
    });
  }
  if (document.querySelector('#toggle-services').checked) {
    state.data.layers.services.features.forEach((feature) => {
      const [x, y] = project(feature.geometry.coordinates);
      const marker = svgElement('circle', { cx: x, cy: y, r: 6, class: 'service' });
      marker.append(svgElement('title')).textContent = feature.properties.name;
      svg.append(marker);
    });
  }
}

function renderMap() { drawBase(); renderParks(); renderPoints(); }
function selectedPark() { return state.data.layers.parks.features.find((feature) => feature.properties.id === state.selectedId); }

function selectPark(id) {
  state.selectedId = id;
  parkSelect.value = id;
  renderMap();
  analyzeButton.disabled = false;
  runAnalysis();
}

function runAnalysis() {
  const park = selectedPark();
  if (!park) return;
  const hazards = featuresContainingPoints(park, state.data.layers.hazards.features);
  const highSeverityCount = hazards.filter((item) => item.properties.severity === '高').length;
  const nearest = nearestFeature(centroid(park), state.data.layers.services.features);
  const risk = scorePark({ hazardCount: hazards.length, highSeverityCount, nearestServiceKm: nearest.distanceKm });
  const narrative = hazards.length === 0
    ? '当前公园范围内未发现已登记风险事件，建议维持常态巡查并核验数据时效。'
    : `${hazards.length} 个风险事件落入公园范围，其中 ${highSeverityCount} 个为高严重度。建议优先安排现场复核，并确认最近服务点可通行。`;
  analysis.innerHTML = `<h3>${park.properties.name}</h3><div class="risk ${risk.level === '高风险' ? 'high' : risk.level === '低风险' ? 'low' : ''}"><strong>${risk.level}</strong> · 风险分 ${risk.score}</div><div class="metric-grid"><div class="metric"><span class="label">范围内风险事件</span><span class="value">${hazards.length}</span></div><div class="metric"><span class="label">高严重度事件</span><span class="value">${highSeverityCount}</span></div><div class="metric"><span class="label">最近服务点</span><span class="value">${nearest.distanceKm.toFixed(2)} km</span></div><div class="metric"><span class="label">公园面积</span><span class="value">${park.properties.areaHa} ha</span></div></div><div class="recommendation"><strong>GeoAI 建议</strong><br>${narrative}</div>`;
}

async function init() {
  try {
    const response = await fetch('../data/city-parks.geojson');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.data = await response.json();
    state.data.layers.parks.features.forEach((feature) => {
      const option = document.createElement('option');
      option.value = feature.properties.id;
      option.textContent = feature.properties.name;
      parkSelect.append(option);
    });
    parkSelect.disabled = false;
    analyzeButton.disabled = false;
    parkSelect.addEventListener('change', (event) => selectPark(event.target.value));
    analyzeButton.addEventListener('click', runAnalysis);
    ['#toggle-parks', '#toggle-hazards', '#toggle-services'].forEach((id) => document.querySelector(id).addEventListener('change', renderMap));
    state.selectedId = state.data.layers.parks.features[0].properties.id;
    parkSelect.value = state.selectedId;
    status.textContent = `已加载 ${state.data.layers.parks.features.length} 个公园`;
    renderMap();
    runAnalysis();
  } catch (error) {
    status.textContent = '数据加载失败';
    analysis.innerHTML = `<p class="empty">${error.message}。请通过 <code>npm start</code> 启动本地服务，不要直接双击 HTML 文件。</p>`;
  }
}

init();

