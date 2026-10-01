(function(){
  const cfg=window.MERLIN_SUPABASE;
  if(!cfg || !cfg.url || !cfg.anonKey) return;
  const onceKey='merlin_visitor_logged_'+cfg.site;
  const now=Date.now();
  // Prevent repeated refreshes from inflating the counter; one visit per browser per 30 minutes.
  try{ const last=Number(localStorage.getItem(onceKey)||0); if(last && now-last < 30*60*1000) return; }catch(e){}

  const ua=navigator.userAgent||'';
  const bot=/bot|crawler|spider|slurp|bingpreview|facebookexternalhit|headless|monitor/i.test(ua);
  const payload={
    site:cfg.site,
    visitor_type:bot?'bot':'human',
    city:null,
    country:null,
    country_code:null,
    timestamp:new Date().toISOString(),
    user_agent:ua.slice(0,1000),
    referrer:(document.referrer||'').slice(0,1000)
  };
  const headers={'apikey':cfg.anonKey,'Authorization':'Bearer '+cfg.anonKey,'Content-Type':'application/json','Prefer':'return=minimal'};
  fetch('https://ipapi.co/json/').then(r=>r.ok?r.json():null).then(loc=>{
    if(loc){payload.city=loc.city||null;payload.country=loc.country_name||null;payload.country_code=loc.country_code||null;}
  }).catch(()=>{}).finally(()=>{
    fetch(cfg.url+'/rest/v1/visitor_logs',{method:'POST',headers:headers,body:JSON.stringify(payload),keepalive:true})
      .then(r=>{if(r.ok){try{localStorage.setItem(onceKey,String(now));}catch(e){}}})
      .catch(()=>{});
  });
})();