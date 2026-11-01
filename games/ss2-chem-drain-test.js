/* Struggle First game: ss2-chem-drain-test. One file per game. Needs engine.js. */
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
  SF.ART.flask = '<path d="M20 8h8v12l10 18a3 3 0 0 1-3 4H13a3 3 0 0 1-3-4l10-18z" style="fill:#A8D8A0;' + SF.OUT + '"/>';
  var EQ = {title:'Reactions', rows:[['HCl + NaOH', '1 : 1'], ['H2SO4 + 2NaOH', '1 : 2']]};
  var S1 = numStep({short:'HCl concentration (25.0 cm3 NaOH needs 20.0 cm3)', title:'The first test', scale:1000, ok:[120, 130], label:'Concentration in mol/dm3',
    say:'Mr Chuks titrates 25.0 cm3 of 0.10 mol/dm3 NaOH. It needs 20.0 cm3 of HCl solution to be neutralised exactly. What is the concentration of the HCl? (in mol/dm3)',
    facts:['HCl + NaOH gives NaCl + H2O','NaOH: 25.0 cm3 of 0.10 mol/dm3','HCl: 20.0 cm3 needed'],
    named:[[[78, 82], 'Inverted the volumes (0.10 x 20 / 25)'], [[98, 102], 'Assumed the acid has the same concentration as the alkali']],
    after:function(v){ var need = v > 0 ? 0.0025 / v * 1000 : 0; return ['Mr Chuks makes up your acid (' + f3(v) + ' mol/dm3) and titrates 25.0 cm3 of the NaOH.', 'It needs ' + f2(need) + ' cm3. His first titration needed 20.0 cm3.']; },
    keyLines:['Correct: 0.125 mol/dm3. n(NaOH) = 0.0250 dm3 x 0.10 = 0.0025 mol. The ratio is 1:1, so n(HCl) = 0.0025 mol in 0.0200 dm3.','0.08: inverted. 0.10: same concentration.','Consequence: the learner sees how much of their acid is needed, so a learner can adjust. It can influence level 2.']});
  var S2 = numStep({short:'H2SO4 concentration (25.0 cm3 NaOH needs 20.0 cm3)', title:'The second test', scale:10000, ok:[610, 640], label:'Concentration in mol/dm3', table:EQ,
    say:'Mr Chuks titrates 25.0 cm3 of the same 0.10 mol/dm3 NaOH. This time it needs 20.0 cm3 of H2SO4 solution to be neutralised exactly. What is the concentration of the H2SO4? (in mol/dm3)',
    facts:['H2SO4 + 2NaOH gives Na2SO4 + 2H2O','NaOH: 25.0 cm3 of 0.10 mol/dm3','H2SO4: 20.0 cm3 needed'],
    named:[[[1240, 1260], 'Assumed one acid for one alkali, as with HCl'], [[2480, 2520], 'Doubled instead of halving'], [[780, 820], 'Inverted the volumes'], [[980, 1020], 'Assumed the same concentration as the alkali']],
    after:function(v){ var need = v > 0 ? 0.00125 / v * 1000 : 0; return ['Mr Chuks makes up your acid (' + f3(v) + ' mol/dm3) and titrates 25.0 cm3 of the NaOH.', 'It needs ' + f2(need) + ' cm3. His first titration needed 20.0 cm3.']; },
    keyLines:['Correct: 0.0625 mol/dm3. n(NaOH) = 0.0025 mol. The ratio is 1:2, so n(H2SO4) = 0.00125 mol in 0.0200 dm3.','0.125: assumed 1:1. 0.25: doubled instead of halving.','This is the trap level: the 1:1 method gives a different number.']});
  var P3 = [
    {t:'One H2SO4 neutralises two NaOH, so the acid is half as concentrated for the same volume.', ok:true},
    {t:'Sulfuric acid is a stronger acid, so its concentration is higher.', tag:'Reasoned: confused acid strength with concentration'},
    {t:'I used the same method as for HCl and wrote down what I got.', tag:'Reasoned: applied the 1:1 method without checking the equation'},
    {t:'The volumes are different, so the answer is different.', tag:'Reasoned: said the volumes differ (they are the same)'}];
  var S3 = pickStep({short:'How you decided', title:'How did you decide?', opts:P3, order:[2, 3, 0, 1],
    say:'Which is closest to why the sulfuric acid answer differs from the HCl answer?', facts:['Pick the one closest to what you really thought. There is no best style.'],
    keyLines:['Sound reason: the mole ratio is 1:2, not 1:1.','Compare with level 2. A right number with a faulty reason, or a wrong number with a sound reason, is the learner a number alone hides.']});
  var S4 = numStep({short:'Volume of 0.10 M H2SO4 for 25.0 cm3 of 0.10 M NaOH', title:'The next batch', scale:10, ok:[124, 126], label:'Volume in cm3', table:EQ,
    say:'How many cm3 of 0.10 mol/dm3 H2SO4 are needed to neutralise 25.0 cm3 of 0.10 mol/dm3 NaOH? (in cm3)',
    facts:['H2SO4 + 2NaOH gives Na2SO4 + 2H2O','Both are 0.10 mol/dm3'],
    named:[[[249, 251], 'Assumed 1:1 (25 cm3)'], [[499, 501], 'Doubled the volume (50 cm3)']],
    after:function(v){ var need = 12.5; return v === need ? ['Mr Chuks adds ' + v + ' cm3 of acid. The mixture is exactly neutral.'] : v > need ? ['Mr Chuks adds ' + v + ' cm3 of acid. There is too much: the mixture is acidic.'] : ['Mr Chuks adds ' + v + ' cm3 of acid. There is too little: the mixture is still alkaline.']; },
    keyLines:['Correct: 12.5 cm3. n(NaOH) = 0.0025 mol, so n(H2SO4) = 0.00125 mol, which is 12.5 cm3 of 0.10 mol/dm3.','25: 1:1 again. 50: doubled.']});
  var S5 = numStep({short:'Mass of NaOH in 250 cm3 of 0.10 M', title:'The batch of cleaner', scale:100, ok:[100, 100], label:'Mass of NaOH in grams',
    say:'Mr Chuks wants 250 cm3 of 0.10 mol/dm3 NaOH. What mass of NaOH must he dissolve? (NaOH = 40 g/mol; answer in grams)',
    facts:['Na = 23, O = 16, H = 1','250 cm3 is not 1 dm3'],
    named:[[[400, 400], 'Used 1 dm3 instead of 250 cm3'], [[100000, 100000], 'Did not convert cm3 to dm3']],
    after:function(v){ var c = (v / 40) / 0.25; return ['Mr Chuks dissolves ' + f2(v) + ' g in 250 cm3.', 'His solution is ' + f3(c) + ' mol/dm3. He wanted 0.10.']; },
    keyLines:['Correct: 1.0 g. n = 0.250 dm3 x 0.10 = 0.025 mol, mass = 0.025 x 40 = 1.0 g.','4 g: used 1 dm3. 1000 g: did not convert cm3.']});
  SF.add({
    id:'ss2-chem-drain-test', adventure:true, unit:'Test', icon:'flask',
    facts:['Mr Chuks makes sodium hydroxide drain cleaner','He tests it by titrating with acid'],
    outro:'Mr Chuks caps the bottles. The cleaner is ready.',
    title:'The Drain Cleaner Test', topic:'Titration: moles, concentration and the mole ratio in the equation', minutes:45, approved:null,
    intro:'Mr Chuks makes sodium hydroxide drain cleaner in Owerri. He checks each batch by <b>titration</b>: he adds acid from a burette until the alkali is exactly neutralised. You are his helper. The numbers are made up, but the chemistry is real.',
    steps:[S1, S2, S3, S4, S5, {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher what you did when the acid changed. This is optional.'}]
  });
})();
