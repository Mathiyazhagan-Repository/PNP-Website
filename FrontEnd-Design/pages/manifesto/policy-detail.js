(() => {
'use strict';
const icons={school:'m2 8 10-5 10 5-10 5L2 8Zm4 3v7q6 5 12 0v-7M22 8v9',books:'m2 7 10-5 10 5-10 5L2 7ZM2 12l10 5 10-5M2 17l10 5 10-5',skills:'M4 3h16v13H4ZM1 21h22l-3-5H4Z',people:'M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM16 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM1 21v-4a5 5 0 0 1 10 0v4ZM13 21v-4a5 5 0 0 1 10 0v4Z'};
const issues={
 jobs:{title:'Jobs',summary:'Explore information on employment, skills and livelihood opportunities.',image:'news-public.png',focus:['Employment opportunities','Skills and training','Enterprise and livelihoods','Inclusive workforce participation']},
 education:{title:'Education',summary:'Quality, accessible and inclusive education for every learner, from school to higher studies.',image:'policy-education-campus.png',focus:['Strengthen school education','Improve higher education access','Skill and career development','Inclusive and equal opportunities']},
 farmers:{title:'Farmers',summary:'Explore information on agriculture, rural livelihoods and farming communities.',image:'news-programme.png',focus:['Agriculture and cultivation','Rural livelihoods','Access to information','Sustainable farming']},
 women:{title:'Women',summary:'Explore information on participation, opportunity and inclusion for women.',image:'story-volunteer.png',focus:['Participation and inclusion','Education and opportunity','Skills and livelihoods','Community engagement']},
 health:{title:'Health',summary:'Explore information on healthcare, wellbeing and access to essential services.',image:'news-programme.png',focus:['Access to care','Community wellbeing','Health information','Inclusive services']},
 cities:{title:'Cities',summary:'Explore information on cities, public infrastructure and urban communities.',image:'statistics-parliament.png',focus:['Urban infrastructure','Public transport','Community spaces','Sustainable development']}
};
const slug=new URLSearchParams(location.search).get('issue')||'education';
const issue=Object.prototype.hasOwnProperty.call(issues,slug)?issues[slug]:null;
document.getElementById('policyDetailTitle').textContent=issue?issue.title:'Policy Not Found';
document.getElementById('policyBreadcrumb').textContent=issue?issue.title:'Unknown issue';
document.title=`${issue?issue.title:'Policy Not Found'} | Manifesto & Policy | PNP`;
if(issue){document.getElementById('policyDetailSummary').textContent=issue.summary;const image=document.getElementById('policyHeroImage');image.src=`../../assets/hero/${issue.image}`;image.alt=issue.title==='Education'?'Illustrative university students on campus':`Illustrative ${issue.title.toLowerCase()} policy visual`;
const list=document.getElementById('policyFocusAreas');issue.focus.forEach((text,index)=>{const row=document.createElement('li');row.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${Object.values(icons)[index]}"/></svg>`;const label=document.createElement('span');label.textContent=text;row.append(label);list.append(row);});}
else{document.getElementById('policyDetailSummary').textContent='Choose a policy area from the Hub to explore available information.';document.getElementById('policyStatusTitle').textContent='We could not find this policy area';document.getElementById('policyOverviewText').textContent='Choose one of the six policy areas below, or return to the Policy Hub.';document.querySelector('.policy-focus-panel').hidden=true;}
const tabs=[...document.querySelectorAll('[data-policy-tab]')];
function activate(tab,focus=false){tabs.forEach(item=>{const active=item===tab;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;document.getElementById(item.getAttribute('aria-controls')).hidden=!active;});if(focus)tab.focus();}
tabs.forEach((tab,index)=>{tab.addEventListener('click',()=>activate(tab));tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;if(next!==undefined){event.preventDefault();activate(tabs[next],true);}});});
document.querySelector('.policy-details-cta').addEventListener('click',()=>activate(tabs[0]));
Object.entries(issues).filter(([key])=>key!==slug).forEach(([key,item])=>{const link=document.createElement('a');link.href=`./policy-detail.html?issue=${key}`;link.textContent=item.title;document.getElementById('relatedPolicyIssues').append(link);});
})();
