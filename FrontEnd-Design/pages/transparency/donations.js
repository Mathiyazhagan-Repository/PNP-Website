(() => {
  'use strict';
  const root = document.querySelector('.donations-disclosure');
  if (!root) return;
  const config = window.PNPTransparency || {};
  const preview = config.donationPreview === true || (config.donationPreview !== false && !config.donationDisclosuresEndpoint && !config.overviewEndpoint);
  const byId = id => document.getElementById(id);
  const status = byId('donationsDataStatus');
  const chart = byId('donationsChart');
  const dialog = byId('donationsDocumentDialog');
  const periodButtons = byId('donationsPeriodButtons');
  const viewButtons = [...document.querySelectorAll('[data-donation-view]')];
  const state = {periods:[],selected:null,view:'preview',page:0,busy:false};
  const pageSize = 3;
  const messages = {
    preview:'Illustrative financial preview. Official PDF files have not been supplied.',
    noData:'No approved donation records are available for publication yet.',
    loading:'Loading published donation records…',
    error:'Published donation records could not be loaded. Please try again.',
    noReports:'No published donation reports match this selection.',
    sampleReport:'Illustrative record only. An official PDF has not been supplied.',
    unavailable:'The document is not available for download.',
    failedDownload:'The file could not be downloaded. Please use the document view or try again later.'
  };
  function locale() {return {en:'en-IN',kn:'kn-IN',hi:'hi-IN',ta:'ta-IN',te:'te-IN'}[byId('languageSelect')?.value] || 'en-IN';}
  function message(key) {return config.donationMessages?.[byId('languageSelect')?.value || 'en']?.[key] || messages[key];}
  function safeUrl(value,sameOrigin = false) {
    if (typeof value !== 'string' || !value) return null;
    try {
      const url = new URL(value,location.href);
      const local = url.origin === location.origin && ['localhost','127.0.0.1','[::1]'].includes(url.hostname);
      if (url.username || url.password || (url.protocol !== 'https:' && !local) || (sameOrigin && url.origin !== location.origin)) return null;
      return url.href;
    } catch {return null;}
  }
  const validMoney = value => Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER;
  const published = record => record?.approved === true && record.publication_status === 'published';
  const formatMoney = amount => '₹ ' + new Intl.NumberFormat(locale(),{minimumFractionDigits:2,maximumFractionDigits:2}).format(amount/10000000) + ' Cr';
  const formatRupees = amount => new Intl.NumberFormat(locale(),{style:'currency',currency:'INR',maximumFractionDigits:2}).format(amount);
  function examplePeriod(year,values) {
    // Explicit illustrative fixtures derived from the provided reference.
    // These are never treated as approved, published or audited records.
    const label = 'FY ' + year + '–' + String(year+1).slice(-2);
    const monthly = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'].map((label,index) => ({label,amount:Math.round(values[index]*10000000)}));
    const quarterly = Array.from({length:4},(_,index) => ({label:'Q'+(index+1),amount:monthly.slice(index*3,index*3+3).reduce((total,item)=>total+item.amount,0)}));
    const reports = [
      {id:'example-annual',title:'Donation Summary – '+label,reporting_period:label,publication_date:(year+1)+'-04-15',file_type:'PDF',kind:'annual'},
      {id:'example-q1',title:'Donation Summary – Q1',reporting_period:'Q1 '+label,publication_date:year+'-07-15',file_type:'PDF',kind:'quarterly'},
      {id:'example-q2',title:'Donation Summary – Q2',reporting_period:'Q2 '+label,publication_date:year+'-10-15',file_type:'PDF',kind:'quarterly'},
      {id:'example-q3',title:'Donation Summary – Q3',reporting_period:'Q3 '+label,publication_date:(year+1)+'-01-15',file_type:'PDF',kind:'quarterly'}
    ];
    return {id:'preview-'+year,label,total:monthly.reduce((sum,item)=>sum+item.amount,0),statementCount:reports.length,monthly,quarterly,reports,source:null,statementUrl:null};
  }
  function approvedSeries(series) {
    if (!Array.isArray(series) || !series.length || !series.every(item=>typeof item.label==='string' && item.label.trim() && validMoney(item.amount))) return [];
    return series.map(item=>({label:item.label,amount:item.amount}));
  }
  function approvedPeriods(data) {
    if (!Array.isArray(data)) return [];
    return data.filter(item=>published(item) && typeof item.id==='string' && typeof item.reporting_period==='string' && item.reporting_period.trim() && item.currency==='INR' && validMoney(item.total_contributions) && Number.isSafeInteger(item.statement_count) && item.statement_count>=0 && typeof item.source?.title==='string' && safeUrl(item.source?.url)).map(item=>({
      id:item.id,label:item.reporting_period,total:item.total_contributions,statementCount:item.statement_count,
      monthly:approvedSeries(item.monthly),quarterly:approvedSeries(item.quarterly),
      reports:Array.isArray(item.reports)?item.reports.filter(record=>published(record) && typeof record.title==='string' && record.title.trim() && typeof record.reporting_period==='string'):[],
      source:{title:item.source.title,url:safeUrl(item.source.url)},statementUrl:safeUrl(item.statement_url)
    }));
  }
  function node(tag,text,className) {const el=document.createElement(tag);if(text!==undefined)el.textContent=text;if(className)el.className=className;return el;}
  function svgNode(tag,attrs={},text) {const el=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([key,value])=>el.setAttribute(key,String(value)));if(text!==undefined)el.textContent=text;return el;}
  function actionIcon(kind) {
    const icon=svgNode('svg',{viewBox:'0 0 24 24','aria-hidden':'true'});
    if(kind==='view')icon.append(svgNode('path',{d:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z'}),svgNode('circle',{cx:12,cy:12,r:3}));
    else icon.append(svgNode('path',{d:'M12 2v14M6 10l6 6 6-6M3 17v5h18v-5'}));
    return icon;
  }
  function currentPeriod() {return state.periods.find(item=>item.id===state.selected) || null;}
  function drawChart(period) {
    chart.replaceChildren();
    byId('donationsChartTableBody').replaceChildren();
    const series = !period ? [] : state.view==='quarterly' ? period.quarterly : state.view==='annual' ? period.monthly : period.monthly.slice(0,6);
    chart.append(svgNode('title',{id:'donationsChartTitle'},'Donation contributions by period'),svgNode('desc',{id:'donationsChartDescription'},series.length ? (preview?'Illustrative data. ':'Published data. ')+period.label+'. '+series.map(point=>point.label+': '+formatRupees(point.amount)).join('; ') : 'No published trend data is available.'));
    byId('donationsChartTooltip').hidden=true;
    byId('donationsChartPreview').hidden=!preview || !series.length;
    if (!series.length) {chart.append(svgNode('text',{x:195,y:105,'text-anchor':'middle',fill:'#627b94','font-size':12},'No published trend data'));byId('donationsChartScope').textContent='No published trend data is available.';return;}
    const maxValue = Math.max(...series.map(point=>point.amount/10000000));
    const magnitude = Math.pow(10,Math.floor(Math.log10(maxValue || 1)));
    const top = [1,2,3,4,6,8,10].map(value=>value*magnitude).find(value=>value>=maxValue*1.25) || magnitude*20;
    const ticks = top===3 ? 6 : 4;
    const left=53,right=378,upper=12,bottom=174;
    const defs=svgNode('defs');const gradient=svgNode('linearGradient',{id:'donationsAreaFill',x1:0,y1:0,x2:0,y2:1});gradient.append(svgNode('stop',{offset:'0%','stop-color':'#ec66ac','stop-opacity':'.3'}),svgNode('stop',{offset:'100%','stop-color':'#fce6f2','stop-opacity':'.22'}));defs.append(gradient);chart.append(defs);
    for(let index=0;index<=ticks;index++){
      const y=bottom-(index/ticks)*(bottom-upper);
      chart.append(svgNode('line',{x1:left,y1:y,x2:right,y2:y,stroke:'#dce5ee','stroke-width':1}),svgNode('text',{x:left-11,y:y+4,'text-anchor':'end',fill:'#364c65','font-family':'Arial,sans-serif','font-size':11},new Intl.NumberFormat(locale(),{maximumFractionDigits:2,minimumFractionDigits:top===3?1:0}).format(index/ticks*top)));
    }
    chart.append(svgNode('line',{x1:left,y1:upper,x2:left,y2:bottom,stroke:'#b1c6db','stroke-width':1.2}),svgNode('text',{x:13,y:100,transform:'rotate(-90 13 100)','text-anchor':'middle',fill:'#27425d','font-family':'Arial,sans-serif','font-size':10,'font-weight':600},'Contributions (₹ Cr)'));
    const points=series.map((point,index)=>({x:series.length===1?(left+right)/2:left+index/(series.length-1)*(right-left),y:bottom-(point.amount/10000000/top)*(bottom-upper),...point}));
    const line=points.map((point,index)=>(index?'L':'M')+point.x+' '+point.y).join(' ');
    if(points.length>1) chart.append(svgNode('path',{d:'M'+points[0].x+' '+bottom+' '+points.map(p=>'L'+p.x+' '+p.y).join(' ')+' L'+points.at(-1).x+' '+bottom+'Z',fill:'url(#donationsAreaFill)'}),svgNode('path',{d:line,fill:'none',stroke:'#c21872','stroke-width':2.8,'stroke-linejoin':'round','stroke-linecap':'round'}));
    points.forEach(point=>{
      chart.append(svgNode('text',{x:point.x,y:195,'text-anchor':'middle',fill:'#30465e','font-family':'Arial,sans-serif','font-size':series.length>8?9:11},point.label));
      const marker=svgNode('circle',{cx:point.x,cy:point.y,r:4.1,fill:'#fff0fa',stroke:'#c21872','stroke-width':2.5,tabindex:0,role:'img','aria-label':point.label+': '+formatRupees(point.amount)});
      const show=()=>{const tooltip=byId('donationsChartTooltip');tooltip.textContent=point.label+' · '+formatRupees(point.amount);tooltip.style.left=Math.max(25,Math.min(75,point.x/390*100))+'%';tooltip.style.top=point.y/210*100+'%';tooltip.style.transform='translate(-50%,-115%)';tooltip.hidden=false;};
      marker.addEventListener('mouseenter',show);marker.addEventListener('focus',show);marker.addEventListener('mouseleave',()=>{byId('donationsChartTooltip').hidden=true;});marker.addEventListener('blur',()=>{byId('donationsChartTooltip').hidden=true;});chart.append(marker);
      const row=node('tr');row.append(node('th',point.label),node('td',formatRupees(point.amount)));row.firstChild.setAttribute('scope','row');byId('donationsChartTableBody').append(row);
    });
    byId('donationsChartScope').textContent=period.label+' · '+(state.view==='quarterly'?'Quarterly totals':series[0].label+'–'+series.at(-1).label+' monthly contributions')+' · ₹ crore';
  }
  function dateLabel(value) {const date=Date.parse(value);return Number.isFinite(date)?new Intl.DateTimeFormat(locale(),{day:'2-digit',month:'short',year:'numeric'}).format(new Date(date)):'Date unavailable';}
  function selectedReports(period) {return !period?[]:period.reports.filter(record=>state.view==='preview' || record.kind===state.view);}
  function previewReport(record) {
    byId('donationsDocumentMode').textContent=preview?'ILLUSTRATIVE PREVIEW':'PUBLISHED RECORD';
    byId('donationsDocumentTitle').textContent=record.title || 'Donation Report';
    byId('donationsDocumentDescription').textContent=record.description || (preview?'Sample reporting layout for the donation-disclosures design.':'Published donation reporting record.');
    const metadata=byId('donationsDocumentMetadata');metadata.replaceChildren();
    for(const [label,value] of [['Reporting period',record.reporting_period],['Publication date',dateLabel(record.publication_date)],['File type',record.file_type || 'Document']]) metadata.append(node('dt',label),node('dd',value || 'Not provided'));
    const url=preview?null:safeUrl(record.file_url);const link=byId('donationsDocumentView');link.hidden=!url;if(url)link.href=url;
    byId('donationsDocumentStatus').textContent=preview?message('sampleReport'):url?'':message('unavailable');
    dialog.showModal();
  }
  async function downloadFile(url,button) {
    if (!url) return;
    button.disabled=true;
    try {
      const response=await fetch(url,{credentials:new URL(url).origin===location.origin?'same-origin':'omit'});
      if(!response.ok)throw Error('File unavailable');
      const objectUrl=URL.createObjectURL(await response.blob());const link=document.createElement('a');link.href=objectUrl;link.download=new URL(url).pathname.split('/').pop() || 'donation-statement';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(objectUrl),3000);
    } catch {status.textContent=message('failedDownload');}
    finally {button.disabled=false;}
  }
  function renderReports(period) {
    const rows=byId('donationsReportRows');rows.replaceChildren();const records=selectedReports(period);
    state.page=Math.max(0,Math.min(state.page,Math.ceil(records.length/pageSize)-1));
    byId('donationsReportsEmpty').hidden=records.length>0;byId('donationsReportsEmpty').textContent=message('noReports');
    const visible=records.slice(state.page*pageSize,state.page*pageSize+pageSize);
    visible.forEach(record=>{
      const row=node('tr');for(const text of [record.title,record.reporting_period,dateLabel(record.publication_date),record.file_type || 'Document'])row.append(node('td',text));
      const actions=node('div',undefined,'donations-report-actions');const view=node('button');view.append(actionIcon('view'),node('span','View'));view.type='button';view.setAttribute('aria-label','View '+record.title);view.addEventListener('click',()=>previewReport(record));
      const download=node('button',undefined,'donations-row-download');download.append(actionIcon('download'),node('span','Download'));download.type='button';const url=preview?null:safeUrl(record.file_url);download.disabled=!url;download.title=url?'Download '+record.title:message('unavailable');download.setAttribute('aria-label',url?'Download '+record.title:'Download unavailable for '+record.title);if(url)download.addEventListener('click',()=>downloadFile(url,download));actions.append(view,download);const cell=node('td');cell.append(actions);row.append(cell);rows.append(row);
    });
    const pager=byId('donationsReportPager');pager.hidden=records.length<=pageSize;byId('donationsReportPageLabel').textContent=records.length?(state.page*pageSize+1)+'–'+Math.min((state.page+1)*pageSize,records.length)+' of '+records.length:'';byId('donationsReportsPrevious').disabled=state.page===0;byId('donationsReportsNext').disabled=(state.page+1)*pageSize>=records.length;
    const statementUrl=preview?null:period?.statementUrl;const button=byId('donationsDownloadStatement');button.disabled=!statementUrl;button.title=statementUrl?'Download published statement':message('unavailable');button.dataset.url=statementUrl || '';
  }
  function render() {
    const period=currentPeriod();
    byId('donationsTotal').textContent=period?formatMoney(period.total):'Not published';
    byId('donationsSelectedPeriod').textContent=period?.label || 'Unavailable';
    byId('donationsStatementCount').textContent=period?new Intl.NumberFormat(locale()).format(period.statementCount):'Not published';
    byId('donationsSourceStatus').textContent=period?(preview?'Illustrative Preview':'Published disclosure'):'Awaiting publication';
    byId('donationsPreviewTag').hidden=!preview;byId('donationsChartMode').textContent=preview?'(Sample Data)':'';
    document.querySelectorAll('.donations-sample-note').forEach(note=>{note.hidden=!preview;});
    [...periodButtons.children].forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.period===state.selected)));
    viewButtons.forEach(button=>{button.setAttribute('aria-pressed',String(state.view===button.dataset.donationView));button.disabled=!period || (button.dataset.donationView==='quarterly'?!period.quarterly.length:!period.monthly.length);});
    const source=byId('donationsSourceLink');source.hidden=!period?.source;if(period?.source){source.href=period.source.url;source.textContent='Source: '+period.source.title;}
    byId('donationsDisclosureNote').textContent=preview?'Illustrative aggregate data. Personal donor information is not shown.':'Only approved aggregate donation information is shown. Personal donor information is not published.';
    drawChart(period);renderReports(period);
  }
  function setPeriods(periods) {
    state.periods=periods;state.selected=periods.some(item=>item.id===state.selected)?state.selected:periods[0]?.id || null;state.page=0;state.view='preview';periodButtons.replaceChildren();
    periods.forEach(period=>{const button=node('button',period.label);button.type='button';button.dataset.period=period.id;button.setAttribute('aria-pressed',String(period.id===state.selected));button.addEventListener('click',()=>{state.selected=period.id;state.page=0;state.view='preview';render();});periodButtons.append(button);});render();
  }
  async function load() {
    if(state.busy)return;byId('donationsRetry').hidden=true;
    if(preview){setPeriods([examplePeriod(2025,[.5,.8,1.1,1.45,1.8,2.2,.9,.8,.75,.7,.65,.75]),examplePeriod(2024,[.4,.6,.8,1.2,1.4,1.9,.75,.65,.6,.5,.45,.55])]);status.textContent=message('preview');return;}
    const endpoint=safeUrl(config.donationDisclosuresEndpoint,true);
    if(!endpoint){setPeriods(approvedPeriods(config.donationPeriods));status.textContent=state.periods.length?'':message('noData');return;}
    state.busy=true;root.setAttribute('aria-busy','true');status.textContent=message('loading');const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
    try{const response=await fetch(endpoint,{headers:{Accept:'application/json'},credentials:'same-origin',cache:'no-store',signal:controller.signal});if(!response.ok)throw Error('Service unavailable');const data=await response.json();setPeriods(approvedPeriods(data.periods));status.textContent=state.periods.length?'':message('noData');}
    catch{setPeriods([]);status.textContent=message('error');byId('donationsRetry').hidden=false;}
    finally{clearTimeout(timer);state.busy=false;root.setAttribute('aria-busy','false');}
  }
  viewButtons.forEach(button=>button.addEventListener('click',()=>{if(button.disabled)return;state.view=button.dataset.donationView;state.page=0;render();}));
  byId('donationsReportsPrevious').addEventListener('click',()=>{state.page--;renderReports(currentPeriod());});
  byId('donationsReportsNext').addEventListener('click',()=>{state.page++;renderReports(currentPeriod());});
  byId('donationsDownloadStatement').addEventListener('click',event=>{const button=event.currentTarget;if(!button.disabled)downloadFile(button.dataset.url,button);});
  dialog.querySelectorAll('.donations-dialog-close,.donations-dialog-back').forEach(button=>button.addEventListener('click',()=>dialog.close()));
  byId('donationsRetry').addEventListener('click',load);
  byId('languageSelect')?.addEventListener('change',render);
  load();
})();
