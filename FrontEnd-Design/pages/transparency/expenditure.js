(() => {
  'use strict';
  const $ = id => document.getElementById('expenditure'+id);
  if (!$('Donut')) return;
  const config = window.PNPTransparency || {};
  const preview = config.expenditurePreview === true || (config.expenditurePreview !== false && !config.expenditureEndpoint && !config.overviewEndpoint);
  const colours = ['#1888ef','#2eb644','#ffd91d','#eb199e','#7025d9'];
  const labels = ['Organisational Activities','Public Outreach','Campaign Activities','Administrative & Operations','Other Activities'];
  const shares = [40,25,20,10,5];
  let periods = [], selected, view = 'all', category = null, page = 0;
  const money = n => '\u20b9 '+(n/10000000).toFixed(2)+' Cr';
  const published = x => x?.approved === true && x.publication_status === 'published';
  function url(value) {try {if(!value)return null;const u=new URL(value,location.href);return !u.username && !u.password && (u.protocol==='https:' || (u.origin===location.origin && ['127.0.0.1','localhost'].includes(u.hostname)))?u.href:null;}catch{return null;}}
  function el(tag,text,attrs={}) {const n=document.createElement(tag);if(text!==undefined)n.textContent=text;Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));return n;}
  function svg(tag,attrs,text) {const n=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text)n.textContent=text;return n;}
  function sample(year,total) {
    const label='FY '+year+'\u2013'+String(year+1).slice(-2);
    return {id:String(year),label,total,categories:labels.map((label,i)=>({id:String(i),label,amount:total*shares[i]/100})),reports:[
      {title:'Expenditure Summary \u2013 '+label,reporting_period:label,publication_date:(year+1)+'-04-15',kind:'annual',categories:['0','1','2','3','4']},
      {title:'Activity-wise Expenditure \u2013 Q1',reporting_period:'Q1 '+label,publication_date:year+'-07-15',kind:'quarterly',quarter:'q1',categories:['0','1']},
      {title:'Campaign Expenditure Summary',reporting_period:label,publication_date:year+'-08-20',kind:'annual',categories:['2']},
      {title:'Administrative Expenditure \u2013 Q2',reporting_period:'Q2 '+label,publication_date:year+'-10-15',kind:'quarterly',quarter:'q2',categories:['3','4']}
    ],quarters:[{id:'q1',label:'Q1',total:total/4},{id:'q2',label:'Q2',total:total*.28}]};
  }
  function normalise(data) {
    return (Array.isArray(data)?data:[]).filter(p=>published(p)&&p.currency==='INR'&&Number.isFinite(p.total_expenditure)&&p.total_expenditure>=0&&p.reporting_period&&url(p.source?.url)).map(p=>({id:p.id,label:p.reporting_period,total:p.total_expenditure,categories:(p.categories||[]).filter(c=>typeof c.label==='string'&&Number.isFinite(c.amount)&&c.amount>=0),reports:(p.reports||[]).filter(r=>published(r)&&r.title&&r.reporting_period),quarters:[],source:p.source,archive:url(p.download_all_url)}));
  }
  function draw(data,total) {
    const chart=$('Donut'),legend=$('Legend');chart.replaceChildren();legend.replaceChildren();$('ChartTableBody').replaceChildren();
    chart.append(svg('title',{id:'expenditureChartTitle'},'Expenditure by category'),svg('desc',{id:'expenditureChartDescription'},preview?'Illustrative sample financial data.':'Published expenditure category data.'));
    const sum=data.reduce((n,c)=>n+c.amount,0);
    if(!total || Math.abs(sum-total)>.01){chart.append(svg('text',{x:120,y:120,'text-anchor':'middle','font-size':12},'Category data unavailable'));return;}
    let offset=0;const circumference=2*Math.PI*85;
    data.forEach((c,i)=>{
      const percentage=c.amount/total*100;
      const ring=svg('circle',{cx:120,cy:120,r:85,fill:'none',stroke:colours[i%5],'stroke-width':36,'stroke-dasharray':`${circumference*percentage/100} ${circumference}`,'stroke-dashoffset':-offset,transform:'rotate(-90 120 120)','data-category':c.id,tabindex:0,role:'button','aria-label':c.label+' '+percentage.toFixed(1)+' percent'});
      const choose=()=>{category=category===c.id?null:c.id;page=0;render();};ring.addEventListener('click',choose);ring.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});chart.append(ring);offset+=circumference*percentage/100;
      const li=el('li'),button=el('button',undefined,{type:'button','aria-pressed':String(category===c.id)}),dot=el('span',undefined,{class:'expenditure-legend-dot'});dot.style.background=colours[i%5];button.append(dot,el('span',c.label),el('strong',Math.round(percentage)+'%'));button.addEventListener('click',choose);li.append(button);legend.append(li);
      const tr=el('tr');tr.append(el('td',c.label),el('td',money(c.amount)),el('td',percentage.toFixed(1)+'%'));$('ChartTableBody').append(tr);
    });
    [['Total',98,16],['Expenditure',120,17],[money(total),150,21]].forEach(([text,y,size])=>chart.append(svg('text',{x:120,y,'text-anchor':'middle','font-size':size,'font-weight':800,fill:'#071b49'},text)));
  }
  function show(record) {
    $('DocumentMode').textContent=preview?'Illustrative record':'Published record';$('DocumentTitle').textContent=record.title;
    $('DocumentDescription').textContent=preview?'Sample report metadata for this design. Official files have not been supplied.':'Published expenditure report.';
    $('DocumentMetadata').replaceChildren();[['Reporting period',record.reporting_period],['Publication date',record.publication_date||'Not supplied'],['File type','PDF']].forEach(([key,value])=>$('DocumentMetadata').append(el('dt',key),el('dd',value)));
    const link=url(record.document_url||record.download_url);$('DocumentView').hidden=!link;if(link)$('DocumentView').href=link;$('DocumentDialog').showModal();
  }
  function render() {
    const p=selected,q=view==='quarterly'?p?.quarters.find(x=>x.id===$('Quarter').value):null,total=q?.total??p?.total;
    $('PreviewTag').hidden=!preview;$('ChartMode').textContent=preview?'(Sample Data)':'';
    document.querySelectorAll('.expenditure-sample-note').forEach(n=>n.hidden=!preview);
    $('Total').textContent=p?money(total):'\u2014';$('SelectedPeriod').textContent=p?(q?q.label+' ':'')+p.label:'\u2014';$('Compliance').textContent=preview?'Illustrative Preview':'Published information';
    let records=p?.reports||[];if(view==='annual')records=records.filter(r=>r.kind==='annual');if(q)records=records.filter(r=>r.quarter===q.id);if(category!==null)records=records.filter(r=>r.categories?.includes(category));
    $('ReportCount').textContent=p?String(q?records.length:p.reports.length):'\u2014';
    draw(p?(q&&preview?p.categories.map(c=>({...c,amount:total*c.amount/p.total})):p.categories):[],total||0);
    $('CategoryStatus').textContent=category!==null?'Showing reports for '+(p.categories.find(c=>c.id===category)?.label||'selected category'):'';
    $('ReportRows').replaceChildren();records.slice(page*4,page*4+4).forEach(r=>{const tr=el('tr');[r.title,r.reporting_period,r.publication_date?new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(r.publication_date)):'Not supplied','PDF'].forEach(t=>tr.append(el('td',t)));const td=el('td'),actions=el('div',undefined,{class:'donations-report-actions'}),button=el('button','\u25c9 View',{type:'button',class:'donations-view-button'});button.addEventListener('click',()=>show(r));const download=el('button','\u2193 Download',{type:'button',class:'donations-download-button'});download.disabled=preview||!url(r.download_url);download.addEventListener('click',()=>window.open(url(r.download_url),'_blank','noopener'));actions.append(button,download);td.append(actions);tr.append(td);$('ReportRows').append(tr);});
    $('ReportsEmpty').hidden=records.length>0;$('ReportPager').hidden=records.length<=4;$('ReportPageLabel').textContent=`${page+1} / ${Math.max(1,Math.ceil(records.length/4))}`;$('ReportsPrevious').disabled=page===0;$('ReportsNext').disabled=(page+1)*4>=records.length;
    $('DownloadAll').disabled=preview||!p?.archive;$('QuarterControl').hidden=view!=='quarterly';
    document.querySelectorAll('[data-expenditure-view]').forEach(b=>{b.classList.toggle('active',b.dataset.expenditureView===view);b.setAttribute('aria-pressed',String(b.dataset.expenditureView===view));if(b.dataset.expenditureView==='quarterly')b.disabled=!p?.quarters.length;});
    [...$('PeriodButtons').children].forEach(b=>{b.classList.toggle('active',b.dataset.period===p?.id);b.setAttribute('aria-pressed',String(b.dataset.period===p?.id));});
    $('SourceLink').hidden=!p?.source;if(p?.source){$('SourceLink').href=url(p.source.url);$('SourceLink').textContent=p.source.title;}
    $('DisclosureNote').textContent=preview?'Sample expenditure figures for this design. Official supporting documents have not been supplied.':'Only approved and published expenditure information is shown. Supporting documents are available where published.';
  }
  function select(p) {selected=p;view='all';category=null;page=0;$('Quarter').replaceChildren();p.quarters.forEach(q=>$('Quarter').append(el('option',q.label,{value:q.id})));$('Quarter').value=p.quarters[0]?.id||'';render();}
  async function load() {
    $('Retry').hidden=true;$('DataStatus').textContent='Loading expenditure reports...';
    try {if(preview)periods=[sample(2025,108000000),sample(2024,86000000)];else if(Array.isArray(config.expenditurePeriods))periods=normalise(config.expenditurePeriods);else if(config.expenditureEndpoint){const endpoint=url(config.expenditureEndpoint);if(!endpoint||new URL(endpoint).origin!==location.origin)throw Error();const response=await fetch(endpoint,{credentials:'same-origin',headers:{Accept:'application/json'}});if(!response.ok)throw Error();const data=await response.json();periods=normalise(data.periods);}else periods=[];
      $('PeriodButtons').replaceChildren();periods.forEach(p=>{const b=el('button',p.label,{type:'button'});b.dataset.period=p.id;b.addEventListener('click',()=>select(p));$('PeriodButtons').append(b);});if(periods.length)select(periods[0]);else{selected=null;render();}$('DataStatus').textContent=preview?'Illustrative financial preview. Official PDF files have not been supplied.':periods.length?'Published expenditure records.':'No approved expenditure records are available yet.';
    }catch{periods=[];selected=null;render();$('DataStatus').textContent='Expenditure records could not be loaded. Please try again.';$('Retry').hidden=false;}
  }
  document.querySelectorAll('[data-expenditure-view]').forEach(b=>b.addEventListener('click',()=>{view=b.dataset.expenditureView;page=0;category=null;render();}));
  $('Quarter').addEventListener('change',()=>{page=0;render();});$('ReportsPrevious').addEventListener('click',()=>{page--;render();});$('ReportsNext').addEventListener('click',()=>{page++;render();});$('DownloadAll').addEventListener('click',()=>{if(selected?.archive&&!preview)window.open(selected.archive,'_blank','noopener');});
  $('DocumentDialog').querySelectorAll('.donations-dialog-close,.donations-dialog-back').forEach(b=>b.addEventListener('click',()=>$('DocumentDialog').close()));$('Retry').addEventListener('click',load);load();
})();
