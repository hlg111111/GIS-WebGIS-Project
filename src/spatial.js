function ringRelation([x,y],ring){
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const [xi,yi]=ring[i],[xj,yj]=ring[j];
    const cross=(x-xi)*(yj-yi)-(y-yi)*(xj-xi);
    const scale=Math.max(1,Math.abs(xi),Math.abs(xj),Math.abs(yi),Math.abs(yj));
    if(Math.abs(cross)<=Number.EPSILON*scale*scale*8&&x>=Math.min(xi,xj)-1e-12&&x<=Math.max(xi,xj)+1e-12&&y>=Math.min(yi,yj)-1e-12&&y<=Math.max(yi,yj)+1e-12)return 0;
    if((yi>y)!==(yj>y)&&x<((xj-xi)*(y-yi))/((yj-yi)||Number.EPSILON)+xi)inside=!inside;
  }
  return inside?1:-1;
}
function pointInPolygonPart(point,rings){
  const outer=ringRelation(point,rings[0]);
  if(outer<0)return false;
  if(outer===0)return true;
  for(const hole of rings.slice(1)){const relation=ringRelation(point,hole);if(relation===1)return false;if(relation===0)return true;}
  return true;
}
export function pointInPolygon(point,feature){
  const geometry=feature.geometry;
  if(geometry.type==='Polygon')return pointInPolygonPart(point,geometry.coordinates);
  if(geometry.type==='MultiPolygon')return geometry.coordinates.some(polygon=>pointInPolygonPart(point,polygon));
  return false;
}
export function haversineKm(a,b){const rad=x=>x*Math.PI/180;const [lon1,lat1]=a,[lon2,lat2]=b;const dLat=rad(lat2-lat1),dLon=rad(lon2-lon1),latA=rad(lat1),latB=rad(lat2);const h=Math.sin(dLat/2)**2+Math.cos(latA)*Math.cos(latB)*Math.sin(dLon/2)**2;return 2*6371.0088*Math.asin(Math.sqrt(h));}
export function nearestFeature(origin,features){if(!features.length)return null;return features.map(feature=>({feature,distanceKm:haversineKm(origin,feature.geometry.coordinates)})).sort((a,b)=>a.distanceKm-b.distanceKm)[0];}
