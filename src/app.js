import { haversineKm, nearestFeature, pointInPolygon } from './spatial.js';

const CENTER=[29.592,106.523], BOUNDS=[[29.565,106.485],[29.62,106.56]];
const $=selector=>document.querySelector(selector);
const status=$('#map-status');
let map, data, layers={parks:null,incidents:null,services:null};

function updateStatus(text){status.textContent=text;}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));}
function propsTable(properties){return Object.entries(properties).map(([key,value])=>`<dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd>`).join('');}
function showFeature(feature){if(!feature)return;const panel=$('#feature-detail');panel.innerHTML=`<span class="detail-kicker">${escapeHtml(feature.properties.kind||'地图要素')}</span><p><strong>${escapeHtml(feature.properties.name||feature.properties.id)}</strong></p><dl>${propsTable(feature.properties)}</dl>`;}
function layerStyle(){return{color:'#628155',weight:2,fillColor:'#aabd8d',fillOpacity:.34};}
function createLayers(){
  const config=[['parks','#toggle-parks','#count-parks'],['incidents','#toggle-incidents','#count-incidents'],['services','#toggle-services','#count-services']];
  for(const [key,checkbox,count] of config){
    const collection=data.layers[key],input=$(checkbox),countNode=$(count);
    layers[key]=L.geoJSON(collection,{style:layerStyle,pointToLayer:(feature,latlng)=>L.circleMarker(latlng,{radius:key==='incidents'?7:6,color:'#f9f7ee',weight:2,fillColor:key==='incidents'?'#bd6849':'#537e74',fillOpacity:1}),onEachFeature:(feature,layer)=>{layer.bindPopup(`<strong>${escapeHtml(feature.properties.name)}</strong><br>${escapeHtml(feature.properties.dataStatus||'地图要素')}`);layer.on('click',()=>showFeature(feature));}});
    if(input.checked)layers[key].addTo(map);
    countNode.textContent=input.checked?String(collection.features.length):'0';
    input.addEventListener('change',event=>{
      if(event.currentTarget.checked){layers[key].addTo(map);countNode.textContent=String(collection.features.length);}
      else{map.removeLayer(layers[key]);countNode.textContent='0';}
    });
  }
}
function polygonCenter(feature){const ring=feature.geometry.coordinates[0].slice(0,-1);return ring.reduce((sum,[lon,lat])=>[sum[0]+lon/ring.length,sum[1]+lat/ring.length],[0,0]);}
function runAnalysis(){
  const selectedId=$('#feature-select').value;
  const park=data.layers.parks.features.find(feature=>feature.properties.id===selectedId);
  if(!park){updateStatus('分析失败：未找到所选范围');return;}
  const events=data.layers.incidents.features.filter(feature=>pointInPolygon(feature.geometry.coordinates,park));
  const nearest=nearestFeature(polygonCenter(park),data.layers.services.features);
  const serviceText=nearest?`最近演示应急服务点：${escapeHtml(nearest.feature.properties.name)}，直线球面近似距离 ${nearest.distanceKm.toFixed(2)} km。`:'当前数据没有应急服务点。';
  $('#analysis-result').innerHTML=`<span class="result-kicker">ANALYSIS RESULT · ${escapeHtml(park.properties.name)}</span><p>范围内 ${events.length} 个模拟巡查 / 风险点。${serviceText}</p>`;
  map.fitBounds(L.geoJSON(park).getBounds().pad(.8));
}
function initializeControls(){
  $('#zoom-in').addEventListener('click',()=>map.zoomIn());$('#zoom-out').addEventListener('click',()=>map.zoomOut());
  $('#reset-view').addEventListener('click',()=>map.setView(CENTER,15));$('#run-analysis').addEventListener('click',runAnalysis);
  $('#feature-select').addEventListener('change',()=>showFeature(data.layers.parks.features.find(item=>item.properties.id===$('#feature-select').value)));
}
async function init(){
  if(!window.L){updateStatus('地图组件未加载；请检查网络后刷新页面');return;}
  try{
    if(window.__GIS_DATA__)data=window.__GIS_DATA__;
    else{const response=await fetch('../data/渝北龙溪演示要素.geojson');if(!response.ok)throw new Error(`本地数据读取失败（HTTP ${response.status}）`);data=await response.json();}
    map=L.map('map',{zoomControl:false}).setView(CENTER,15);map.setMaxBounds(BOUNDS);
    const basemap=L.tileLayer('https://tile.openstreetmap.de/{z}/{x}/{y}.png',{minZoom:12,maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap 贡献者</a> · 地图瓦片 <a href="https://www.openstreetmap.de/">OpenStreetMap.de</a>',updateWhenIdle:true,keepBuffer:2}).addTo(map);
    let gotTile=false;basemap.once('tileload',()=>{gotTile=true;updateStatus('龙溪街道底图与本地数据已就绪');});
    basemap.on('tileerror',()=>{if(!gotTile)updateStatus('本地要素已就绪；在线底图暂不可用，请检查网络');});
    createLayers();initializeControls();
    map.on('mousemove',event=>$('#coordinate-readout').textContent=`${event.latlng.lat.toFixed(4)}, ${event.latlng.lng.toFixed(4)}`);
    updateStatus('龙溪街道地图已就绪，正在读取在线底图');
  }catch(error){updateStatus(error.message);console.error(error);}
}
init();
