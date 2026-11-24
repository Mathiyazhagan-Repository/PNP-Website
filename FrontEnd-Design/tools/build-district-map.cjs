// Rebuild the local SVG from the attributed LGD subset; no invented boundaries.
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
const source=JSON.parse(fs.readFileSync(path.join(root,'assets/geography/source/karnataka-lgd.geojson'),'utf8'));
if(source.features.length!==31)throw Error('Expected 31 Karnataka districts');
const aliases={Chikkaballapura:'Chikkaballapur',Chamarajanagara:'Chamarajanagar',Davangere:'Davanagere',Vijayanagar:'Vijayanagara',Ramanagara:'Bengaluru South'};
const projected=point=>[point[0]*Math.PI/180,-Math.log(Math.tan(Math.PI/4+point[1]*Math.PI/360))];
const all=source.features.flatMap(f=>(f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates).flatMap(p=>p.flatMap(r=>r.map(projected))));
const [minX,maxX,minY,maxY]=all.reduce((b,p)=>[Math.min(b[0],p[0]),Math.max(b[1],p[0]),Math.min(b[2],p[1]),Math.max(b[3],p[1])],[Infinity,-Infinity,Infinity,-Infinity]);
const scale=Math.min(440/(maxX-minX),700/(maxY-minY)),offsetX=(480-(maxX-minX)*scale)/2,offsetY=18;
const project=p=>{const q=projected(p);return [(q[0]-minX)*scale+offsetX,(q[1]-minY)*scale+offsetY];};
function area(r){let a=0;for(let i=0,j=r.length-1;i<r.length;j=i++)a+=r[j][0]*r[i][1]-r[i][0]*r[j][1];return Math.abs(a/2);}
function distance(p,rings){let inside=false,min=Infinity;for(const ring of rings){for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));min=Math.min(min,Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy));}}return inside?min:-min;}
function labelPoint(rings){const ring=rings[0],xs=ring.map(p=>p[0]),ys=ring.map(p=>p[1]);let x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys),best=[(x0+x1)/2,(y0+y1)/2],score=-Infinity;for(let pass=0;pass<4;pass++){const sx=(x1-x0)/12,sy=(y1-y0)/12;for(let x=x0;x<=x1;x+=sx||1)for(let y=y0;y<=y1;y+=sy||1){const d=distance([x,y],rings);if(d>score){score=d;best=[x,y];}}x0=best[0]-sx;x1=best[0]+sx;y0=best[1]-sy;y1=best[1]+sy;}return best;}
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
let groups='',labels='';
for(const feature of source.features){const original=feature.properties.dtname,name=aliases[original]||original,id=name.toLowerCase().replaceAll(' ','-');const polygons=(feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates).map(p=>p.map(r=>r.map(project)));let d='';for(const polygon of polygons)for(const ring of polygon){let last;const points=ring.filter((p,i)=>{if(!last||i===ring.length-1||Math.hypot(p[0]-last[0],p[1]-last[1])>.45){last=p;return true;}return false;});d+=points.map((p,i)=>(i?'L':'M')+p.map(n=>n.toFixed(1)).join(',')).join('')+'Z';}
const biggest=polygons.sort((a,b)=>area(b[0])-area(a[0]))[0],point=labelPoint(biggest);const words=name.split(' ');const lines=name.length>12&&words.length>1?[words.slice(0,-1).join(' '),words.at(-1)]:[name];
groups+=`<g class="district-map-region" data-district="${id}" tabindex="0" role="button" aria-label="Explore ${escape(name)}" aria-pressed="false"><title>${escape(name)}</title><path d="${d}" fill-rule="evenodd"/></g>`;
labels+=`<text class="district-map-label" x="${point[0].toFixed(1)}" y="${(point[1]-(lines.length-1)*4).toFixed(1)}" text-anchor="middle">${lines.map((line,i)=>`<tspan x="${point[0].toFixed(1)}" dy="${i?9:0}">${escape(line)}</tspan>`).join('')}</text>`;
}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" class="district-boundary-map" viewBox="0 0 480 740" role="group" aria-label="Karnataka district map. Select a district to explore its information."><metadata>LGD districts snapshot 2024, via bharatlas and yashveeeeeeer/india-geodata; CC0-1.0 / CC-BY-4.0. Retrieved 2026-11-24. Ramanagara display name updated to Bengaluru South; geometry retained.</metadata>${groups}<g aria-hidden="true" pointer-events="none">${labels}</g></svg>`;
fs.writeFileSync(path.join(root,'assets/geography/karnataka-districts.svg'),svg);
const htmlPath=path.join(root,'pages/districts/districts.html');let html=fs.readFileSync(htmlPath,'utf8');html=html.replace(/<div class="district-map-visual">[\s\S]*?<\/div>/,`<div class="district-map-visual">${svg}<button type="button" id="districtMapExpand" class="district-map-expand" aria-label="Enlarge district map">Enlarge map ↗</button><span class="district-map-caption" id="districtMapCaption">Select a district</span></div>`);fs.writeFileSync(htmlPath,html);console.log('Built 31 district paths and 31 district labels.');
