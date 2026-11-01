/* Struggle First game: ss2-chem-salt-pond. One file per game. Needs engine.js. */
(function(){
  var h = SF.h, speech = SF.speech, setSay = SF.setSay, lockBtn = SF.lockBtn, burst = SF.burst;
  function f2(x){ return String(Math.round(x * 100) / 100); }
  function f3(x){ return String(Math.round(x * 1000) / 1000); }
  function injectCss(){
    if (document.getElementById('cx-css')) return;
    var s = document.createElement('style'); s.id = 'cx-css';
    s.textContent = [
      '.cx-tab{border:1.5px solid var(--line);border-radius:10px;background:var(--bg);padding:8px 10px;display:flex;flex-direction:column;gap:4px}',
      '.cx-tab .cx-t{font-size:13px;color:var(--muted)}',
      '.cx-tab .cx-r{display:flex;justify-content:space-between;font:600 15px ui-monospace,monospace}',
      '.cx-opts{display:flex;flex-direction:column;gap:10px}',
      '.cx-opt{display:block;width:100%;text-align:left;min-height:52px;padding:12px 14px;border:1.5px solid var(--line);background:var(--surface);color:var(--fg);border-radius:10px;font:inherit;cursor:pointer}',
      '.cx-opt.sel{border-color:var(--accent);outline:2px solid var(--accent)}',
      '.cx-out{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px}',
      '.cx-out li{border-top:1px solid var(--line);padding-top:6px;font:500 15px ui-monospace,monospace}',
      '.cx-lab{font-size:14px;color:var(--muted)}'
    ].join('\n');
    document.head.appendChild(s);
  }
  function tabEl(step){
    if (!step.table) return null;
    var rows = [h('div', {class:'cx-t'}, step.table.title)];
    step.table.rows.forEach(function(r){ rows.push(h('div', {class:'cx-r'}, h('span', {}, r[0]), h('span', {}, r[1]))); });
    return h('div', {class:'cx-tab', role:'img', 'aria-label':step.table.title}, rows);
  }
  function buildNum(host, api, step){
    injectCss();
    var sp = speech(step.say), lock = lockBtn('I am sure'), out = h('ul', {class:'cx-out'});
    var inp = h('input', {class:'field', inputmode:'decimal', autocomplete:'off', maxlength:'9', 'aria-label':'Your answer'});
    inp.addEventListener('input', function(){ lock.disabled = !/^-?\d{1,5}(\.\d{1,4})?$/.test(inp.value.trim()); });
    lock.addEventListener('click', function(){
      if (api.locked) return; var v = parseFloat(inp.value.trim()); if (isNaN(v)) return;
      var lines = step.after(v); api.submit('n' + Math.round(v * step.scale), 1200 + lines.length * 700);
      lock.disabled = true; inp.disabled = true; setSay(sp, step.checking || 'The shop checks your answer.', '');
      lines.forEach(function(t, k){ setTimeout(function(){ out.append(h('li', {}, t)); }, 500 + k * 700); });
      setTimeout(function(){ burst(host); }, 600);
    });
    host.append(sp); var t = tabEl(step); if (t) host.append(t);
    host.append(h('label', {class:'cx-lab'}, step.label), inp, lock, out);
  }
  function buildPick(host, api, step){
    injectCss();
    var sp = speech(step.say), sel = null, btns = [], lock = lockBtn('I am sure'), opts = h('div', {class:'cx-opts'}), out = h('ul', {class:'cx-out'});
    step.order.forEach(function(i){
      var b = h('button', {class:'cx-opt', type:'button'}, step.opts[i].t);
      b.addEventListener('click', function(){ if (api.locked) return; btns.forEach(function(x){ x.classList.remove('sel'); }); b.classList.add('sel'); sel = i; lock.disabled = false; });
      btns.push(b); opts.append(b);
    });
    lock.addEventListener('click', function(){
      if (api.locked || sel === null) return;
      var lines = step.after ? step.after(sel) : []; api.submit('p' + sel, 1600 + lines.length * 700);
      lock.disabled = true; btns.forEach(function(x){ x.disabled = true; });
      setSay(sp, lines.length ? 'The shop checks your answer.' : 'Thank you. That has been written down.', '');
      lines.forEach(function(t, k){ setTimeout(function(){ out.append(h('li', {}, t)); }, 500 + k * 700); });
      if (lines.length) setTimeout(function(){ burst(host); }, 600);
    });
    host.append(sp); var t = tabEl(step); if (t) host.append(t);
    host.append(opts, lock, out);
  }
  function inR(v, r){ return v >= r[0] && v <= r[1]; }
  function numStep(s){
    s.type = 'game'; s.build = buildNum;
    s.judge = function(a){ var v = +String(a).slice(1); if (inR(v, s.ok)) return {ok:true}; for (var i = 0; i < s.named.length; i++) if (inR(v, s.named[i][0])) return {tag:s.named[i][1]}; return {tag:'Not a listed slip'}; };
    s.show = function(a){ return 'Typed ' + (+String(a).slice(1) / s.scale); };
    return s;
  }
  function pickStep(s){
    s.type = 'game'; s.build = buildPick;
    s.judge = function(a){ var o = s.opts[+String(a).slice(1)]; if (!o) return {tag:'Answer could not be read'}; return o.ok ? {ok:true} : {tag:o.tag}; };
    s.show = function(a){ var o = s.opts[+String(a).slice(1)]; return o ? 'Chose: ' + o.t : 'Unreadable'; };
    return s;
  }
  SF.ART.pond = '<ellipse cx="24" cy="28" rx="18" ry="10" style="fill:#8FC3E8;' + SF.OUT + '"/><path d="M14 26h6M26 30h8" style="fill:none;' + SF.OUT + '"/>';
  var SOL = {title:'Salt X: most that dissolves in 100 g of water (grams)', rows:[['10 C', '20 g'], ['30 C', '40 g'], ['50 C', '70 g'], ['70 C', '110 g']]};
  var S1 = numStep({short:'Salt held by 200 g of water at 50 C', title:'The warm pond', scale:1, ok:[140, 140], label:'Mass of salt X in grams', table:SOL,
    say:'The pond holds 200 g of water at 50 C. What is the most salt X that can dissolve in it? (in grams)',
    facts:['Use the table','The pond water is 200 g'],
    named:[[[70, 70], 'Ignored that there is 200 g of water (gave the value for 100 g)'], [[35, 35], 'Halved instead of doubling'], [[280, 280], 'Multiplied by 4']],
    after:function(v){ return v <= 140 ? ['Mama Chi stirs in ' + v + ' g. It all dissolves, and there is room for ' + (140 - v) + ' g more.'] : ['Mama Chi stirs in ' + v + ' g. ' + (v - 140) + ' g stays on the bottom, undissolved.']; },
    keyLines:['Correct: 140 g (70 g per 100 g of water, and there is 200 g of water).','70: ignored the amount of water. 35 and 280: scaled the wrong way.','Consequence: the learner sees what happens to their amount, so later levels can be affected.']});
  var S2 = numStep({short:'Crystals when 200 g saturated solution cools 70 C to 30 C', title:'The cooling pond', scale:1, ok:[140, 140], label:'Mass of crystals in grams', table:SOL,
    say:'The pond holds 200 g of water, saturated with salt X at 70 C. It cools slowly to 30 C. How many grams of crystals form? (in grams)',
    facts:['Saturated means no more can dissolve','Use the table'],
    named:[[[70, 70], 'Did not scale for 200 g of water'], [[80, 80], 'Gave the mass still dissolved at 30 C, not the crystals'], [[220, 220], 'Gave the mass dissolved at 70 C, not the crystals'], [[40, 40], 'Gave the solubility at 30 C for 100 g']],
    after:function(v){ return ['Mama Chi filters and weighs the crystals: 140 g', 'You said ' + v + ' g']; },
    keyLines:['Correct: 140 g. At 70 C: 220 g dissolved. At 30 C: 80 g can stay dissolved. The rest, 140 g, crystallises.','70: forgot 200 g of water. 80: gave what stays dissolved. 220: gave the total at 70 C.']});
  var P3 = [
    {t:'Cold water can hold less salt, so the extra comes out as crystals.', ok:true},
    {t:'Cold makes the salt heavier, so it sinks and forms crystals.', tag:'Reasoned: cold makes the salt heavier'},
    {t:'Some of the water evaporates and leaves the crystals behind.', tag:'Reasoned: evaporation'},
    {t:'The salt reacts with the cold water to make crystals.', tag:'Reasoned: salt reacts with cold water'}];
  var S3 = pickStep({short:'How you decided', title:'How did you decide?', opts:P3, order:[3, 1, 0, 2],
    say:'Which is closest to why crystals appear when the pond cools?', facts:['Pick the one closest to what you really thought. There is no best style.'],
    keyLines:['Sound reason: solubility falls as the temperature falls, so the extra solute cannot stay dissolved.','Compare with level 2. A right number with a faulty reason is the learner a number alone hides. Evaporation is a real way to get crystals, but it is not why cooling works.']});
  var S4 = numStep({short:'Room left in 100 g water at 50 C with 60 g dissolved', title:'The half-full pond', scale:1, ok:[10, 10], label:'Extra salt X in grams', table:SOL,
    say:'100 g of water at 50 C has 60 g of salt X dissolved in it. How many more grams of salt X can dissolve? (in grams)',
    facts:['Use the table','60 g is already dissolved'],
    named:[[[70, 70], 'Gave the full solubility and ignored what is already dissolved'], [[0, 0], 'Said the solution is already saturated'], [[60, 60], 'Gave the amount already dissolved']],
    after:function(v){ return v <= 10 ? ['Mama Chi stirs in ' + v + ' g more. It all dissolves' + (v === 10 ? ', and the solution is now just saturated.' : ', and there is room for ' + (10 - v) + ' g more.')] : ['Mama Chi stirs in ' + v + ' g more. ' + (v - 10) + ' g stays undissolved on the bottom.']; },
    keyLines:['Correct: 10 g (70 g can dissolve in total, 60 g is already in, so the solution is unsaturated and has room for 10 g).','70: ignored what is dissolved. 0: called it saturated. 60: gave what is in.']});
  var S5 = numStep({short:'Temperature when crystals first appear', title:'The slow cool', scale:1, ok:[50, 50], label:'Temperature in C', table:SOL,
    say:'100 g of water at 70 C has 70 g of salt X dissolved in it. It cools slowly. At what temperature do the first crystals appear? (in C)',
    facts:['Use the table','70 g is dissolved at the start'],
    named:[[[70, 70], 'Said crystals start as soon as cooling begins'], [[30, 30], 'Gave a temperature below where crystals first form'], [[10, 10], 'Gave the lowest temperature in the table']],
    after:function(v){ return ['At 50 C, 100 g of water holds exactly 70 g, so the solution is just saturated.', 'Below 50 C it can hold less than 70 g, so crystals appear.', 'You said ' + v + ' C']; },
    keyLines:['Correct: 50 C (the solution is unsaturated at 70 C and becomes saturated at 50 C).','70: thinks crystals start at once. 30: waited past the first crystal.']});
  SF.add({
    id:'ss2-chem-salt-pond', adventure:true, unit:'Pond', icon:'pond',
    facts:['Mama Chi makes salt X in shallow ponds','She dissolves it in warm water and then cools it'],
    outro:'Mama Chi covers the ponds for the night.',
    title:'The Salt Pond', topic:'Solubility: how much dissolves depends on the water and the temperature', minutes:45, approved:null,
    intro:'Mama Chi makes salt X in shallow ponds in Owerri. She dissolves it in warm water and cools it to collect crystals. You are her helper. The table of salt X is made up, but the idea is real.',
    steps:[S1, S2, S3, S4, S5, {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher what you did when the pond cooled. This is optional.'}]
  });
})();
