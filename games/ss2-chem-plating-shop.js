/* Struggle First game: ss2-chem-plating-shop. One file per game. Needs engine.js. */
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
  SF.ART.plate = '<rect x="8" y="14" width="32" height="22" rx="3" style="fill:#C87F4E;' + SF.OUT + '"/><path d="M14 22h20M14 28h20" style="fill:none;' + SF.OUT + '"/>';
  var FARADAY = 96500, CU_PER_E = 32;   /* grams of copper per mole of electrons */
  function cuMass(I, t){ return I * t / FARADAY * CU_PER_E; }
  var S1 = numStep({short:'Copper after 2 A for 30 min', title:'The first order', scale:100, ok:[115, 125], label:'Mass of copper in grams',
    say:'With 2 amps for 10 minutes the shop deposits about 0.40 g of copper. How much copper does 2 amps for 30 minutes deposit? (in grams)',
    facts:['2 A for 10 min: about 0.40 g copper','Same shop, same copper sulfate solution'],
    named:[[[80, 80], 'Doubled instead of tripling (counted 10 + 10)'], [[13, 14], 'Divided by 3 instead of multiplying'], [[40, 40], 'Gave the same mass (thought more time deposits no more)'], [[400, 400], 'Multiplied by 10']],
    after:function(v){ return ['2 A for 1800 s: charge 3600 C', 'Mr Nwosu weighs the plate: ' + f2(cuMass(2, 1800)) + ' g', 'You said ' + f2(v) + ' g']; },
    keyLines:['Correct: about 1.2 g (3 times the time, 3 times the charge, 3 times the mass).','0.80: doubled. 0.13: divided. 0.40: ignored the longer time.','Consequence: the learner sees the measured mass, so later levels can be affected.']});
  var S2 = numStep({short:'Copper after 4 A for 10 min', title:'The rush order', scale:100, ok:[75, 85], label:'Mass of copper in grams',
    say:'Now 4 amps for 10 minutes, with the same solution. How much copper? (in grams)',
    facts:['2 A for 10 min: about 0.40 g copper','Now: 4 A for 10 min'],
    named:[[[40, 40], 'Gave the same mass (thought current does not matter)'], [[160, 160], 'Quadrupled (doubled twice)'], [[20, 20], 'Halved']],
    after:function(v){ return ['4 A for 600 s: charge 2400 C', 'Mr Nwosu weighs the plate: ' + f2(cuMass(4, 600)) + ' g', 'You said ' + f2(v) + ' g']; },
    keyLines:['Correct: about 0.80 g (twice the current, twice the charge).','0.40: current ignored. 1.6: doubled twice.','Sound and faulty methods give different numbers here.']});
  var P3 = [
    {t:'The mass depends on the total charge, which is current times time. Twice the current for the same time gives twice the charge.', ok:true},
    {t:'The mass depends on the time only. The current does not change how much metal is deposited.', tag:'Reasoned: mass depends on time only'},
    {t:'The mass depends on the current only. The time does not matter.', tag:'Reasoned: mass depends on current only'},
    {t:'I compared with the 0.40 g and guessed.', tag:'Reasoned: guessed from the example'}];
  var S3 = pickStep({short:'How you decided', title:'How did you decide?', opts:P3, order:[3, 0, 2, 1],
    say:'Think about the last two orders. Which is closest to what you did?', facts:['Pick the one closest to what you really did. There is no best style.'],
    keyLines:['Sound reason: mass is proportional to charge, and charge is current times time.','Compare with levels 1 and 2. A right number with a faulty reason is the learner a number alone hides.']});
  var S4 = numStep({short:'Same charge: silver then copper', title:'Silver and copper', scale:100, ok:[31, 33], label:'Mass of copper in grams',
    say:'A charge of 965 C deposits 1.08 g of silver from silver nitrate solution. The same charge goes through copper sulfate solution. About how much copper is deposited? (in grams)',
    facts:['Ag+ + e- gives Ag. Ag = 108','Cu2+ + 2e- gives Cu. Cu = 64'],
    named:[[[63, 65], 'Gave the same number of moles of copper as silver (ignored the 2 electrons)'], [[107, 109], 'Gave the same mass as silver'], [[15, 17], 'Halved the moles and then halved again']],
    after:function(v){ return ['Mr Nwosu weighs the copper plate: 0.32 g', 'You said ' + f2(v) + ' g']; },
    keyLines:['Correct: 0.32 g. 965 C is 0.01 mol of electrons. Silver needs 1 per atom (0.01 mol = 1.08 g). Copper needs 2 per atom (0.005 mol = 0.32 g).','0.64: same moles of copper as of silver. 1.08: same mass.']});
  var S5 = numStep({short:'Time to deposit 0.32 g copper at 2 A', title:'The last order', scale:10, ok:[4815, 4835], label:'Time in seconds',
    say:'How long, in seconds, does a current of 2 A need to deposit 0.32 g of copper? (Cu = 64)',
    facts:['1 mole of electrons carries 96500 C','Cu2+ + 2e- gives Cu'],
    named:[[[2405, 2420], 'Used 1 mole of electrons per mole of copper'], [[9645, 9655], 'Stopped at the charge and did not divide by the current'], [[78, 83], 'Left the time in minutes']],
    after:function(v){ var t = Math.max(0, v); return ['Mr Nwosu runs 2 A for ' + f2(t) + ' s', 'The plate gains ' + f2(cuMass(2, t)) + ' g. He wanted 0.32 g.']; },
    keyLines:['Correct: about 482 s. 0.32 / 64 = 0.005 mol Cu. Times 2 = 0.01 mol electrons. Times 96500 = 965 C. Divided by 2 A = 482.5 s.','241 s: 1 mole of electrons per mole of copper. 965: the charge. 8: minutes.']});
  SF.add({
    id:'ss2-chem-plating-shop', adventure:true, unit:'Order', icon:'plate',
    facts:['Mr Nwosu coats metal with copper by electrolysis','He controls the current and the time'],
    outro:'Mr Nwosu switches off the power for the day.',
    title:'The Plating Shop', topic:"Electrolysis and Faraday's laws: mass depends on charge, and charge is current times time", minutes:45, approved:null,
    intro:'Mr Nwosu runs a small plating shop in Owerri. He coats metal items with copper by electrolysis. He controls the <b>current</b> and the <b>time</b>. You are his helper. The numbers are made up, but the chemistry is real.',
    steps:[S1, S2, S3, S4, S5, {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher what you did when the current changed. This is optional.'}]
  });
})();
