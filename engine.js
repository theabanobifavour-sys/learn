/* Struggle First engine. Shared by every game. Replace this one file to update all games. */
(function(){
'use strict';

/* ---------- Approved puzzle bank (only puzzles Favour has approved are in this file) ---------- */
var BADCARRY = 'Carried the negative sign into the answer';
var PUZZLES = {
  p1: {
    id:'p1', title:'The Doubling Culture', topic:'Indices, leading into logarithms', minutes:10, approved:'5 Oct 2026',
    intro:'A bacteria culture starts with 1 cell and doubles every hour.',
    steps:[
      {type:'number', short:'Cells after 3 hours', prompt:'How many cells are there after 3 hours?', ans:[8],
        wrong:[{v:6,tag:'Treated the power as multiplication (2 × 3)'},{v:9,tag:'Swapped base and exponent (3 squared)'}]},
      {type:'pick', short:'Expression for n hours', prompt:'Which expression gives the number of cells after <i>n</i> hours?',
        options:[{t:'2<sup>n</sup>',ok:true},{t:'2n',tag:'Read the index as a multiplier'},{t:'n<sup>2</sup>',tag:'Swapped base and exponent'},{t:'2 + n',tag:'Treated growth as adding, not repeated doubling'}]},
      {type:'number', short:'Multiplying powers of 2', prompt:'Complete: 2<sup>5</sup> × 2<sup>3</sup> = 2<sup>?</sup>. What number goes in place of the ?', ans:[8],
        wrong:[{v:15,tag:'Multiplied the exponents instead of adding'},{v:2,tag:'Subtracted the exponents (mixed up with division)'}]},
      {type:'pick', short:'Choosing a method', prompt:'You are told 2<sup>10</sup> = 1024. You want the first hour when the culture has at least 1,000,000 cells. What is your next move?',
        options:[
          {t:'Notice that 1024 is close to 1000, so 2<sup>20</sup> should be close to 1,000,000',ok:true,note:'Spotted the shortcut: 1024 is close to 1000'},
          {t:'Keep doubling from 1024 and count the hours until I pass 1,000,000',ok:true,note:'Brute force doubling (valid, slower)'},
          {t:'Divide 1,000,000 by 2',tag:'Linear thinking about exponential growth'},
          {t:'Divide 1,000,000 by 1024',tag:'Confused "how many doublings" with "how many 1024s fit"'}]},
      {type:'number', short:'Hours to reach 1,000,000', prompt:'How many whole hours until the culture first has at least 1,000,000 cells?', ans:[20],
        wrong:[{v:19,tag:'Did not check "at least": 2<sup>19</sup> is still too small'},{v:976,tag:'Followed the divide-by-1024 move'},{v:977,tag:'Followed the divide-by-1024 move'},{v:500000,tag:'Divided by 2 (linear thinking)'},{v:10,tag:'Took the given exponent as the answer'}]},
      {type:'text', short:'Reflection', prompt:'In one line, say how you decided. This part is not marked.'}
    ]
  },
  p2: {
    id:'p2', title:'The Shrinking Pattern', topic:'Zero and negative indices', minutes:7, approved:'5 Oct 2026',
    intro:'2<sup>3</sup> = 8, 2<sup>2</sup> = 4, 2<sup>1</sup> = 2. The pattern keeps going down.',
    steps:[
      {type:'number', short:'Spotting the pattern', prompt:'Each step down, what do you divide the answer by?', ans:[2],
        wrong:[{v:4,tag:'Used the first drop (8 − 4) instead of the repeating ratio'},{v:1,tag:'Thought each step down subtracts, not divides'}]},
      {type:'pick', short:'Zero index', prompt:'2<sup>0</sup> = ?',
        options:[{t:'1',ok:true},{t:'0',tag:'Thinks a zero index gives zero'},{t:'2',tag:'Ignored the index'},{t:'It cannot be worked out',tag:'Thinks a zero index is not allowed'}]},
      {type:'pick', short:'Negative index (1)', prompt:'2<sup>−1</sup> = ?',
        options:[{t:'1/2',ok:true},{t:'−2',tag:BADCARRY},{t:'−1/2',tag:'Carried the sign and also halved'},{t:'0.2',tag:'Read the index as a decimal digit'}]},
      {type:'pick', short:'Negative index (3)', prompt:'2<sup>−3</sup> = ?',
        options:[{t:'1/8',ok:true},{t:'−8',tag:BADCARRY},{t:'1/6',tag:'Multiplied base by exponent (2 × 3)'},{t:'6',tag:'Multiplied base by exponent and ignored the sign'}]},
      {type:'number', short:'Combining positive and negative', prompt:'2<sup>3</sup> × 2<sup>−3</sup> = ?', ans:[1],
        wrong:[{v:0,tag:'Thinks the powers cancel to nothing (zero index = zero)'},{v:64,tag:'Ignored the negative index (8 × 8)'}]},
      {type:'text', short:'Reflection', prompt:'Look back at your answers. What rule did the pattern show you? This part is not marked.'}
    ]
  }
};
PUZZLES.p3 = {
  id:'p3', title:'The Log Shortcut Table', topic:'Laws of logarithms', minutes:10, approved:'5 Oct 2026',
  intro:'The log of a number is the power that 10 must be raised to, to get that number. Example: log 100 = 2, because 10<sup>2</sup> = 100. You are given: log 2 = 0.30, log 3 = 0.48 and log 10 = 1.',
  steps:[
    {type:'number', short:'log 100', prompt:'log 100 = ?', ans:[2], tol:0.005,
      wrong:[{v:10,tag:'Divided 100 by 10'},{v:100,tag:'Gave the number itself as its log'}]},
    {type:'number', short:'log 4', prompt:'Using the numbers you are given, log 4 = ?', ans:[0.6], tol:0.005,
      wrong:[{v:0.09,tag:'Multiplied the logs'},{v:0.48,tag:'Split a sum inside the log (3 + 1)'},{v:1.2,tag:'Multiplied the log by the number (4 × 0.30)'}]},
    {type:'number', short:'log 6', prompt:'log 6 = ?', ans:[0.78], tol:0.005,
      wrong:[{v:0.144,tag:'Multiplied the logs'},{v:0.18,tag:'Subtracted the logs instead of adding'},{v:1.8,tag:'Multiplied the log by the number (6 × 0.30)'}]},
    {type:'number', short:'log 5', prompt:'log 5 = ? (Hint: 5 is 10 divided by 2.)', ans:[0.7], tol:0.005,
      wrong:[{v:1.3,tag:'Added where division needed subtraction'},{v:3.33,tag:'Divided the logs (1 ÷ 0.30)'}]},
    {type:'number', short:'log 1.5', prompt:'log 1.5 = ? (Hint: 1.5 is 3 divided by 2.)', ans:[0.18], tol:0.005,
      wrong:[{v:1.6,tag:'Divided the logs (0.48 ÷ 0.30)'},{v:0.78,tag:'Added where division needed subtraction'}]},
    {type:'number', short:'log 8', prompt:'log 8 = ?', ans:[0.9], tol:0.005,
      wrong:[{v:2.4,tag:'Multiplied the log by the number (8 × 0.30)'},{v:0.03,tag:'Cubed the log instead of multiplying by 3'}]},
    {type:'text', short:'Reflection', prompt:'What shortcut did you notice? This part is not marked.'}
  ]
};
/* ---------- Adventures: game scenes (no timer, no maths words, no retries; DRAFT until Favour approves the levels) ---------- */
var LAD = [10,100,1000,10000,100000,1000000,10000000];
function naira(n){ return '₦' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
var OUT = 'stroke:var(--fg);stroke-width:2;stroke-linejoin:round;stroke-linecap:round';
function sackArt(c, l){ return '<path d="M12 12q12-7 24 0l3 28q-15 6-30 0z" style="fill:' + c + ';' + OUT + '"/><rect x="17" y="22" width="14" height="9" rx="2" style="fill:' + l + '"/>'; }
var ART = {
  bag:'<rect x="10" y="18" width="28" height="24" rx="4" style="fill:#3B6FD4;' + OUT + '"/><path d="M17 18v-4a7 7 0 0 1 14 0v4" style="fill:none;' + OUT + '"/>',
  phone:'<rect x="14" y="5" width="20" height="38" rx="4" style="fill:#2B3947;' + OUT + '"/><rect x="17" y="10" width="14" height="24" rx="1" style="fill:#8FD3FF"/>',
  sweets:'<path d="M6 16l9 8-9 8zM42 16l-9 8 9 8z" style="fill:#E5484D;' + OUT + '"/><circle cx="24" cy="24" r="10" style="fill:#E5484D;' + OUT + '"/>',
  bike:'<circle cx="11" cy="34" r="7" style="fill:none;' + OUT + '"/><circle cx="37" cy="34" r="7" style="fill:none;' + OUT + '"/><path d="M11 34l10-14h10l6 14M21 20l-3-6h6" style="fill:none;' + OUT + '"/>',
  rice:sackArt('#F2E6C9', '#1E8E5A'), cement:sackArt('#9AA1A8', '#444B52'), garri:sackArt('#E9C46A', '#B4600B'),
  sandals:'<ellipse cx="16" cy="28" rx="7" ry="13" style="fill:#C77B30;' + OUT + '"/><ellipse cx="32" cy="28" rx="7" ry="13" style="fill:#C77B30;' + OUT + '"/>'
};
function artSVG(kind, w){ return '<svg viewBox="0 0 48 48" width="' + w + '" height="' + w + '" aria-hidden="true" style="overflow:visible">' + ART[kind] + '</svg>'; }
function personSVG(color){ return '<svg viewBox="0 0 48 48" width="38" height="38" aria-hidden="true"><circle cx="24" cy="14" r="8" style="fill:#8A5A3B;' + OUT + '"/><path d="M8 46q0-18 16-18t16 18z" style="fill:' + color + ';' + OUT + '"/></svg>'; }
function pieSVG(den, w){
  var s = '<svg viewBox="0 0 48 48" width="' + w + '" height="' + w + '" aria-hidden="true"><circle cx="24" cy="24" r="19" style="fill:var(--surface);' + OUT + '"/>';
  if (den > 0) { var a = 2 * Math.PI / den, x = 24 + 19 * Math.sin(a), y = 24 - 19 * Math.cos(a); s += '<path d="M24 24L24 5A19 19 0 ' + (a > Math.PI ? 1 : 0) + ' 1 ' + x.toFixed(2) + ' ' + y.toFixed(2) + 'Z" style="fill:#E9C46A;' + OUT + '"/>'; }
  return s + '</svg>';
}
function houseSVG(){ return '<svg viewBox="0 0 30 32" aria-hidden="true"><path d="M2 14L15 3l13 11z" style="fill:#C2410C;' + OUT + '"/><rect x="5" y="14" width="20" height="15" style="fill:#F2E6C9;' + OUT + '"/><rect x="12" y="19" width="6" height="10" style="fill:#7A4A2B"/></svg>'; }
function rungJudge(ok, tagFn){ return function(a){ var n = +String(a).slice(1); if (n === ok) return {ok:true}; return {tag:tagFn(n)}; }; }
function burst(host){
  var c = h('div', {class:'coins', 'aria-hidden':'true'});
  for (var i = 0; i < 7; i++) c.append(h('i', {class:'coin', style:'--dx:' + (i * 14 - 42) + 'px;animation-delay:' + (i * 40) + 'ms'}));
  host.append(c); setTimeout(function(){ if (c.parentNode) c.remove(); }, 1300);
}
function speech(text){ return h('div', {class:'speech', role:'status', 'aria-live':'polite'}, text); }
function setSay(el, t, mood){ el.textContent = t; el.className = 'speech' + (mood ? ' ' + mood : ''); }
function lockBtn(label){ return h('button', {class:'btn', disabled:true}, label || 'I am sure'); }

/* Tower: the learner moves or chooses freely, then locks in once. Nothing tells them right or wrong. */
function buildTower(host, api, step){
  var N = 7, FH = 52, pos = step.start || 1, climbs = 0, sel = null, known = step.known || [];
  var sp = speech(step.say), car = h('div', {class:'car'}), shaft = h('div', {class:'shaft'}, car), floorsEl = h('div', {class:'floors'}), rows = {};
  car.innerHTML = personSVG(step.color || '#C2410C') + '<span class="carart">' + artSVG(step.item, 30) + '</span>';
  function place(p, d){ car.style.transitionDuration = d + 's'; car.style.bottom = ((p - 1) * FH + 3) + 'px'; }
  for (var f = 1; f <= N; f++) (function(f){
    var isK = known.indexOf(f) >= 0;
    var sign = h('span', {class:'sign' + (isK ? ' on' : '')}, isK ? naira(LAD[f-1]) : '?');
    var row = h(step.mode === 'tap' ? 'button' : 'div', {class:'floor', 'aria-label':'Floor ' + f + (isK ? ', ' + naira(LAD[f-1]) : '')}, h('span', {class:'fl mono'}, String(f)), sign);
    if (step.mode === 'tap') row.addEventListener('click', function(){
      if (api.locked) return;
      if (sel) rows[sel].classList.remove('sel');
      sel = f; row.classList.add('sel'); go.disabled = false;
      setSay(sp, 'Floor ' + f + '. You can change your mind before you lock in.', '');
    });
    rows[f] = row; floorsEl.append(row);
  })(f);
  place(pos, 0);
  host.append(sp, h('div', {class:'tower'}, shaft, floorsEl));
  var go = lockBtn(step.mode === 'tap' ? 'Take them to this floor' : 'Open the doors here');
  function arrive(){ setSay(sp, 'Thank you! We have arrived.', 'good'); burst(shaft); }
  if (step.mode === 'tap') {
    go.addEventListener('click', function(){
      if (api.locked || !sel) return; var f = sel, d = Math.max(.5, .3 * Math.abs(f - pos));
      api.submit('r' + f, 3200); go.disabled = true; pos = f; place(f, d); setTimeout(arrive, d * 1000 + 150);
    });
    host.append(go);
  }
  if (step.mode === 'count') {
    var up = h('button', {class:'btn'}, '▲ Up one floor'), down = h('button', {class:'btn ghost'}, '▼ Down one floor'); go.disabled = false;
    up.addEventListener('click', function(){ if (api.locked) return; if (pos + 1 > N) { setSay(sp, 'That is the top floor!', ''); return; } pos += 1; climbs++; place(pos, .5); });
    down.addEventListener('click', function(){ if (api.locked) return; if (climbs <= 0) { setSay(sp, 'You are at the start. Go up!', ''); return; } pos -= 1; climbs--; place(pos, .5); });
    go.addEventListener('click', function(){ if (api.locked) return; api.submit('u' + climbs, 3200); go.disabled = true; up.disabled = true; down.disabled = true; setSay(sp, 'The doors open. Thank you!', 'good'); burst(shaft); });
    host.append(h('div', {class:'row'}, up, down), go);
  }
  if (step.mode === 'slider') {
    var lever = h('input', {type:'range', min:'0', max:'100', step:'1', value:'8', id:'lever', 'aria-label':'Lift lever'}); go.disabled = false;
    function mv(){ pos = 3 + (+lever.value) / 100; place(pos, .12); }
    lever.addEventListener('input', function(){ if (!api.locked) mv(); }); mv();
    go.addEventListener('click', function(){ if (api.locked) return; api.submit('f' + lever.value, 3200); go.disabled = true; lever.disabled = true; setSay(sp, 'The doors open. Thank you!', 'good'); burst(shaft); });
    host.append(h('label', {for:'lever', class:'small muted'}, 'Lift lever: slide it up or down'), lever, go);
  }
}

function amtLabel(a){ return a >= 1 ? Math.round(a) + (a > 1 ? ' cups' : ' cup') : '1/' + String(Math.round(1 / a)).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' cup'; }
function shareLabel(a){ return a >= 1 ? String(Math.round(a)) : '1/' + String(Math.round(1 / a)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
/* Street: the sack shrinks and grows on screen, but amounts are never printed where they would hand over the answer. */
function buildStreet(host, api, step){
  var amt = step.startAmt, shares = 0, mode = step.mode, sel = null;
  var sp = speech(step.say), fig = h('div', {class:'sackfig'}), cap = h('div', {class:'amt'}, step.capText || '');
  fig.innerHTML = artSVG('garri', 120);
  var box = h('div', {class:'sackbox', role:'img', 'aria-label':'The sack of garri, drawn to scale'}, fig);
  function draw(){ fig.style.transform = 'scale(' + Math.max(Math.sqrt(amt / 64), 0.04) + ')'; }
  host.append(sp, box, cap); draw();
  var lock = lockBtn();
  function select(group, el, key){ if (api.locked) return; group.forEach(function(x){ x.el.classList.remove('sel'); }); el.classList.add('sel'); sel = key; lock.disabled = false; }
  if (mode === 'predict') {
    var houses = [], street = h('div', {class:'street'}), group = [];
    for (var j = 1; j <= 10; j++) (function(j){
      var lab = h('span', {class:'hl'}, ''), b = h('button', {class:'house', 'aria-label':'House ' + j}, h('span', {class:'hn'}, String(j)), lab);
      b.insertAdjacentHTML('afterbegin', houseSVG());
      group.push({el:b}); houses[j] = {b:b, lab:lab}; street.append(b);
      b.addEventListener('click', function(){ select(group, b, j); });
    })(j);
    lock.textContent = 'I am sure';
    lock.addEventListener('click', function(){
      if (api.locked || !sel) return; var g = sel;
      api.submit('h' + g, 2200 + g * 700 + 2200); lock.disabled = true; setSay(sp, 'Here we go. Sharing with ' + g + ' houses...', '');
      (function next(){ if (shares >= g) { cap.textContent = 'You are holding ' + amtLabel(amt) + '.'; setSay(sp, 'All ' + g + ' houses have been served.', 'good'); burst(box); return; }
        setTimeout(function(){ shares++; amt = amt / 2; houses[shares].lab.textContent = shareLabel(amt); houses[shares].b.classList.add('fed'); draw(); next(); }, 650); })();
    });
    host.append(street, lock);
  }
  if (mode === 'pie') {
    var shareBtn = h('button', {class:'btn'}, 'Share half'), choices = h('div', {class:'opts', hidden:true}), pg = [];
    [8, 6, 3, 0].forEach(function(den){
      var b = h('button', {class:'opt pick', 'aria-label':den ? '1 over ' + den + ' of a cup' : 'Nothing left'}, h('span', {html:pieSVG(den, 40)}), h('span', {}, den ? '1/' + den + ' of a cup' : 'Nothing left'));
      pg.push({el:b}); b.addEventListener('click', function(){ select(pg, b, den); }); choices.append(b);
    });
    shareBtn.addEventListener('click', function(){ if (shares >= 3 || api.locked) return; shares++; amt = amt / 2; cap.textContent = ''; draw(); setSay(sp, shares < 3 ? 'Shared! Keep going.' : 'That is 3 shares. Which cup shows what is left in your hands?', ''); if (shares >= 3) { shareBtn.disabled = true; choices.hidden = false; lock.hidden = false; } });
    lock.hidden = true;
    lock.addEventListener('click', function(){ if (api.locked || sel === null) return; api.submit('c' + sel, 2200); lock.disabled = true; choices.querySelectorAll('button').forEach(function(x){ x.disabled = true; }); setSay(sp, 'Locked in. Thank you!', 'good'); burst(box); });
    host.append(shareBtn, choices, lock);
  }
  if (mode === 'double') {
    var dbl = h('button', {class:'btn'}, 'Double it'), reset = h('button', {class:'btn ghost small'}, 'Start again'), n = 0;
    lock.textContent = 'This is the full sack'; lock.disabled = false;
    dbl.addEventListener('click', function(){ if (api.locked || amt >= 1024) return; amt *= 2; n++; cap.textContent = ''; draw(); });
    reset.addEventListener('click', function(){ if (api.locked) return; amt = step.startAmt; n = 0; cap.textContent = step.capText || ''; draw(); });
    lock.addEventListener('click', function(){ if (api.locked) return; api.submit('d' + n, 2200); lock.disabled = true; dbl.disabled = true; reset.disabled = true; setSay(sp, 'Locked in. Thank you!', 'good'); burst(box); });
    host.append(dbl, reset, lock);
  }
  if (mode === 'crumb') {
    var sh = h('button', {class:'btn'}, 'Share half'), cg = [];
    var gone = h('button', {class:'opt'}, 'It will all be gone'), crumb = h('button', {class:'opt'}, 'There is always a crumb left');
    cg.push({el:gone}, {el:crumb});
    gone.addEventListener('click', function(){ select(cg, gone, 'g'); }); crumb.addEventListener('click', function(){ select(cg, crumb, 'n'); });
    sh.addEventListener('click', function(){ if (api.locked || shares >= 30) return; shares++; amt = amt / 2; draw(); });
    lock.addEventListener('click', function(){ if (api.locked || !sel) return; api.submit(sel === 'n' ? 'n' : 'g' + shares, 2200); lock.disabled = true; sh.disabled = true; gone.disabled = true; crumb.disabled = true; setSay(sp, 'Locked in. Thank you!', 'good'); burst(box); });
    host.append(sh, h('div', {class:'opts'}, gone, crumb), lock);
  }
}

/* Paper: the learner commits a guess, then the game runs their guess so the consequence is on screen. */
function fmtLen(mm){ return mm < 10 ? (Math.round(mm * 10) / 10) + ' mm' : mm < 1000 ? (Math.round(mm / 10 * 10) / 10) + ' cm' : mm < 1e6 ? (Math.round(mm / 1000 * 10) / 10) + ' m' : mm < 1e12 ? Math.round(mm / 1e6).toLocaleString('en') + ' km' : 'too tall to measure'; }
var ICON = {
  coin:'<ellipse cx="24" cy="30" rx="15" ry="6" style="fill:#B8BEC4;' + OUT + '"/><ellipse cx="24" cy="25" rx="15" ry="6" style="fill:#DDE1E5;' + OUT + '"/>',
  finger:'<rect x="17" y="6" width="14" height="36" rx="7" style="fill:#E0A98A;' + OUT + '"/><path d="M19 14h10" style="fill:none;' + OUT + '"/>',
  phone:ART.phone,
  table:'<rect x="5" y="16" width="38" height="6" rx="1" style="fill:#A8743A;' + OUT + '"/><path d="M9 22v20M39 22v20" style="fill:none;' + OUT + '"/>',
  house:'<path d="M4 22L24 6l20 16z" style="fill:#C2410C;' + OUT + '"/><rect x="9" y="22" width="30" height="20" style="fill:#F2E6C9;' + OUT + '"/><rect x="20" y="29" w="8" width="8" height="13" style="fill:#7A4A2B"/>'
};
ART.paper = '<rect x="8" y="34" width="32" height="4" style="fill:#fff;' + OUT + '"/><rect x="8" y="28" width="32" height="4" style="fill:#fff;' + OUT + '"/><rect x="8" y="22" width="32" height="4" style="fill:#fff;' + OUT + '"/><rect x="8" y="16" width="32" height="4" style="fill:#fff;' + OUT + '"/>';
function iconSVG(k){ return '<svg viewBox="0 0 48 48" width="44" height="44" aria-hidden="true">' + ICON[k] + '</svg>'; }
function refSVG(kind){
  if (kind === 'door') return '<svg viewBox="0 0 70 200" width="70" height="200" aria-hidden="true"><rect x="3" y="3" width="64" height="197" rx="3" style="fill:#8B5A2B;' + OUT + '"/><circle cx="54" cy="108" r="4" style="fill:#E9C46A;stroke:var(--fg);stroke-width:1.5"/></svg>';
  var w = '', r, c; for (r = 0; r < 10; r++) for (c = 0; c < 4; c++) w += '<rect x="' + (10 + c * 20) + '" y="' + (12 + r * 19) + '" width="12" height="11" style="fill:#8FD3FF"/>';
  return '<svg viewBox="0 0 94 200" width="94" height="200" aria-hidden="true"><rect x="3" y="3" width="88" height="197" style="fill:#9AA1A8;' + OUT + '"/>' + w + '</svg>';
}
function buildPaper(host, api, step){
  var sel = null, g = [], sp = speech(step.say), lock = lockBtn();
  var pile = h('div', {class:'pile'}), bay = h('div', {class:'bay'}), read = h('div', {class:'amt'}, '');
  if (step.ruler) [[10, '1 cm'], [50, '5 cm'], [100, '10 cm']].forEach(function(t){ bay.append(h('div', {class:'tick', style:'bottom:' + Math.round(t[0] / step.mmPerPx) + 'px'}, h('span', {}, t[1]))); });
  if (step.ref) {
    bay.append(h('div', {class:'refline', style:'bottom:200px'}));
    var ro = h('div', {class:'refobj'}, h('span', {class:'reflabel'}, step.ref === 'door' ? 'Door, 2 m' : 'Building, 60 m')); ro.insertAdjacentHTML('beforeend', refSVG(step.ref)); bay.append(ro);
  }
  bay.append(pile);
  function run(n){
    var i = 0; (function next(){
      var mm = 0.1 * Math.pow(2, i);
      pile.style.height = Math.min(Math.max(mm / step.mmPerPx, 3), 232) + 'px'; read.textContent = i + ' folds: ' + fmtLen(mm);
      if (i >= n) { setSay(sp, 'That is the pile after ' + n + ' folds.', 'good'); burst(bay); return; }
      i++; setTimeout(next, n > 14 ? 220 : 380);
    })();
  }
  host.append(sp);
  if (step.demo) {
    var nf = 0, xs = h('div', {class:'xsec', role:'img', 'aria-label':'Side view of the folded paper, layer by layer'}), lab = h('div', {class:'small muted', 'aria-live':'polite'});
    var fold = h('button', {class:'btn ghost small'}, 'Fold it'), unfold = h('button', {class:'btn ghost small'}, 'Unfold');
    function dd(){ xs.replaceChildren(); for (var i = 0; i < Math.pow(2, nf); i++) xs.append(h('i', {})); lab.textContent = 'Folds: ' + nf + '   Layers: ' + Math.pow(2, nf); fold.disabled = nf >= 3; unfold.disabled = nf <= 0; }
    fold.addEventListener('click', function(){ if (nf < 3 && !api.locked) { nf++; dd(); } }); unfold.addEventListener('click', function(){ if (nf > 0 && !api.locked) { nf--; dd(); } });
    host.append(h('div', {class:'demo'}, h('div', {class:'small muted'}, 'Practice sheet: try a few folds to see how the layers pile up.'), xs, lab, h('div', {class:'row'}, fold, unfold))); dd();
  }
  host.append(bay, read);
  if (step.mode === 'pick') {
    var list = h('div', {class:'opts'});
    step.opts.forEach(function(t, i){
      var b = h('button', {class:'opt pick'}, h('span', {html:iconSVG(step.optIcons[i])}), h('span', {}, t)); g.push({el:b});
      b.addEventListener('click', function(){ if (api.locked) return; g.forEach(function(x){ x.el.classList.remove('sel'); }); b.classList.add('sel'); sel = i; lock.disabled = false; }); list.append(b);
    });
    lock.addEventListener('click', function(){ if (api.locked || sel === null) return; api.submit('p' + sel, 9500); lock.disabled = true; list.querySelectorAll('button').forEach(function(x){ x.disabled = true; }); setSay(sp, 'Watch what happens to your pile...', ''); run(10); });
    host.append(list, lock);
  } else {
    var inp = h('input', {class:'field', id:'folds', inputmode:'numeric', autocomplete:'off', maxlength:'3', 'aria-label':'Number of folds'});
    inp.addEventListener('input', function(){ lock.disabled = !/^\d{1,3}$/.test(inp.value.trim()) || +inp.value < 1; });
    lock.addEventListener('click', function(){
      if (api.locked) return; var n = +inp.value.trim(); if (!(n >= 1)) return;
      api.submit('n' + n, 4500 + Math.min(n, 30) * 250); lock.disabled = true; inp.disabled = true; setSay(sp, 'Watch what happens to your pile...', ''); run(Math.min(n, 30));
    });
    host.append(h('label', {for:'folds', class:'small muted'}, 'My answer: number of folds'), inp, lock);
  }
}
var AORDER = [];
var ORDER = ['p1','p2','p3'];
var ALLIDS = ORDER.concat(AORDER);

/* ---------- Helpers ---------- */
var root = document.getElementById('app');
function $(s,r){ return (r||document).querySelector(s); }
function h(tag, attrs){
  var e = document.createElement(tag);
  if (attrs) Object.keys(attrs).forEach(function(k){
    var v = attrs[k]; if (v == null || v === false) return;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.slice(0,2) === 'on') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  });
  for (var i = 2; i < arguments.length; i++) {
    var c = arguments[i];
    (Array.isArray(c) ? c : [c]).forEach(function(x){ if (x == null || x === false) return; e.append(x.nodeType ? x : document.createTextNode(String(x))); });
  }
  return e;
}
function fmt(ms){ ms = Math.max(0, Math.round(ms/1000)); var m = Math.floor(ms/60), s = ms % 60; return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s; }
function hashStr(s){ var x = 2166136261; for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function order(n, seedStr){ var a = []; for (var i = 0; i < n; i++) a.push(i); var r = rng(hashStr(seedStr)); for (var j = n - 1; j > 0; j--) { var k = Math.floor(r() * (j + 1)); var t = a[j]; a[j] = a[k]; a[k] = t; } return a; }
function parseNum(s){
  s = String(s).trim().replace(/−/g,'-').replace(/,/g,'').replace(/\s+/g,'');
  if (!s) return NaN;
  if (/^-?\d*\.?\d+\/\d*\.?\d+$/.test(s)) { var p = s.split('/'); return Number(p[0]) / Number(p[1]); }
  if (!/^-?\d*\.?\d+$/.test(s)) return NaN;
  return Number(s);
}
function evalAns(step, a){
  if (a === 'skip') return {kind:'skip'};
  if (step.type === 'pick') {
    var o = step.options[+String(a).slice(1)];
    if (!o) return {kind:'bad'};
    return o.ok ? {kind:'ok', label:o.note || ''} : {kind:'wrong', label:o.tag};
  }
  if (step.type === 'game') {
    var g = step.judge(String(a));
    return g.ok ? {kind:'ok', label:g.note || ''} : {kind:'wrong', label:g.tag || null};
  }
  if (step.type === 'number') {
    var v = parseNum(a); if (isNaN(v)) return {kind:'bad'};
    var tol = step.tol || 1e-9;
    if (step.ans.some(function(x){ return Math.abs(v - x) <= tol; })) return {kind:'ok', label:''};
    var w = step.wrong.filter(function(w){ return Math.abs(v - w.v) <= tol; })[0];
    return {kind:'wrong', label:w ? w.tag : null};
  }
  return {kind:'text'};
}
function stripHtml(s){ var d = document.createElement('div'); d.innerHTML = s; return d.textContent; }
function sleep(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
function withTimeout(p, ms){ return Promise.race([Promise.resolve(p).catch(function(){ return null; }), sleep(ms).then(function(){ return undefined; })]); }
function flash(btn, text){ var old = btn.dataset.label || btn.textContent; btn.dataset.label = old; btn.textContent = text; setTimeout(function(){ btn.textContent = old; }, 1600); }
function copyText(text, btn, ta){
  var p = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(text) : Promise.reject();
  p.then(function(){ flash(btn, 'Copied'); }).catch(function(){ if (ta) { ta.focus(); ta.select(); } flash(btn, 'Now select and copy'); });
}

/* ---------- State ---------- */
var S = {teacher:false, preview:false, previewTok:null, db:null, user:null, uid:null, canWrite:null,
  liveState:'idle', ref:null, docData:null, att:null, imp:null, tab:'class', fp:'all', open:new Set(), subbed:false};
var L = null;           // learner run
var T = {};             // timers

function clearTimers(){ Object.keys(T).forEach(function(k){ clearInterval(T[k]); }); T = {}; }

/* ---------- Results sheet (optional): sends each finished run to a Google Form ---------- */
/* The Google Form link lives in config.js, so replacing the engine never erases it. */
var RESULTS_FORM = (window.SF_CONFIG && window.SF_CONFIG.RESULTS_FORM) || '';
function sheetCfg(){
  if (!RESULTS_FORM) return null;
  try {
    var u = new URL(RESULTS_FORM), map = {};
    u.searchParams.forEach(function(v, k){ var w = String(v).toUpperCase(); if (/^entry\.\d+$/.test(k) && /^(LEARNER|GROUP|ADVENTURE|SUMMARY|CODE)$/.test(w)) map[w] = k; });
    if (!map.CODE && !map.LEARNER) return null;
    return {url: u.origin + u.pathname.replace(/\/viewform$/, '/formResponse'), map: map};
  } catch(e) { return null; }
}
function groupTag(){ try { return (new URLSearchParams(location.search).get('g') || '').slice(0, 30); } catch(e) { return ''; } }
function runSummary(run){
  var per = analyse({p:run.p, ev:run.ev}), n = 0, out = [];
  per.forEach(function(st){
    if (st.step.type === 'text') return; n++;
    var r = st.evs[0] ? st.evs[0].r : null, txt;
    if (!r) txt = 'not reached';
    else if (r.kind === 'ok') txt = 'right';
    else if (r.kind === 'skip') txt = 'not sure';
    else if (r.kind === 'wrong') txt = 'wrong' + (r.label ? ': ' + r.label : '');
    else txt = 'unreadable';
    out.push('L' + n + ' ' + txt);
  });
  return out.join(' | ');
}
function sheetBody(run, cfg, test){
  var P = run ? PUZZLES[run.p] : null, vals = {
    LEARNER: test ? 'TEST' : run.name, GROUP: groupTag(),
    ADVENTURE: test ? 'Sheet check' : P.title + ' (' + run.p + ')',
    SUMMARY: test ? 'Test row from the sheet check. Safe to delete.' : runSummary(run) + ' | minutes: ' + Math.max(1, Math.round(((run.end || Date.now()) - run.t0) / 60000)),
    CODE: test ? '' : makeCode()
  }, b = new URLSearchParams();
  Object.keys(cfg.map).forEach(function(k){ b.append(cfg.map[k], String(vals[k]).slice(0, 4000)); });
  return b.toString();
}
function sheetPost(url, body){ return fetch(url, {method:'POST', mode:'no-cors', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:body}); }
function lsGet(k){ try { var a = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(a) ? a : []; } catch(e) { return []; } }
function lsSet(k, a){ try { localStorage.setItem(k, JSON.stringify(a)); } catch(e) {} }
function markSent(id){ var a = lsGet('sf1.sent'); if (a.indexOf(id) < 0) a.push(id); lsSet('sf1.sent', a.slice(-60)); }
async function sendSheet(){
  var cfg = sheetCfg(); if (!cfg || !L || L.test) return;
  if (lsGet('sf1.sent').indexOf(L.id) >= 0) { S.sheetState = 'sent'; updateBadge(); return; }
  S.sheetState = 'sending';
  var item = {id:L.id, url:cfg.url, body:sheetBody(L, cfg, false)};
  try { await sheetPost(item.url, item.body); S.sheetState = 'sent'; markSent(item.id); }
  catch(e) { S.sheetState = 'queued'; var q = lsGet('sf1.outbox'); if (!q.some(function(x){ return x.id === item.id; })) q.push(item); lsSet('sf1.outbox', q); }
  updateBadge();
}
async function flushOutbox(){
  var q = lsGet('sf1.outbox'); if (!q.length) return; var keep = [];
  for (var i = 0; i < q.length; i++) { try { await sheetPost(q[i].url, q[i].body); markSent(q[i].id); } catch(e) { keep.push(q[i]); } }
  lsSet('sf1.outbox', keep);
}
window.addEventListener('online', function(){ flushOutbox(); });
function drawSheetTest(){
  var cfg = sheetCfg(), msg = h('p', {class:'fb', role:'status'}, ''), want = ['LEARNER', 'GROUP', 'ADVENTURE', 'SUMMARY', 'CODE'];
  var missing = cfg ? want.filter(function(k){ return !cfg.map[k]; }) : want;
  var btn = h('button', {class:'btn', onclick:async function(){
    if (!cfg) return; btn.disabled = true; msg.textContent = 'Sending...';
    try { await sheetPost(cfg.url, sheetBody(null, cfg, true)); msg.textContent = 'Sent from this address. Open your Google Sheet and look for a row named TEST. If nothing appears within a minute, the Form link in this file is wrong, or the Form is not open to everyone.'; }
    catch(e) { msg.textContent = 'Could not send from here. Either there is no internet, or this web host blocks sending data out. Use a different host for the game (GitHub Pages works).'; }
    btn.disabled = false;
  }}, 'Send a test row');
  root.replaceChildren(h('div', {class:'card'}, h('div', {class:'eyebrow'}, 'Teacher check'), h('h1', {}, 'Results sheet check'),
    cfg ? h('p', {}, 'This copy is connected to a Google Form. Fields found: ' + Object.keys(cfg.map).join(', ') + '.' + (missing.length ? ' Missing: ' + missing.join(', ') + '.' : ' All five fields are connected.'))
        : h('p', {}, 'This copy is not connected to a Google Form. Results only come back as backup codes.'),
    cfg ? btn : null, msg, h('p', {class:'small muted'}, 'Group tag in this link: ' + (groupTag() || 'none') + '. Add one with ?g=NAME before the # in the link.')));
}

/* ---------- Boot and routing ---------- */
function parseToken(){
  if (window.SF_GAME && PUZZLES[window.SF_GAME]) return {p:window.SF_GAME, m:45};
  var a = /^#?(a\d+)$/.exec(location.hash || '');
  if (a && PUZZLES[a[1]] && PUZZLES[a[1]].adventure) return {p:a[1], m:45};
  var m = /^#?(p\d+)-(\d{1,2})$/.exec(location.hash || '');
  if (!m || !PUZZLES[m[1]] || PUZZLES[m[1]].adventure) return null;
  return {p:m[1], m:Math.min(12, Math.max(5, +m[2]))};
}
async function boot(){
  flushOutbox();
  root.replaceChildren(h('p', {class:'muted'}, 'Loading...'));
  var hasC = !!(window.claude && window.claude.use);
  var res = await Promise.all([hasC ? withTimeout(window.claude.use('user'), 4000) : null, hasC ? withTimeout(window.claude.use('db'), 4000) : null]);
  S.user = res[0] || null; S.db = res[1] || null;
  if (S.user) {
    try { S.teacher = !!((await S.user.canEdit()) || (await S.user.isOwner())); } catch(e) {}
    try { S.uid = await S.user.id(); } catch(e) {}
    try { S.canWrite = await S.user.can('data.write'); } catch(e) {}
  }
  /* Standalone copy (no platform database): the teacher opens the link ending #teacher, and imported results stay on this phone. */
  if (!S.db) {
    if (/^#teacher/.test(location.hash || '') || window.SF_TEACHER) S.teacher = true;
    S.att = []; S.imp = loadLocalImp();
  }
  route();
}
function loadLocalImp(){ try { var a = JSON.parse(localStorage.getItem('sf1.imp') || '[]'); return Array.isArray(a) ? a : []; } catch(e) { return []; } }
function saveLocalImp(){ try { localStorage.setItem('sf1.imp', JSON.stringify(S.imp)); } catch(e) {} }
function route(){
  clearTimers();
  if (/^#sheettest/.test(location.hash || '')) { drawSheetTest(); return; }
  if (S.teacher && !S.preview) drawTeacher(); else renderLearner();
}
window.addEventListener('hashchange', function(){ if (!L || L.phase !== 'play') route(); });

/* ---------- Learner ---------- */
function loadSaved(){ try { return JSON.parse(localStorage.getItem('sf1.run') || 'null'); } catch(e) { return null; } }
function persist(){
  try { localStorage.setItem('sf1.run', JSON.stringify({p:L.p, m:L.m, n:L.name, id:L.id, t0:L.t0, ev:L.ev, si:L.si, end:L.end, r:L.r, test:L.test})); } catch(e) {}
}
function learnerShell(){
  var kids = [];
  if (S.preview) kids.push(h('div', {class:'row'}, h('span', {class:'chip warn'}, 'Test mode: you are acting as a learner'),
    h('button', {class:'btn ghost small', onclick:function(){ S.preview = false; S.previewTok = null; L = null; try { localStorage.removeItem('sf1.run'); } catch(e) {} route(); }}, 'Back to teacher console')));
  return kids;
}
function menuKind(){ if (window.SF_GAME) return null; var x = location.hash || ''; return x === '#menu' ? 'menu' : x === '#adventures' ? 'adv' : null; }
function isMenu(){ return !!menuKind(); }
function tokFor(id){ var P = PUZZLES[id]; return {p:id, m:P.adventure ? 45 : P.minutes}; }
function pickButtons(ids, onPick){ return ids.map(function(id){ var P = PUZZLES[id]; return h('button', {class:'btn ghost', onclick:function(){ onPick(id); }}, P.title + (P.adventure ? ' (no timer)' : ' (' + P.minutes + ' min)')); }); }
function renderLearner(){
  var tok = parseToken() || (S.preview ? S.previewTok : null) || (isMenu() ? S.menuTok : null);
  var saved = loadSaved();
  if (!tok && !S.preview && isMenu() && saved && PUZZLES[saved.p] && !saved.end && Date.now() < saved.t0 + saved.m * 60000) tok = {p:saved.p, m:saved.m};
  if (!S.preview && saved && tok && saved.p === tok.p && saved.m === tok.m && !saved.end && Date.now() < saved.t0 + saved.m * 60000) {
    L = {p:saved.p, m:saved.m, name:saved.n, id:saved.id, t0:saved.t0, ev:saved.ev || [], si:saved.si || 0, end:null, r:saved.r || '', test:!!saved.test, phase:'play'};
    S.liveState = 'idle'; setupLive(); drawPlay(); startTicker(); return;
  }
  if (!tok) {
    if (S.preview || isMenu()) {
      var mk = menuKind(), pick = function(id){ if (S.preview) S.previewTok = tokFor(id); else S.menuTok = tokFor(id); renderLearner(); };
      var cards = [];
      if (S.preview || mk === 'menu') cards.push(h('div', {class:'card'}, h('h2', {}, S.preview ? 'Puzzles to try' : 'Puzzles'),
        h('p', {class:'small muted'}, 'Each puzzle has a timer. Some steps are hard on purpose.'), pickButtons(ORDER, pick)));
      if (S.preview || mk === 'menu' || mk === 'adv') cards.push(h('div', {class:'card'}, h('h2', {}, 'Adventures'),
        h('p', {class:'small muted'}, 'No timer. Take your time and play with it.'), pickButtons(AORDER, pick)));
      root.replaceChildren.apply(root, learnerShell().concat(cards));
      return;
    }
    root.replaceChildren(h('div', {class:'card'}, h('div', {class:'eyebrow'}, 'Struggle First'), h('h2', {}, 'No lesson link yet'),
      h('p', {}, 'Ask your teacher for your lesson link. It ends with a code like #p1-10.')));
    return;
  }
  drawJoin(tok);
}
function drawJoin(tok){
  var P = PUZZLES[tok.p];
  var nm = h('input', {class:'field', id:'nm', maxlength:'20', autocomplete:'off', placeholder:'First name only', 'aria-label':'Your first name', style:'font-family:var(--f-body);font-size:19px'});
  if (S.preview) nm.value = 'Test';
  var err = h('div', {class:'fb bad', role:'status'});
  var go = function(){
    var name = nm.value.trim().slice(0,20);
    if (!name) { err.textContent = 'Type your first name to start.'; nm.focus(); return; }
    L = {p:tok.p, m:tok.m, name:name, id:'r' + Date.now().toString(36), t0:Date.now(), ev:[], si:0, end:null, r:'', test:S.preview, phase:'play'};
    S.liveState = 'idle'; persist(); setupLive(); drawPlay(); startTicker();
  };
  nm.addEventListener('keydown', function(e){ if (e.key === 'Enter') go(); });
  root.replaceChildren.apply(root, learnerShell().concat([
    h('div', {class:'card'},
      h('div', {class:'eyebrow'}, P.adventure ? 'Adventure' : 'Before your lesson'),
      h('h1', {}, P.title),
      P.adventure ? h('p', {}, 'There is ', h('b', {}, 'no timer'), '. Take your time and play with it. Some parts are tricky on purpose, and a wrong answer is fine. You can change your mind until you lock an answer in. After that it is final, so think first. Your teacher will talk about it after.')
        : h('p', {}, 'You have ', h('b', {}, tok.m + ' minutes'), '. Some steps are hard on purpose. A wrong answer helps your teacher, so do not be afraid of it. You can change your mind until you lock an answer in. After that it is final, so think first. Your teacher will teach the lesson after this.'),
      h('label', {for:'nm', class:'small muted'}, 'Your first name'), nm, err,
      h('button', {class:'btn', onclick:go}, P.adventure ? 'Play' : 'Start'),
      h('p', {class:'small muted'}, 'Use your first name only. Your teacher can see your answers and how long each step took.' + (sheetCfg() ? ' When you finish, your first name and answers are sent to your teacher.' : '')))
  ]));
}
function badge(){ return h('span', {id:'badge', class:'chip mute'}, 'Offline mode'); }
function updateBadge(){
  var b = $('#badge');
  if (b) { var ok = S.liveState === 'ok'; b.textContent = ok ? 'Live to teacher' : (sheetCfg() ? 'Sends when you finish' : (S.liveState === 'idle' ? 'Connecting' : 'Offline mode')); b.className = 'chip ' + (ok ? 'ok' : 'mute'); }
  var st = $('#live-status');
  if (st) st.textContent = S.liveState === 'ok' ? 'Your work has reached your teacher.' : (sheetCfg() ? (S.sheetState === 'sent' ? 'Your answers were sent to your teacher. If your teacher says they did not arrive, open the backup code below and send it on WhatsApp.' : S.sheetState === 'queued' ? 'There is no internet right now. Your answers will send when you are online again, if you open this link again. You can also send the backup code below on WhatsApp.' : S.sheetState === 'sending' ? 'Sending your answers...' : '') : 'Your teacher cannot see your work yet. Copy the code below and send it to your teacher on WhatsApp.');
  var d = $('#code-details'); if (d && S.liveState !== 'idle') d.open = sheetCfg() ? (S.sheetState !== 'sent') : S.liveState !== 'ok';
}
function drawGame(P, step){
  if (L.si === 0 && !L.storyDone && !L.ev.length) {
    var ill = h('div', {class:'story-ill'}); ill.innerHTML = artSVG(P.icon || 'garri', 64);
    root.replaceChildren.apply(root, learnerShell().concat([h('div', {class:'card'}, ill, h('div', {class:'eyebrow'}, 'Adventure'), h('h1', {}, P.title), h('p', {html:P.intro}),
      h('ul', {class:'facts-list'}, (P.facts || []).map(function(f){ return h('li', {}, f); })),
      h('p', {class:'small muted'}, 'There is no timer. You can change your mind until you press I am sure. After that it is final.'),
      h('button', {class:'btn', onclick:function(){ L.storyDone = true; drawGame(P, step); }}, 'Begin'))]));
    return;
  }
  var games = P.steps.filter(function(x){ return x.type !== 'text'; }).length;
  var doneN = P.steps.filter(function(x, i){ return x.type !== 'text' && i < L.si; }).length;
  var pills = h('div', {class:'pills', role:'img', 'aria-label':'Levels'});
  P.steps.forEach(function(x, i){
    if (x.type === 'text') return;
    pills.append(h('span', {class:'pill' + (i === L.si ? ' cur' : '') + (i < L.si ? ' done' : '')}, h('b', {}, String(i + 1)), h('i', {}, i < L.si ? '✓' : '')));
  });
  var hud = h('div', {class:'hud'}, h('div', {}, h('div', {class:'eyebrow'}, P.title), h('div', {class:'small muted'}, step.type === 'text' ? 'Last thing' : (P.unit || 'Level') + ' ' + (P.steps.slice(0, L.si + 1).filter(function(x){ return x.type !== 'text'; }).length) + ' of ' + games + ': ' + step.title)), h('div', {class:'score', 'aria-label':'Coins'}, '● ' + doneN));
  if (step.type === 'game') {
    var host = h('div', {class:'game'});
    var unsure = h('button', {class:'btn ghost small', onclick:function(){ if (gapi.locked) return; gapi.locked = true; unsure.disabled = true; record(L.si, 'skip'); var si = L.si; setTimeout(function(){ advance(si); }, 400); }}, 'I am not sure');
    var gapi = {locked:false, submit:function(a, hold){
      if (gapi.locked) return; gapi.locked = true; unsure.disabled = true;
      var si = L.si; record(si, a); setTimeout(function(){ advance(si); }, hold || 2200);
    }};
    root.replaceChildren.apply(root, learnerShell().concat([hud, pills, h('div', {class:'facts'}, (step.facts || P.facts || []).map(function(f){ return h('span', {class:'fact'}, f); })), h('div', {class:'card'}, host, unsure)]));
    step.build(host, gapi, step);
  } else {
    var ta = h('textarea', {class:'field', id:'refl', maxlength:'300', 'aria-label':'Your note'}); ta.value = L.r || '';
    root.replaceChildren.apply(root, learnerShell().concat([hud, pills, h('div', {class:'card'}, h('h2', {}, 'You made it to the end'), h('p', {}, P.outro || ''), h('p', {html:step.prompt}), ta, h('button', {class:'btn', onclick:function(){ L.r = ta.value.slice(0,300); finish('done'); }}, 'Finish'))]));
  }
}
function drawPlay(){
  var P = PUZZLES[L.p], step = P.steps[L.si];
  L.phase = 'play';
  if (step.type !== 'text' && L.ev.some(function(e){ return e[0] === L.si; })) { advance(L.si); return; }
  if (P.adventure) { drawGame(P, step); return; }
  var scored = P.steps.filter(function(s){ return s.type !== 'text'; }).length;
  var fb = h('div', {class:'fb', id:'fb', role:'status', 'aria-live':'polite'});
  var head = h('div', {class:'card'},
    h('div', {class:'top'},
      h('div', {}, h('div', {class:'eyebrow'}, P.title), h('div', {class:'small muted'}, step.type === 'text' ? 'Last thing' : 'Step ' + (L.si + 1) + ' of ' + scored), h('div', {style:'margin-top:6px'}, badge())),
      h('div', {class:'timer', id:'timer', 'aria-label':'Time left'}, fmt(L.t0 + L.m * 60000 - Date.now()))),
    h('div', {class:'bar', id:'bar'}, h('i', {})));
  var ctx = h('div', {class:'card ruled', html:P.intro});
  var q = h('div', {class:'card'}, h('div', {style:'font-size:19px', html:step.prompt}));
  var locked = false;
  function lockIn(a, btns){ if (locked) return; locked = true; var si = L.si; record(si, a); setFb('Locked in.', 'good'); btns.forEach(function(b){ b.disabled = true; }); setTimeout(function(){ advance(si); }, 700); }
  if (step.type === 'number') {
    var inp = h('input', {class:'field', id:'ans', inputmode:'decimal', autocomplete:'off', maxlength:'20', 'aria-label':'Your answer'});
    var lk = h('button', {class:'btn', onclick:function(){
      var v = inp.value.trim(); if (!v) { setFb('Type your answer first.', 'warn'); return; }
      if (isNaN(parseNum(v))) { setFb('Type a number, for example 8 or 1/2.', 'warn'); return; }
      inp.disabled = true; lockIn(v.slice(0,20), [lk, ns]);
    }}, 'Lock in my answer');
    var ns = h('button', {class:'btn ghost small', onclick:function(){ inp.disabled = true; lockIn('skip', [lk, ns]); }}, 'I am not sure');
    q.append(h('p', {class:'small muted'}, 'You can change your answer until you lock it in. After that it is final.'), inp, lk, fb, ns);
  } else if (step.type === 'pick') {
    var ord = order(step.options.length, L.id + ':' + L.si), list = h('div', {class:'opts'}), chosen = null, btns = [];
    var lk2 = h('button', {class:'btn', disabled:true, onclick:function(){ if (chosen == null) return; btns.forEach(function(x){ x.disabled = true; }); lockIn(chosen, [lk2, ns2]); }}, 'Lock in my answer');
    var ns2 = h('button', {class:'btn ghost small', onclick:function(){ btns.forEach(function(x){ x.disabled = true; }); lockIn('skip', [lk2, ns2]); }}, 'I am not sure');
    ord.forEach(function(oi){
      var o = step.options[oi], key = 'o' + oi;
      var b = h('button', {class:'opt', html:o.t});
      b.addEventListener('click', function(){ if (locked) return; btns.forEach(function(x){ x.classList.remove('sel'); }); b.classList.add('sel'); chosen = key; lk2.disabled = false; });
      btns.push(b); list.append(b);
    });
    q.append(h('p', {class:'small muted'}, 'You can change your choice until you lock it in. After that it is final.'), list, lk2, fb, ns2);
  } else {
    var ta = h('textarea', {class:'field', id:'refl', maxlength:'300', 'aria-label':'Your answer'});
    ta.value = L.r || '';
    q.append(ta, h('button', {class:'btn', onclick:function(){ L.r = ta.value.slice(0,300); finish('done'); }}, 'Finish'));
  }
  root.replaceChildren.apply(root, learnerShell().concat([head, ctx, q]));
  updateBadge(); tick();
  function setFb(t, c){ fb.textContent = t; fb.className = 'fb ' + c; }
}
function record(si, a){ L.ev.push([si, a, Date.now() - L.t0]); persist(); pushLive(); }
function advance(si){
  if (!L || L.phase !== 'play' || L.si !== si) return;
  L.si++; persist(); pushLive();
  if (L.si >= PUZZLES[L.p].steps.length) finish('done'); else drawPlay();
}
function startTicker(){ clearInterval(T.tick); T.tick = setInterval(tick, 250); }
function tick(){
  if (!L || L.phase !== 'play') return;
  if (PUZZLES[L.p].adventure) return;
  var left = L.t0 + L.m * 60000 - Date.now();
  if (left <= 0) { finish('timeout'); return; }
  var el = $('#timer'); if (el) { el.textContent = fmt(left); el.classList.toggle('low', left < 60000); }
  var bar = $('#bar>i'); if (bar) bar.style.width = (100 * left / (L.m * 60000)) + '%';
}
function finish(reason){
  if (!L || L.phase === 'done') return;
  var ta = $('#refl'); if (ta) L.r = ta.value.slice(0,300);
  L.phase = 'done'; L.end = Date.now(); L.reason = reason;
  clearInterval(T.tick); persist(); pushLive(); sendSheet(); drawDone();
}
function makeCode(){
  var o = {v:1, p:L.p, m:L.m, n:L.name, t0:L.t0, end:L.end || null, ev:L.ev, r:L.r || ''};
  return 'SF1.' + btoa(unescape(encodeURIComponent(JSON.stringify(o))));
}
function nextGame(){
  try {
    var q = new URLSearchParams(location.search);
    if (q.get('next') !== '1' || !window.SF_GAME || !Array.isArray(window.CATALOG)) return null;
    var C = window.CATALOG, cur = null; C.forEach(function(e){ if (e.id === window.SF_GAME) cur = e; });
    if (!cur) return null;
    var sib = C.filter(function(e){ return e.class === cur.class && e.subject === cur.subject && e.topic === cur.topic; }).sort(function(a, b){ return (a.order || 0) - (b.order || 0); });
    var j = -1; sib.forEach(function(e, k){ if (e.id === cur.id) j = k; });
    var n = sib[j + 1]; if (!n) return null;
    q.set('game', n.id); return {title:n.title, href:'play.html?' + q.toString()};
  } catch(e) { return null; }
}
function drawDone(){
  var code = makeCode();
  var ta = h('textarea', {class:'code', readonly:true, 'aria-label':'Result code'}); ta.value = code;
  var cb = h('button', {class:'btn ghost small', onclick:function(){ copyText(code, cb, ta); }}, 'Copy code');
  root.replaceChildren.apply(root, learnerShell().concat([h('div', {class:'card'},
    h('div', {class:'eyebrow'}, PUZZLES[L.p].title),
    h('h1', {}, PUZZLES[L.p].adventure ? 'Adventure complete' : (L.reason === 'timeout' ? 'Time is up' : 'You are done')),
    (function(){ var nx = nextGame(); return nx ? h('div', {}, h('p', {}, 'Ready for the next one when you are.'), h('a', {class:'btn', href:nx.href}, 'Next: ' + nx.title)) : h('p', {}, 'Stop here. Your teacher will start the lesson from what you just did.'); })(),
    h('p', {id:'live-status', class:'fb'}, ''),
    h('details', {id:'code-details', class:'plain'}, h('summary', {}, 'Backup code for your teacher'), h('div', {style:'display:flex;flex-direction:column;gap:8px;margin-top:8px'}, ta, cb)),
    (isMenu() && !S.preview) ? h('button', {class:'btn ghost', onclick:function(){ L = null; S.menuTok = null; S.liveState = 'idle'; try { localStorage.removeItem('sf1.run'); } catch(e) {} renderLearner(); }}, 'Choose another puzzle') : null
  )]));
  updateBadge();
}

/* ---------- Live sending (only when the viewer is allowed to write) ---------- */
var writing = false, dirty = false;
async function setupLive(){
  if (!S.db || !S.uid || S.canWrite === false) { S.liveState = 'off'; updateBadge(); return; }
  try {
    S.ref = S.db.collection('attempts').doc(S.uid);
    var snap = await S.ref.get();
    S.docData = snap.exists ? JSON.parse(JSON.stringify(snap.data())) : {runs:{}};
    if (!S.docData.runs || typeof S.docData.runs !== 'object') S.docData.runs = {};
    S.liveReady = true;
    pushLive();
  } catch(e) { S.liveState = 'off'; updateBadge(); }
}
async function pushLive(){
  if (!S.liveReady || !L) return;
  if (writing) { dirty = true; return; }
  writing = true;
  try {
    do {
      dirty = false;
      S.docData.name = L.name;
      S.docData.runs[L.id] = {p:L.p, m:L.m, t0:L.t0, end:L.end || null, ev:L.ev, r:L.r || '', test:!!L.test};
      await S.ref.set(S.docData);
      S.liveState = 'ok';
    } while (dirty);
  } catch(e) { S.liveState = 'off'; S.liveReady = false; }
  writing = false; updateBadge();
}

/* ---------- Analysis (same code for live, imported and review) ---------- */
function sanRun(o){
  if (!o || typeof o !== 'object') return null;
  var P = PUZZLES[o.p]; if (!P) return null;
  var m = Math.round(+o.m); if (!(P.adventure ? m === 45 : (m >= 5 && m <= 12))) return null;
  var t0 = +o.t0; if (!isFinite(t0)) return null;
  if (!Array.isArray(o.ev) || o.ev.length > 300) return null;
  var ev = [];
  for (var i = 0; i < o.ev.length; i++) {
    var e = o.ev[i]; if (!Array.isArray(e)) return null;
    if (!Number.isInteger(e[0]) || e[0] < 0 || e[0] >= P.steps.length) return null;
    ev.push([e[0], String(e[1]).slice(0,24), Math.max(0, Math.min(1e8, +e[2] || 0))]);
  }
  var end = o.end == null ? null : +o.end;
  return {p:o.p, m:m, t0:t0, end:isFinite(end) ? end : null, ev:ev, r:String(o.r || '').slice(0,300), test:!!o.test};
}
function analyse(run){
  var P = PUZZLES[run.p];
  var per = P.steps.map(function(s,i){ return {step:s, i:i, evs:[], state:'none', tries:0}; });
  run.ev.forEach(function(e){ var st = per[e[0]]; if (!st || st.step.type === 'text') return; st.evs.push({a:e[1], ms:e[2], r:evalAns(st.step, e[1])}); });
  per.forEach(function(st){
    var okI = -1; st.evs.forEach(function(e,i){ if (okI < 0 && e.r.kind === 'ok') okI = i; });
    var wrongs = st.evs.filter(function(e){ return e.r.kind === 'wrong'; }).length;
    if (okI >= 0) { st.state = wrongs ? 'retry' : 'first'; st.tries = okI + 1; }
    else if (st.evs.some(function(e){ return e.r.kind === 'skip'; })) st.state = 'skip';
    else if (wrongs) st.state = 'wrong';
  });
  return per;
}
function snags(per){
  var c = {};
  per.forEach(function(st){ st.evs.forEach(function(e){ if (e.r.kind === 'wrong' && e.r.label) c[e.r.label] = (c[e.r.label] || 0) + 1; }); });
  return Object.keys(c).sort(function(a,b){ return c[b] - c[a]; });
}

/* ---------- Teacher console ---------- */
function drawTeacher(){
  var head = h('div', {class:'brand'}, h('div', {}, h('div', {class:'eyebrow'}, 'Teacher console'), h('b', {}, 'Struggle First')),
    h('button', {class:'btn ghost small', onclick:function(){ S.preview = true; S.previewTok = null; route(); }}, 'Try as learner'));
  var tabs = h('div', {class:'tabs', role:'group', 'aria-label':'Sections'},
    h('button', {class:'tab', id:'tab-class', onclick:function(){ S.tab = 'class'; showTab(); }}, 'Class'),
    h('button', {class:'tab', id:'tab-puz', onclick:function(){ S.tab = 'puz'; showTab(); }}, 'Puzzles'));
  root.replaceChildren(head, tabs, h('div', {id:'tabBody', class:'wrap', style:'padding:0'}));
  showTab(); subscribe();
  T.left = setInterval(updateLeft, 1000);
}
function showTab(){
  $('#tab-class').setAttribute('aria-pressed', S.tab === 'class'); $('#tab-puz').setAttribute('aria-pressed', S.tab === 'puz');
  var b = $('#tabBody'); b.replaceChildren();
  if (S.tab === 'class') { b.append(classShell()); renderClass(); } else b.append.apply(b, puzzlesTab());
}
function subscribe(){
  if (S.subbed || !S.db) return; S.subbed = true;
  try {
    S.db.collection('attempts').onSnapshot(function(s){ S.att = s.docs.map(function(d){ return {id:d.id, data:d.data()}; }); renderClass(); }, function(){ S.att = []; renderClass(); });
    S.db.collection('imports').onSnapshot(function(s){ S.imp = s.docs.map(function(d){ return {id:d.id, data:d.data()}; }); renderClass(); }, function(){ S.imp = []; renderClass(); });
  } catch(e) {}
}
function items(){
  var out = [];
  (S.att || []).forEach(function(d){
    var runs = (d.data && d.data.runs) || {};
    Object.keys(runs).forEach(function(k){
      var r = sanRun(runs[k]); if (!r) return;
      r.key = 'a/' + d.id + '/' + k; r.src = 'live'; r.docId = d.id; r.runId = k; r.name = String(d.data.name || '?').slice(0,24); out.push(r);
    });
  });
  (S.imp || []).forEach(function(d){
    var r = sanRun(d.data); if (!r) return;
    r.key = 'i/' + d.id; r.src = 'import'; r.docId = d.id; r.name = String(d.data.name || '?').slice(0,24); out.push(r);
  });
  out.sort(function(a,b){ return b.t0 - a.t0; });
  return out;
}
function classShell(){
  var chips = h('div', {class:'chips'});
  [['all','All']].concat(ALLIDS.map(function(id){ return [id, PUZZLES[id].title]; })).forEach(function(p){
    chips.append(h('button', {class:'tab', style:'flex:none;padding:0 14px', 'aria-pressed':String(S.fp === p[0]), onclick:function(){ S.fp = p[0]; showTab(); }}, p[1]));
  });
  var codeIn = h('textarea', {class:'code', id:'impIn', placeholder:'Paste one or more result codes that start with SF1.', 'aria-label':'Result codes to import'});
  var msg = h('div', {class:'fb', id:'impMsg', role:'status'});
  var imp = h('details', {class:'plain card'}, h('summary', {}, 'Add result codes from learners'),
    h('div', {style:'display:flex;flex-direction:column;gap:8px;margin-top:8px'}, h('p', {class:'small muted'}, 'Use this when a learner could not connect live and sent you their code on WhatsApp.'), codeIn,
      h('button', {class:'btn small', onclick:function(){ importCode(codeIn, msg); }}, 'Add to class'), msg));
  var legend = h('div', {class:'legend'},
    h('span', {}, h('i', {class:'dot d-first'}, '✓'), 'right'),
    h('span', {}, h('i', {class:'dot d-wrong'}, '✗'), 'wrong'), h('span', {}, h('i', {class:'dot d-skip'}, '–'), 'not sure'), h('span', {}, h('i', {class:'dot'}, ''), 'not reached'));
  return h('div', {class:'wrap', style:'padding:0'}, chips, h('div', {id:'pat'}), legend, h('div', {id:'runs', class:'wrap', style:'padding:0;gap:10px'}), imp);
}
function statusChips(it){
  var now = Date.now(), end = it.t0 + it.m * 60000, out = [];
  if (it.end) out.push(h('span', {class:'chip ok'}, 'Finished'));
  else if (now > end + 30000) out.push(h('span', {class:'chip mute'}, 'Stopped'));
  else if (PUZZLES[it.p].adventure) out.push(h('span', {class:'chip'}, 'Playing'));
  else out.push(h('span', {class:'chip'}, 'Working ', h('span', {class:'mono', 'data-end':String(end)}, fmt(end - now))));
  if (it.src === 'import') out.push(h('span', {class:'chip mute'}, 'Imported'));
  if (it.test) out.push(h('span', {class:'chip warn'}, 'Test'));
  return out;
}
function glyph(st){ return st.state === 'first' ? '✓' : st.state === 'retry' ? String(st.tries) : st.state === 'wrong' ? '✗' : st.state === 'skip' ? '–' : ''; }
function dotsFor(per){ return h('div', {class:'dots'}, per.filter(function(s){ return s.step.type !== 'text'; }).map(function(s){ return h('span', {class:'dot d-' + s.state, title:s.step.short}, glyph(s)); })); }
function renderClass(){
  var runsEl = $('#runs'); if (!runsEl) return;
  var all = items().filter(function(it){ return S.fp === 'all' || it.p === S.fp; });
  var live = all.filter(function(it){ return !it.test; });
  // class-wide pattern
  var pat = $('#pat'); pat.replaceChildren();
  if (S.fp === 'all') {
    pat.append(h('p', {class:'small muted'}, 'Pick a puzzle above to see what the class got stuck on.'));
  } else if (live.length) {
    var P = PUZZLES[S.fp], tag = {}, first = P.steps.map(function(){ return {r:0, n:0}; });
    live.forEach(function(it){
      var per = analyse(it), seen = {};
      per.forEach(function(st){
        if (st.step.type === 'text') return;
        if (st.evs.length) { first[st.i].n++; if (st.state === 'first') first[st.i].r++; }
        st.evs.forEach(function(e){ if (e.r.kind === 'wrong' && e.r.label && !seen[e.r.label]) { seen[e.r.label] = 1; tag[e.r.label] = (tag[e.r.label] || 0) + 1; } });
      });
    });
    var keys = Object.keys(tag).sort(function(a,b){ return tag[b] - tag[a]; }).slice(0,5);
    pat.append(h('div', {class:'card'}, h('h3', {}, 'Where the class got stuck'),
      keys.length ? h('ul', {class:'pattern'}, keys.map(function(k){ return h('li', {}, h('b', {}, tag[k] + '/' + live.length), h('span', {html:k})); })) : h('p', {class:'muted'}, 'No tagged wrong answers yet.'),
      h('details', {class:'plain'}, h('summary', {}, 'Right answers, by step'),
        h('ul', {class:'pattern', style:'margin-top:8px'}, P.steps.map(function(s,i){ return s.type === 'text' ? null : h('li', {}, h('b', {}, first[i].r + '/' + first[i].n), h('span', {}, s.short)); })))));
  }
  // runs
  runsEl.replaceChildren();
  if (S.att === null && S.imp === null) { runsEl.append(h('p', {class:'muted'}, 'Loading class...')); return; }
  if (!all.length) {
    runsEl.append(h('div', {class:'card'}, h('h3', {}, 'No learners yet'),
      h('p', {}, S.db ? 'When a learner opens your link and taps Start, they appear here and update step by step. Get the link ending from the Puzzles tab.' : 'When a learner sends you their code on WhatsApp, open "Add result codes" below and paste it. Their attempt appears here. Results are saved on this phone only.')));
    return;
  }
  all.forEach(function(it){
    var per = analyse(it), P = PUZZLES[it.p], sn = snags(per);
    var d = h('details', {class:'run'},
      h('summary', {},
        h('div', {class:'row'}, h('b', {}, it.name), h('span', {class:'chips'}, statusChips(it))),
        h('div', {class:'small muted'}, P.title),
        dotsFor(per),
        sn.length ? h('div', {class:'small', html:'Snags: ' + sn.slice(0,2).join('; ')}) : null),
      runBody(it, per));
    if (S.open.has(it.key)) d.open = true;
    d.addEventListener('toggle', function(){ if (d.open) S.open.add(it.key); else S.open.delete(it.key); });
    runsEl.append(d);
  });
}
function runBody(it, per){
  var body = h('div', {class:'run-body'});
  per.forEach(function(st){
    if (st.step.type === 'text') return;
    var verdict = st.state === 'first' ? 'right' : st.state === 'retry' ? 'right on try ' + st.tries : st.state === 'wrong' ? 'wrong' : st.state === 'skip' ? 'said not sure' : 'not reached';
    var ul = h('ul', {class:'step-log'});
    st.evs.forEach(function(e){
      var r = e.r, mark = r.kind === 'ok' ? '✓' : r.kind === 'wrong' ? '✗' : '↷';
      var ans = r.kind === 'skip' ? h('span', {}, 'Said not sure') : (st.step.type === 'pick' ? h('span', {html:(st.step.options[+e.a.slice(1)] || {t:'?'}).t}) : st.step.type === 'game' ? h('span', {}, st.step.show ? st.step.show(e.a) : e.a) : h('span', {class:'mono'}, e.a));
      ul.append(h('li', {}, h('b', {}, mark), ans, r.label ? h('span', {class:'muted', html:'· ' + r.label}) : (r.kind === 'wrong' ? h('span', {class:'muted'}, '· Unlisted answer') : null), h('span', {class:'muted mono'}, fmt(e.ms))));
    });
    body.append(h('div', {}, h('div', {class:'row'}, h('b', {}, 'Step ' + (st.i + 1) + ': ' + st.step.short), h('span', {class:'small muted'}, verdict)), ul));
  });
  if (it.r) body.append(h('div', {}, h('b', {}, 'In their words'), h('p', {}, it.r)));
  var del = h('button', {class:'btn ghost small', onclick:function(){
    if (!del.dataset.arm) { del.dataset.arm = '1'; del.textContent = 'Tap again to delete'; setTimeout(function(){ delete del.dataset.arm; del.textContent = 'Delete this attempt'; }, 3000); return; }
    delRun(it);
  }}, 'Delete this attempt');
  body.append(del);
  return body;
}
async function delRun(it){
  if (!S.db) { S.imp = (S.imp || []).filter(function(d){ return d.id !== it.docId; }); saveLocalImp(); renderClass(); return; }
  try {
    if (it.src === 'import') await S.db.collection('imports').doc(it.docId).delete();
    else {
      var ref = S.db.collection('attempts').doc(it.docId), snap = await ref.get(); if (!snap.exists) return;
      var data = JSON.parse(JSON.stringify(snap.data())); if (data.runs) delete data.runs[it.runId];
      if (data.runs && Object.keys(data.runs).length) await ref.set(data); else await ref.delete();
    }
  } catch(e) {}
}
function updateLeft(){
  document.querySelectorAll('[data-end]').forEach(function(el){
    var left = +el.dataset.end - Date.now();
    if (left <= -30000) { renderClass(); return; }
    el.textContent = fmt(left);
  });
}
async function importCode(ta, msg){
  function say(t, c){ msg.textContent = t; msg.className = 'fb ' + c; }
  var codes = ta.value.split(/\s+/).filter(function(x){ return x.indexOf('SF1.') === 0; });
  if (!codes.length) { say('No result code found. A code starts with SF1.', 'bad'); return; }
  var added = [], skipped = 0, bad = 0;
  for (var i = 0; i < codes.length; i++) {
    var o; try { o = JSON.parse(decodeURIComponent(escape(atob(codes[i].slice(4))))); } catch(e) { bad++; continue; }
    var run = sanRun(o); if (!run) { bad++; continue; }
    var name = String(o.n || '?').slice(0,24);
    var dup = (S.imp || []).some(function(d){ return d.data && d.data.t0 === run.t0 && d.data.name === name; }) || (S.att || []).some(function(d){ var r = d.data && d.data.runs; return r && Object.keys(r).some(function(k){ return r[k] && r[k].t0 === run.t0; }); });
    if (dup) { skipped++; continue; }
    var rec = {name:name, imported:Date.now()}; Object.keys(run).forEach(function(k){ rec[k] = run[k]; });
    try {
      if (S.db) await S.db.collection('imports').add(rec);
      else { S.imp = S.imp || []; S.imp.push({id:'l' + Date.now().toString(36) + i, data:rec}); saveLocalImp(); }
      added.push(name);
    } catch(e) { bad++; }
  }
  if (!S.db) renderClass();
  if (added.length) ta.value = '';
  var t = (added.length ? 'Added ' + added.join(', ') + '. ' : '') + (skipped ? skipped + ' already in the class. ' : '') + (bad ? bad + ' could not be read (cut off or damaged). Ask for it again.' : '');
  say(t.trim(), bad ? (added.length ? 'warn' : 'bad') : (added.length ? 'good' : 'warn'));
}

/* ---------- Puzzles tab ---------- */
function puzzlesTab(){
  var advCards = AORDER.map(function(id){
    var P = PUZZLES[id], end = new URL('play.html?game=' + encodeURIComponent(id), location.href).href;
    var cp = h('button', {class:'btn ghost small', onclick:function(){ copyText(end, cp); }}, 'Copy link');
    var key = h('div', {class:'key'});
    P.steps.forEach(function(s,i){
      var k = h('div', {class:'k'}, h('b', {}, (s.type === 'text' ? 'Reflection' : 'Step ' + (i + 1) + ': ' + s.short)), h('div', {html:s.prompt}));
      if (s.type === 'number') {
        k.append(h('div', {class:'small'}, h('b', {}, 'Answer: '), s.ans.join(' or ')));
        s.wrong.forEach(function(w){ k.append(h('div', {class:'small muted', html:'<span class="mono">' + w.v + '</span> means: ' + w.tag})); });
      } else if (s.type === 'pick') {
        s.options.forEach(function(o){ k.append(h('div', {class:'small', html:(o.ok ? '✓ ' : '✗ ') + o.t + (o.ok ? '' : ' <span class="muted">means: ' + o.tag + '</span>')})); });
      } else if (s.type === 'game') {
        (s.keyLines || []).forEach(function(t){ k.append(h('div', {class:'small', html:t})); });
      }
      key.append(k);
    });
    return h('div', {class:'card'},
      h('div', {class:'row'}, h('h3', {}, P.title), h('span', {class:'chip warn'}, 'Draft, not yet approved')),
      h('div', {class:'small muted'}, 'Adventure, no timer. ' + P.topic),
      h('div', {class:'row'}, h('span', {class:'small muted'}, 'Learner link:'), h('span', {class:'mono', style:'font-size:13px;word-break:break-all'}, end), cp),
      h('details', {class:'plain'}, h('summary', {}, 'Answer key and what each wrong answer means'), key));
  });
  var cards = ORDER.map(function(id){
    var P = PUZZLES[id], mins = P.minutes;
    var tokEl = h('span', {class:'mono', style:'font-size:20px'}, '#' + id + '-' + mins);
    var rng = h('input', {type:'range', min:'5', max:'12', step:'1', value:String(mins), id:'rg-' + id, 'aria-label':'Minutes for ' + P.title});
    var lab = h('b', {}, mins + ' minutes');
    rng.addEventListener('input', function(){ mins = +rng.value; lab.textContent = mins + ' minutes'; tokEl.textContent = '#' + id + '-' + mins; });
    var cp = h('button', {class:'btn ghost small', onclick:function(){ copyText(tokEl.textContent, cp); }}, 'Copy ending');
    var key = h('div', {class:'key'});
    P.steps.forEach(function(s,i){
      var k = h('div', {class:'k'}, h('b', {}, (s.type === 'text' ? 'Reflection' : 'Step ' + (i + 1) + ': ' + s.short)), h('div', {html:s.prompt}));
      if (s.type === 'number') {
        k.append(h('div', {class:'small'}, h('b', {}, 'Answer: '), s.ans.join(' or ')));
        s.wrong.forEach(function(w){ k.append(h('div', {class:'small muted', html:'<span class="mono">' + w.v + '</span> means: ' + w.tag})); });
      } else if (s.type === 'pick') {
        s.options.forEach(function(o){ k.append(h('div', {class:'small', html:(o.ok ? '✓ ' : '✗ ') + o.t + (o.ok ? (o.note ? ' <span class="muted">(' + o.note + ')</span>' : '') : ' <span class="muted">means: ' + o.tag + '</span>')})); });
      }
      key.append(k);
    });
    return h('div', {class:'card'},
      h('div', {class:'row'}, h('h3', {}, P.title), h('span', {class:'chip ok'}, 'Approved ' + P.approved)),
      h('div', {class:'small muted'}, P.topic),
      h('div', {class:'row'}, lab), rng,
      h('div', {class:'row'}, h('span', {class:'small muted'}, 'Add this to the end of this page\'s link:'), tokEl, cp),
      h('details', {class:'plain'}, h('summary', {}, 'Answer key and what each wrong answer means'), key));
  });
  var menuTok = h('span', {class:'mono', style:'font-size:20px'}, '#menu');
  var mcp = h('button', {class:'btn ghost small', onclick:function(){ copyText('#menu', mcp); }}, 'Copy ending');
  cards.unshift(h('div', {class:'card'},
    h('h3', {}, 'Practice menu'),
    h('div', {class:'small muted'}, 'Learners choose any puzzle themselves. Use it for revision, not for finding where to start a lesson.'),
    h('div', {class:'row'}, h('span', {class:'small muted'}, 'Add this to the end of this page\'s link:'), menuTok, mcp)));
  return cards.concat(advCards);
}

function sfAdd(P){ PUZZLES[P.id] = P; if (P.adventure && AORDER.indexOf(P.id) < 0) AORDER.push(P.id); ALLIDS = ORDER.concat(AORDER); }
window.SF = {add:sfAdd, start:boot, AORDER:AORDER, ART:ART, BADCARRY:BADCARRY, ICON:ICON, LAD:LAD, ORDER:ORDER, OUT:OUT, PUZZLES:PUZZLES, RESULTS_FORM:RESULTS_FORM, advance:advance, amtLabel:amtLabel, analyse:analyse, artSVG:artSVG, badge:badge, buildPaper:buildPaper, buildStreet:buildStreet, buildTower:buildTower, burst:burst, classShell:classShell, clearTimers:clearTimers, copyText:copyText, dotsFor:dotsFor, drawDone:drawDone, drawGame:drawGame, drawJoin:drawJoin, drawPlay:drawPlay, drawSheetTest:drawSheetTest, drawTeacher:drawTeacher, evalAns:evalAns, finish:finish, flash:flash, fmt:fmt, fmtLen:fmtLen, glyph:glyph, groupTag:groupTag, h:h, hashStr:hashStr, houseSVG:houseSVG, iconSVG:iconSVG, isMenu:isMenu, items:items, learnerShell:learnerShell, loadLocalImp:loadLocalImp, loadSaved:loadSaved, lockBtn:lockBtn, lsGet:lsGet, lsSet:lsSet, makeCode:makeCode, markSent:markSent, menuKind:menuKind, naira:naira, nextGame:nextGame, order:order, parseNum:parseNum, parseToken:parseToken, persist:persist, personSVG:personSVG, pickButtons:pickButtons, pieSVG:pieSVG, puzzlesTab:puzzlesTab, record:record, refSVG:refSVG, renderClass:renderClass, renderLearner:renderLearner, rng:rng, route:route, runBody:runBody, runSummary:runSummary, rungJudge:rungJudge, sackArt:sackArt, sanRun:sanRun, saveLocalImp:saveLocalImp, setSay:setSay, shareLabel:shareLabel, sheetBody:sheetBody, sheetCfg:sheetCfg, sheetPost:sheetPost, showTab:showTab, sleep:sleep, snags:snags, speech:speech, startTicker:startTicker, statusChips:statusChips, stripHtml:stripHtml, subscribe:subscribe, tick:tick, tokFor:tokFor, updateBadge:updateBadge, updateLeft:updateLeft, withTimeout:withTimeout};
if (!window.SF_MANUAL) boot();
})();
