/* Administrative directory shared by district screens, checked against Karnataka government portals. */
(() => {
'use strict';
  const names=['Bagalkote','Ballari','Belagavi','Bengaluru Rural','Bengaluru South','Bengaluru Urban','Bidar','Chamarajanagar','Chikkaballapur','Chikkamagaluru','Chitradurga','Dakshina Kannada','Davanagere','Dharwad','Gadag','Hassan','Haveri','Kalaburagi','Kodagu','Kolar','Koppal','Mandya','Mysuru','Raichur','Shivamogga','Tumakuru','Udupi','Uttara Kannada','Vijayanagara','Vijayapura','Yadgir'];
  const domains=['bagalkot','ballari','belagavi','bangalorerural','bengalurusouth','bengaluruurban','bidar','chamrajnagar','chikkaballapur','chikkamagaluru','chitradurga','dk','davanagere','dharwad','gadag','hassan','haveri','kalaburagi','kodagu','kolar','koppal','mandya','mysore','raichur','shivamogga','tumkur','udupi','uttarakannada','vijayanagara','vijayapura','yadgir'];
  const initial=names.map((name,i)=>({id:name.toLowerCase().replaceAll(' ','-'),name,official_url:'https://'+domains[i]+'.nic.in/',source:'https://karnataka.s3waas.gov.in/'}));
window.PNPGeographyData={districts:initial};
})();
