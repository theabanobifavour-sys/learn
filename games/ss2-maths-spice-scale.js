/* Struggle First game: ss2-maths-spice-scale. One file per game. Needs engine.js. */
(function(){
  var h = SF.h, speech = SF.speech, setSay = SF.setSay, lockBtn = SF.lockBtn, burst = SF.burst;

  /* ---------- styles (all class names start with ssc-) ---------- */
  function injectCss(){
    if (document.getElementById('ssc-css')) return;
    var s = document.createElement('style'); s.id = 'ssc-css';
    s.textContent = [
      '.ssc-scale{border:1.5px solid var(--line);border-radius:12px;background:var(--bg);padding:10px 14px;display:flex;flex-direction:column;gap:2px;align-items:center}',
      '.ssc-scale .ssc-cap{font-size:13px;color:var(--muted);letter-spacing:.04em;text-transform:uppercase}',
      '.ssc-scale .ssc-disp{font:700 28px var(--f-mono,ui-monospace,monospace);color:var(--fg);font-variant-numeric:tabular-nums;white-space:nowrap}',
      '.ssc-pair{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
      '.ssc-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
      '.ssc-chip{min-height:52px;padding:8px 10px;border:1.5px solid var(--line);border-radius:10px;background:var(--surface);color:var(--fg);font:600 17px var(--f-mono,ui-monospace,monospace);cursor:pointer;text-align:center}',
      '.ssc-chip.sel{border-color:var(--accent);background:var(--accent-bg,var(--bg));outline:2px solid var(--accent);outline-offset:0}',
      '.ssc-chip:disabled{cursor:default;opacity:.9}',
      '.ssc-weigh{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px}',
      '.ssc-weigh li{display:flex;justify-content:space-between;gap:8px;border-top:1px solid var(--line);padding-top:6px;font:500 16px var(--f-mono,ui-monospace,monospace)}',
      '.ssc-prac{border:1.5px dashed var(--line);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:6px}',
      '.ssc-prac input[type=range]{width:100%;min-height:44px;accent-color:var(--accent)}',
      '.ssc-opt{display:block;width:100%;text-align:left;min-height:52px;padding:12px 14px;border:1.5px solid var(--line);background:var(--surface);color:var(--fg);border-radius:10px;font:inherit;cursor:pointer}',
      '.ssc-opt.sel{border-color:var(--accent);background:var(--accent-bg,var(--bg));outline:2px solid var(--accent)}',
      '.ssc-opts{display:flex;flex-direction:column;gap:10px}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ---------- rounding helpers ---------- */
  function readout(v, rule){ return rule.mode === 'dp' ? v.toFixed(rule.n) : v.toPrecision(rule.n); }
  function lastUnit(rule, v){ return rule.mode === 'dp' ? Math.pow(10, -rule.n) : Math.pow(10, Math.floor(Math.log10(+readout(v, rule))) - rule.n + 1); }
  function trunc(v, rule){
    if (rule.mode === 'dp') { var f = Math.pow(10, rule.n); return (Math.floor(v * f + 1e-9) / f).toFixed(rule.n); }
    var sc = Math.pow(10, rule.n - 1 - Math.floor(Math.log10(v)));
    return (Math.floor(v * sc + 1e-9) / sc).toPrecision(rule.n);
  }
  function prep(step){
    step.parcels.forEach(function(p){
      p.v = +p.w;
      p.shown = readout(p.v, step.rule);
      p.ok = p.shown === step.reading;
      p.trunc = trunc(p.v, step.rule) === step.reading;
      p.pm1 = !p.ok && Math.abs(+p.shown - +step.reading) / lastUnit(step.rule, +step.reading) < 1.5;
      p.above = !p.ok && p.v > +step.reading;
    });
  }
  function bitsOf(step, a){ var s = String(a).slice(1); return s.length === step.parcels.length ? s : null; }
  function classify(step, a){
    var bits = bitsOf(step, a); if (!bits) return {tag:'Answer could not be read'};
    var P = step.parcels, sel = [], miss = [], i;
    for (i = 0; i < P.length; i++) { if (bits[i] === '1') sel.push(P[i]); else if (P[i].ok) miss.push(P[i]); }
    var wrongSel = sel.filter(function(p){ return !p.ok; });
    if (!wrongSel.length && !miss.length) return {ok:true};
    var truncSame = P.every(function(p, k){ return (bits[k] === '1') === p.trunc; });
    if (truncSame) return {tag:'Cut the digits off instead of rounding'};
    if (!wrongSel.length && sel.length <= 2) return {tag:'Treated the reading as one exact weight'};
    var parts = [];
    var pm = wrongSel.filter(function(p){ return p.pm1; });
    if (pm.length >= 2) parts.push('Allowed plus or minus one in the last digit');
    else if (wrongSel.some(function(p){ return p.above; })) parts.push('Accepted weights above the top of the range');
    else if (wrongSel.length) parts.push('Accepted weights below the bottom of the range');
    if (wrongSel.some(function(p){ return !p.pm1 && pm.length >= 2; })) parts.push('Accepted a weight far from the reading');
    if (miss.length) parts.push('Left out weights that do round to the reading');
    return {tag: parts.join('; ') || 'Other pattern'};
  }
  function describe(step, a){
    var bits = bitsOf(step, a); if (!bits) return 'Unreadable answer';
    var out = []; step.parcels.forEach(function(p, i){ if (bits[i] === '1') out.push(p.w); });
    return 'Chose ' + (out.length ? out.join(', ') + ' kg' : 'none');
  }

  /* ---------- practice scale (not counted) ---------- */
  function practice(){
    var sl = h('input', {type:'range', min:'230', max:'280', step:'1', value:'234', 'aria-label':'Practice parcel weight'});
    var t = h('div', {class:'small'}, '');
    function upd(){ var v = +sl.value / 100; t.innerHTML = 'Parcel: <b>' + v.toFixed(2) + ' kg</b><br>This practice scale shows 1 decimal place: <b>' + v.toFixed(1) + ' kg</b>'; }
    sl.addEventListener('input', upd); upd();
    return h('div', {class:'ssc-prac'}, h('div', {class:'small muted'}, 'Practice scale (not counted). Slide the parcel weight and watch what the display does.'), sl, t);
  }

  /* ---------- mechanic 1: which parcels could the scale have shown? ---------- */
  function buildParcels(host, api, step){
    injectCss(); prep(step);
    var sp = speech(step.say), sel = {}, nSel = 0, chips = [];
    var scale = h('div', {class:'ssc-scale', role:'img', 'aria-label':'The scale shows ' + step.reading + ' kg'}, h('div', {class:'ssc-cap'}, 'The scale shows'), h('div', {class:'ssc-disp'}, step.reading + ' kg'));
    var grid = h('div', {class:'ssc-grid'});
    var lock = lockBtn('I am sure');
    var list = h('ul', {class:'ssc-weigh'});
    step.parcels.forEach(function(p, i){
      var b = h('button', {class:'ssc-chip', type:'button', 'aria-pressed':'false'}, p.w + ' kg');
      b.addEventListener('click', function(){
        if (api.locked) return;
        sel[i] = !sel[i]; nSel += sel[i] ? 1 : -1;
        b.classList.toggle('sel', !!sel[i]); b.setAttribute('aria-pressed', sel[i] ? 'true' : 'false');
        lock.disabled = nSel === 0;
        setSay(sp, nSel + ' parcel' + (nSel === 1 ? '' : 's') + ' chosen. You can change your mind until you lock in.', '');
      });
      chips.push(b); grid.append(b);
    });
    lock.addEventListener('click', function(){
      if (api.locked || !nSel) return;
      var bits = step.parcels.map(function(p, i){ return sel[i] ? '1' : '0'; }).join('');
      var chosen = step.parcels.filter(function(p, i){ return sel[i]; });
      api.submit('m' + bits, 1800 + chosen.length * 800);
      lock.disabled = true; chips.forEach(function(c){ c.disabled = true; });
      setSay(sp, 'Mama Ify puts your parcels on the scale one by one.', '');
      chosen.forEach(function(p, k){
        setTimeout(function(){ list.append(h('li', {}, h('span', {}, p.w + ' kg'), h('span', {}, 'display: ' + p.shown + ' kg'))); }, 500 + k * 700);
      });
      setTimeout(function(){ burst(host); }, 500 + chosen.length * 700);
    });
    host.append(sp);
    if (step.practice) host.append(practice());
    host.append(scale, grid, lock, list);
  }

  /* ---------- mechanic 2: two scales, which can tell two parcels apart? ---------- */
  function buildScales(host, api, step){
    injectCss();
    var sp = speech(step.say), sel = null, btns = [];
    var pair = h('div', {class:'ssc-pair'},
      h('div', {class:'ssc-scale'}, h('div', {class:'ssc-cap'}, 'Scale A'), h('div', {class:'ssc-disp'}, step.a.reading + ' kg')),
      h('div', {class:'ssc-scale'}, h('div', {class:'ssc-cap'}, 'Scale B'), h('div', {class:'ssc-disp'}, step.b.reading + ' kg')));
    var info = h('p', {}, 'Both scales just weighed the same 5 gram test weight (0.005 kg). Two parcels are coming: ',
      h('b', {}, step.p1 + ' kg'), ' and ', h('b', {}, step.p2 + ' kg'), '. Which scale will show them as two different readings?');
    var opts = h('div', {class:'ssc-opts'});
    var lock = lockBtn('I am sure'), out = h('div', {class:'small'}, '');
    [['A', 'Scale A'], ['B', 'Scale B'], ['S', 'Both scales will show the same two readings']].forEach(function(o){
      var b = h('button', {class:'ssc-opt', type:'button'}, o[1]);
      b.addEventListener('click', function(){ if (api.locked) return; btns.forEach(function(x){ x.classList.remove('sel'); }); b.classList.add('sel'); sel = o[0]; lock.disabled = false; setSay(sp, 'You can change your choice until you lock in.', ''); });
      btns.push(b); opts.append(b);
    });
    lock.addEventListener('click', function(){
      if (api.locked || !sel) return;
      api.submit('s' + sel, 4200); lock.disabled = true; btns.forEach(function(x){ x.disabled = true; });
      setSay(sp, 'Mama Ify weighs both parcels.', '');
      function line(name, sc){ return h('div', {}, h('b', {}, name + ': '), step.p1 + ' kg shows ' + (+step.p1).toPrecision(sc) + ' kg, ' + step.p2 + ' kg shows ' + (+step.p2).toPrecision(sc) + ' kg'); }
      setTimeout(function(){
        if (sel === 'A' || sel === 'S') out.append(line('Scale A', 2));
        if (sel === 'B' || sel === 'S') out.append(line('Scale B', 1));
        burst(host);
      }, 700);
    });
    host.append(sp, pair, info, opts, lock, out);
  }

  /* ---------- mechanic 3: reasoning pick (M3.8) ---------- */
  function buildPick(host, api, step){
    injectCss();
    var sp = speech(step.say), sel = null, btns = [], lock = lockBtn('I am sure'), opts = h('div', {class:'ssc-opts'});
    step.order.forEach(function(i){
      var b = h('button', {class:'ssc-opt', type:'button'}, step.options[i].t);
      b.addEventListener('click', function(){ if (api.locked) return; btns.forEach(function(x){ x.classList.remove('sel'); }); b.classList.add('sel'); sel = i; lock.disabled = false; });
      btns.push(b); opts.append(b);
    });
    lock.addEventListener('click', function(){ if (api.locked || sel === null) return; api.submit('p' + sel, 1600); lock.disabled = true; btns.forEach(function(x){ x.disabled = true; }); setSay(sp, 'Thank you. Mama Ify has written that down.', ''); });
    host.append(sp, opts, lock);
  }
  function pickJudge(step){ return function(a){ var o = step.options[+String(a).slice(1)]; if (!o) return {tag:'Answer could not be read'}; return o.ok ? {ok:true} : {tag:o.tag}; }; }

  var PICK = {
    type:'game', short:'How you decided', title:'How did you decide?', build:buildPick,
    say:'Think about the last three levels. Which is closest to how you decided?',
    facts:['Pick the one closest to how you really worked. Be honest, there is no best style to pick.'],
    options:[
      {t:'A reading stands for every weight that rounds to it, so the true weight could be anywhere in a range.', ok:true},
      {t:'The reading is the weight, give or take one in the last digit.', tag:'Reasoned: weight plus or minus one in the last digit'},
      {t:'Only the digits after the point matter, so zeros at the end change nothing.', tag:'Reasoned: zeros at the end change nothing'},
      {t:'I count the figures starting from the decimal point.', tag:'Reasoned: counted from the decimal point, not from the first digit that is not zero'}
    ],
    order:[2, 0, 3, 1],
    show:function(a){ var o = this.options[+String(a).slice(1)]; return o ? 'Said: ' + o.t : 'Unreadable'; },
    keyLines:['Sound reason: a reading stands for a range of weights.','Flag a learner who got levels 1 to 3 right but picked a faulty reason, and a learner who got levels wrong but picked the sound reason. A stated reason is one signal, not proof: learners may pick the reason that sounds smartest.']
  };
  PICK.judge = pickJudge(PICK);

  SF.add({
    id:'ss2-maths-spice-scale', adventure:true, unit:'Level', icon:'garri',
    facts:['The scale rounds every weight to the digits it shows','Weights are in kg and are made up for this game'],
    outro:'Mama Ify closes her stall for the day. Thank you for the help.',
    title:'The Spice Scale', topic:'Numbers and approximation: a rounded reading stands for a range of weights', minutes:45, approved:null,
    intro:'Mama Ify sells ground pepper and crayfish at her stall in Owerri. Her new digital scale shows a <b>rounded</b> reading. Customers bring parcels, and she wants to know which parcels could be sitting behind the number on the display. You are her helper. The weights in this game are made up.',
    steps:[
      {type:'game', short:'Which parcels show 0.04 (2 decimal places)', title:'The 2 decimal place scale', build:buildParcels,
        reading:'0.04', rule:{mode:'dp', n:2}, practice:true,
        facts:['This scale shows 2 decimal places','Weights are in kg'],
        say:'The display says 0.04 kg. Tap every parcel that the scale could show as 0.04 kg.',
        parcels:[{w:'0.0449'},{w:'0.0520'},{w:'0.0400'},{w:'0.0351'},{w:'0.0499'},{w:'0.0420'},{w:'0.0349'},{w:'0.0451'}],
        show:function(a){ return describe(this, a); },
        judge:function(a){ return classify(this, a); },
        keyLines:['Correct: 0.0351, 0.0400, 0.0420 and 0.0449 (all round to 0.04). Not 0.0349, 0.0451, 0.0499 or 0.0520.','Cut-off pattern (picked 0.0400, 0.0420, 0.0449, 0.0451, 0.0499, left out 0.0351): the learner chops digits off instead of rounding.','Only one or two parcels: reads the display as one exact weight.','Includes 0.0349, 0.0451, 0.0499 or 0.0520: allows plus or minus one in the last digit.','There are no weights at exactly halfway, so no rounding convention is needed.']},
      {type:'game', short:'Which parcels show 0.0407 (3 significant figures)', title:'The 3 significant figure scale', build:buildParcels,
        reading:'0.0407', rule:{mode:'sf', n:3},
        facts:['This scale shows 3 significant figures','Significant figures are counted from the first digit that is not zero','Weights are in kg'],
        say:'The display says 0.0407 kg. Tap every parcel that the scale could show as 0.0407 kg.',
        parcels:[{w:'0.0408'},{w:'0.04076'},{w:'0.0407'},{w:'0.0412'},{w:'0.04066'},{w:'0.0406'},{w:'0.04074'},{w:'0.04064'}],
        show:function(a){ return describe(this, a); },
        judge:function(a){ return classify(this, a); },
        keyLines:['Correct: 0.04066, 0.0407 and 0.04074. Not 0.04064, 0.04076, 0.0406, 0.0408 or 0.0412.','Cut-off pattern (0.0407, 0.04074, 0.04076): chops digits off.','Picking 0.0406 and 0.0408 as well: allows plus or minus one in the last digit, instead of half a unit either side.','The facts strip gives the counting rule on this level, so this level tests using the rule, not recalling it.']},
      {type:'game', short:'Trailing zero: which scale tells two parcels apart', title:'Two scales', build:buildScales,
        a:{reading:'0.0050'}, b:{reading:'0.005'}, p1:'0.0054', p2:'0.0046',
        facts:['A scale rounds to the last digit it shows','The test weight is 5 grams, which is 0.005 kg'],
        say:'Mama Ify has two scales. They look nearly the same, but they are not.',
        show:function(a){ var c = String(a).slice(1); return c === 'A' ? 'Chose Scale A' : c === 'B' ? 'Chose Scale B' : 'Said both scales are the same'; },
        judge:function(a){ var c = String(a).slice(1); if (c === 'A') return {ok:true}; if (c === 'S') return {tag:'Thought 0.0050 and 0.005 are the same, so a zero at the end means nothing'}; if (c === 'B') return {tag:'Picked the scale with fewer digits as the finer one'}; return {tag:'Answer could not be read'}; },
        keyLines:['Correct: Scale A (0.0050 has 2 significant figures, so it separates 0.0054 from 0.0046).','Same: zero at the end means nothing (the key trailing zero trap).','Scale B: thinks fewer digits is more exact.','After locking, the chosen scale shows its readings for both parcels. If they said the scales are the same, both scales show their readings.']},
      PICK,
      {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher what you did when the scale showed a zero at the end. This is optional.'}
    ]
  });
})();
