/* Struggle First game: ss2-maths-power-gate. One file per game. Needs engine.js. */
(function(){
  var h = SF.h, speech = SF.speech, setSay = SF.setSay, lockBtn = SF.lockBtn, burst = SF.burst;
  SF.ART.gate = '<rect x="6" y="10" width="6" height="32" style="fill:#7A4A2B;' + SF.OUT + '"/><rect x="36" y="10" width="6" height="32" style="fill:#7A4A2B;' + SF.OUT + '"/><path d="M12 16h24M12 24h24M12 32h24" style="fill:none;' + SF.OUT + '"/>';

  function injectCss(){
    if (document.getElementById('pg-css')) return;
    var s = document.createElement('style'); s.id = 'pg-css';
    s.textContent = [
      '.pg-machine{border:1.5px solid var(--line);border-radius:12px;background:var(--bg);padding:10px 14px;display:flex;flex-direction:column;gap:4px}',
      '.pg-machine .pg-row{display:flex;justify-content:space-between;gap:8px;font:600 16px var(--f-mono,ui-monospace,monospace)}',
      '.pg-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}',
      '.pg-chip{min-height:48px;padding:6px;border:1.5px solid var(--line);border-radius:10px;background:var(--surface);color:var(--fg);font:700 18px var(--f-mono,ui-monospace,monospace);cursor:pointer;text-align:center}',
      '.pg-chip.sel{border-color:var(--accent);background:var(--accent-bg,var(--bg));outline:2px solid var(--accent)}',
      '.pg-chip:disabled{cursor:default;opacity:.9}',
      '.pg-run{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px}',
      '.pg-run li{border-top:1px solid var(--line);padding-top:6px;font:500 15px var(--f-mono,ui-monospace,monospace)}',
      '.pg-prac{border:1.5px dashed var(--line);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:6px}',
      '.pg-prac input[type=range]{width:100%;min-height:44px;accent-color:var(--accent)}',
      '.pg-opt{display:block;width:100%;text-align:left;min-height:52px;padding:12px 14px;border:1.5px solid var(--line);background:var(--surface);color:var(--fg);border-radius:10px;font:inherit;cursor:pointer}',
      '.pg-opt.sel{border-color:var(--accent);background:var(--accent-bg,var(--bg));outline:2px solid var(--accent)}',
      '.pg-opts{display:flex;flex-direction:column;gap:10px}'
    ].join('\n');
    document.head.appendChild(s);
  }
  function rd(c){ return c < 0 ? 'the setting minus ' + (-c) : 'the setting plus ' + c; }
  function out(step, x){ var a = x + step.c1, b = x + step.c2; return {a:a, b:b, r:a * b}; }

  /* ---------- practice machine (not counted) ---------- */
  function practice(){
    var sl = h('input', {type:'range', min:'-4', max:'8', step:'1', value:'1', 'aria-label':'Practice setting'}), t = h('div', {class:'small'}, '');
    function upd(){ var x = +sl.value, a = x - 6, b = x + 2; t.innerHTML = 'Setting <b>' + x + '</b>: readings <b>' + a + '</b> and <b>' + b + '</b>. The machine shows <b>' + (a * b) + '</b>.'; }
    sl.addEventListener('input', upd); upd();
    return h('div', {class:'pg-prac'}, h('div', {class:'small muted'}, 'Practice machine (not counted). It has other readings: the setting minus 6, and the setting plus 2. Slide the setting.'), sl, t);
  }

  /* ---------- mechanic: tap every setting that opens the gate ---------- */
  function buildGate(host, api, step){
    injectCss();
    var sp = speech(step.say), lock = lockBtn('I am sure'), chips = [], sel = {}, nSel = 0, list = h('ul', {class:'pg-run'}), grid = h('div', {class:'pg-grid'});
    var machine = h('div', {class:'pg-machine', role:'img', 'aria-label':'The machine multiplies two readings'},
      h('div', {class:'pg-row'}, h('span', {}, 'Reading A'), h('span', {}, rd(step.c1))),
      h('div', {class:'pg-row'}, h('span', {}, 'Reading B'), h('span', {}, rd(step.c2))),
      h('div', {class:'pg-row'}, h('span', {}, 'Result'), h('span', {}, 'A times B')),
      h('div', {class:'pg-row'}, h('span', {}, 'Gate opens at result'), h('span', {}, String(step.target))));
    for (var x = step.lo; x <= step.hi; x++) (function(x){
      var b = h('button', {class:'pg-chip', type:'button', 'aria-pressed':'false'}, String(x));
      b.addEventListener('click', function(){
        if (api.locked) return;
        sel[x] = !sel[x]; nSel += sel[x] ? 1 : -1;
        b.classList.toggle('sel', !!sel[x]); b.setAttribute('aria-pressed', sel[x] ? 'true' : 'false');
        lock.disabled = nSel === 0;
        setSay(sp, nSel + ' setting' + (nSel === 1 ? '' : 's') + ' chosen. You can change your mind until you lock in.', '');
      });
      chips.push(b); grid.append(b);
    })(x);
    lock.addEventListener('click', function(){
      if (api.locked || !nSel) return;
      var bits = '', chosen = [];
      for (var v = step.lo; v <= step.hi; v++) { bits += sel[v] ? '1' : '0'; if (sel[v]) chosen.push(v); }
      api.submit('b' + bits, 1800 + chosen.length * 900);
      lock.disabled = true; chips.forEach(function(c){ c.disabled = true; });
      setSay(sp, 'The workshop runs your settings through the machine one by one.', '');
      chosen.forEach(function(v, k){
        setTimeout(function(){ var o = out(step, v); list.append(h('li', {}, 'Setting ' + v + ': readings ' + o.a + ' and ' + o.b + ', result ' + o.r)); }, 500 + k * 800);
      });
      setTimeout(function(){ burst(host); }, 500 + chosen.length * 800);
    });
    host.append(sp);
    if (step.practice) host.append(practice());
    host.append(machine, h('div', {class:'small muted'}, 'Tap every setting that opens the gate.'), grid, lock, list);
  }
  function setOf(step, a){
    var s = String(a).slice(1), n = step.hi - step.lo + 1; if (s.length !== n) return null;
    var r = []; for (var i = 0; i < n; i++) if (s[i] === '1') r.push(step.lo + i); return r;
  }
  function same(A, B){ return A.length === B.length && A.every(function(v){ return B.indexOf(v) >= 0; }); }
  function gateJudge(step){
    return function(a){
      var S = setOf(step, a); if (!S) return {tag:'Answer could not be read'};
      if (same(S, step.correct)) return {ok:true};
      for (var i = 0; i < step.named.length; i++) if (same(S, step.named[i].set)) return {tag:step.named[i].tag};
      if (S.length < step.correct.length && S.every(function(v){ return step.correct.indexOf(v) >= 0; })) return {tag:'Found only one of the settings that open the gate'};
      return {tag:'Chose settings that do not open the gate (not a listed slip)'};
    };
  }
  function gateShow(step){ return function(a){ var S = setOf(step, a); return S ? 'Chose settings ' + (S.length ? S.join(', ') : 'none') : 'Unreadable'; }; }

  /* ---------- mechanic: choose the machine's rule (pick with a consequence) ---------- */
  function buildRule(host, api, step){
    injectCss();
    var sp = speech(step.say), sel = null, btns = [], lock = lockBtn('I am sure'), opts = h('div', {class:'pg-opts'}), res = h('ul', {class:'pg-run'});
    step.order.forEach(function(i){
      var b = h('button', {class:'pg-opt', type:'button'}, step.options[i].t);
      b.addEventListener('click', function(){ if (api.locked) return; btns.forEach(function(x){ x.classList.remove('sel'); }); b.classList.add('sel'); sel = i; lock.disabled = false; });
      btns.push(b); opts.append(b);
    });
    lock.addEventListener('click', function(){
      if (api.locked || sel === null) return; api.submit('p' + sel, 4200);
      lock.disabled = true; btns.forEach(function(x){ x.disabled = true; });
      setSay(sp, 'The workshop builds your machine and tries settings 3 and 4.', '');
      var o = step.options[sel];
      [3, 4].forEach(function(x, k){ setTimeout(function(){ res.append(h('li', {}, 'Setting ' + x + ': your machine shows ' + o.f(x))); if (k === 1) burst(host); }, 600 + k * 900); });
    });
    host.append(sp, opts, lock, res);
  }
  function buildPick(host, api, step){
    injectCss();
    var sp = speech(step.say), sel = null, btns = [], lock = lockBtn('I am sure'), opts = h('div', {class:'pg-opts'});
    step.order.forEach(function(i){
      var b = h('button', {class:'pg-opt', type:'button'}, step.options[i].t);
      b.addEventListener('click', function(){ if (api.locked) return; btns.forEach(function(x){ x.classList.remove('sel'); }); b.classList.add('sel'); sel = i; lock.disabled = false; });
      btns.push(b); opts.append(b);
    });
    lock.addEventListener('click', function(){ if (api.locked || sel === null) return; api.submit('p' + sel, 1600); lock.disabled = true; btns.forEach(function(x){ x.disabled = true; }); setSay(sp, 'Thank you. The supervisor has written that down.', ''); });
    host.append(sp, opts, lock);
  }
  function pickJudge(step){ return function(a){ var o = step.options[+String(a).slice(1)]; if (!o) return {tag:'Answer could not be read'}; return o.ok ? {ok:true} : {tag:o.tag}; }; }
  function pickShow(step){ return function(a){ var o = step.options[+String(a).slice(1)]; return o ? 'Chose: ' + o.t : 'Unreadable'; }; }

  var L1 = {c1:-3, c2:4, target:0, lo:-8, hi:8, correct:[-4, 3], named:[
    {set:[-3, 4], tag:'Took the number inside each reading as the setting, with the sign the wrong way round'},
    {set:[3, 4], tag:'Got the first setting but copied the number of the second reading without its sign change'},
    {set:[-3, -4], tag:'Copied the numbers from the readings, both with the wrong sign'},
    {set:[3], tag:'Stopped after the first reading (found only one setting)'},
    {set:[-4], tag:'Stopped after the second reading (found only one setting)'}]};
  var L2 = {c1:-2, c2:-5, target:0, lo:-6, hi:9, correct:[2, 5], named:[
    {set:[-2, -5], tag:'Took the number inside each reading as the setting, with the sign the wrong way round'},
    {set:[2, -5], tag:'Changed the sign for the first reading but not the second'},
    {set:[-2, 5], tag:'Changed the sign for the second reading but not the first'},
    {set:[2], tag:'Stopped after the first reading (found only one setting)'},
    {set:[5], tag:'Stopped after the second reading (found only one setting)'}]};
  var L3 = {c1:-2, c2:-5, target:10, lo:-3, hi:16, correct:[0, 7], named:[
    {set:[12, 15], tag:'Set each reading equal to the result (reading = 10)'},
    {set:[4, 10], tag:'Split the result 10 into 2 times 5 and set each reading to one of them'},
    {set:[2, 5], tag:'Reused the settings that give 0 (ignored that the gate now needs 10)'},
    {set:[0], tag:'Found only one of the settings that open the gate'},
    {set:[7], tag:'Found only one of the settings that open the gate'}]};

  var PICK = {
    type:'game', short:'How you decided', title:'How did you decide?', build:buildPick,
    say:'Think about the last level, where the gate opened at result 10. Which is closest to what you did?',
    facts:['Pick the one closest to how you really worked. Be honest, there is no best style to pick.'],
    options:[
      {t:'If the result must be 0, one of the readings has to be 0. For a result of 10 I could not do that, so I first had to rework it so the result is 0 again.', ok:true},
      {t:'I set each reading equal to the result.', tag:'Reasoned: set each reading equal to the result'},
      {t:'I tried numbers until some worked and trusted what I found.', tag:'Reasoned: tried numbers and trusted them (no way to know all settings were found)'},
      {t:'The settings for 0 and for 10 should be the same, because the readings are the same.', tag:'Reasoned: same readings means same settings whatever the result'}
    ],
    order:[2, 0, 3, 1],
    keyLines:['Sound reason: the zero rule only works when the result is 0, so rearrange first (x squared minus 7x equals 0, so x times (x minus 7) equals 0).','Compare with the level 3 answer. A learner who found 0 and 7 but picked a faulty reason, or who found 12 and 15 but picked the sound reason, is the learner a final answer hides. A stated reason is one signal: learners may pick the reason that sounds smartest.']
  };
  PICK.show = pickShow(PICK); PICK.judge = pickJudge(PICK);

  var RULE = {
    type:'game', short:'Build the machine (settings 3 and 4)', title:'Build a machine', build:buildRule,
    say:'The gate must open at settings 3 and 4, and nowhere else. Pick the machine whose result is 0 for those settings.',
    facts:['The machine shows its result for any setting x','The gate opens only when the result is 0'],
    options:[
      {t:'x squared - 7x + 12', ok:true, f:function(x){ return x * x - 7 * x + 12; }},
      {t:'x squared + 7x + 12', tag:'Sign error on the middle term (settings would be -3 and -4)', f:function(x){ return x * x + 7 * x + 12; }},
      {t:'x squared - 12x + 7', tag:'Swapped the sum and the product of the settings', f:function(x){ return x * x - 12 * x + 7; }},
      {t:'x squared - x + 12', tag:'Used the difference of the settings instead of their sum', f:function(x){ return x * x - x + 12; }}
    ],
    order:[3, 0, 2, 1]
  };
  RULE.show = pickShow(RULE); RULE.judge = pickJudge(RULE);
  RULE.keyLines = ['Correct: x squared - 7x + 12 (the settings add to 7 and multiply to 12, so it equals (x - 3)(x - 4)).','+7x: the sign slip. x squared - 12x + 7: sum and product swapped. x squared - x + 12: difference used as the sum.','After locking, the machine tries settings 3 and 4, so the learner sees what their own machine shows. They are never told right or wrong.'];

  function fin(st){ st.judge = gateJudge(st); st.show = gateShow(st); return st; }
  SF.add({
    id:'ss2-maths-power-gate', adventure:true, unit:'Level', icon:'gate',
    facts:['The machine multiplies two readings','The gate opens when the result is the number shown'],
    outro:'The supervisor locks up the workshop. The gate is working.',
    title:'The Power Gate', topic:'Quadratic equations 1: when a product is zero, one factor is zero', minutes:45, approved:null,
    intro:'A workshop in Owerri has a gate that is controlled by a machine. You choose a <b>setting</b>. The machine works out two readings from your setting and <b>multiplies them together</b>. The gate opens only when the result is the number shown on the machine. The supervisor wants to know every setting that opens the gate. You are the helper. The numbers in this game are made up.',
    steps:[
      fin({type:'game', short:'Settings that give result 0 (readings -3 and +4)', title:'The first gate', build:buildGate, c1:L1.c1, c2:L1.c2, target:L1.target, lo:L1.lo, hi:L1.hi, correct:L1.correct, named:L1.named, practice:true,
        facts:['Reading A: the setting minus 3','Reading B: the setting plus 4','The gate opens when the result is 0'],
        say:'Tap every setting that makes the machine show 0, then press I am sure.',
        
        keyLines:['Correct: 3 and -4. (x - 3)(x + 4) = 0, so x = 3 or x = -4.','3 and 4, or -3 and 4, or -3 and -4: sign slips, copying the numbers inside the readings. One setting only: stopped after the first reading.','Practice machine uses other readings and shows only the result number.']}),
      fin({type:'game', short:'Settings that give result 0 (readings -2 and -5)', title:'The second gate', build:buildGate, c1:L2.c1, c2:L2.c2, target:L2.target, lo:L2.lo, hi:L2.hi, correct:L2.correct, named:L2.named,
        facts:['Reading A: the setting minus 2','Reading B: the setting minus 5','The gate opens when the result is 0'],
        say:'A new machine. Tap every setting that makes it show 0.',
        
        keyLines:['Correct: 2 and 5.','-2 and -5: sign slips. 2 and -5, or -2 and 5: changed only one sign.']}),
      fin({type:'game', short:'Settings that give result 10 (same readings)', title:'The third gate', build:buildGate, c1:L3.c1, c2:L3.c2, target:L3.target, lo:L3.lo, hi:L3.hi, correct:L3.correct, named:L3.named,
        facts:['Reading A: the setting minus 2','Reading B: the setting minus 5','The gate opens when the result is 10'],
        say:'Same readings as the second gate, but this gate opens at result 10. Tap every setting that opens it.',
        
        keyLines:['Correct: 0 and 7 ((x - 2)(x - 5) = 10 gives x squared - 7x = 0, so x = 0 or x = 7). Check: at 0 the readings are -2 and -5 (result 10); at 7 they are 5 and 2 (result 10).','12 and 15: set each reading equal to 10. 4 and 10: split 10 into 2 times 5. 2 and 5: reused the settings for 0.','Trap level. The sound and faulty methods give different settings.']}),
      PICK,
      RULE,
      {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher what you did when the gate opened at result 10. This is optional.'}
    ]
  });
})();
