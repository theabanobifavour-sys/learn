/* Struggle First game: ss2-chem-battery-stall. One file per game. Needs engine.js. */
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
  SF.ART.cell = '<rect x="10" y="12" width="28" height="26" rx="3" style="fill:#7FB7D6;' + SF.OUT + '"/><path d="M18 12V6M30 12V6M16 24h16" style="fill:none;' + SF.OUT + '"/>';
  var E = {Mg:-2.37, Zn:-0.76, Fe:-0.44, Pb:-0.13, Cu:0.34, Ag:0.80};
  var POT = {title:'Standard electrode potentials in volts (metal ion and metal)', rows:[['Mg2+ / Mg', '-2.37'], ['Zn2+ / Zn', '-0.76'], ['Fe2+ / Fe', '-0.44'], ['Pb2+ / Pb', '-0.13'], ['Cu2+ / Cu', '+0.34'], ['Ag+ / Ag', '+0.80']]};
  var P1 = [
    {t:'The zinc electrode', ok:true},
    {t:'The copper electrode', tag:'Thought the less reactive metal dissolves'},
    {t:'Both electrodes lose mass', tag:'Thought both electrodes lose mass'},
    {t:'Neither one. Only the solutions change.', tag:'Thought no electrode is used up'}];
  var S1 = pickStep({short:'Which electrode loses mass (Zn / Cu cell)', title:'The first kit', opts:P1, order:[1, 3, 0, 2],
    say:'A kit has a zinc rod in zinc sulfate solution and a copper rod in copper sulfate solution. A wire joins the rods and a salt bridge joins the solutions. Zinc is more reactive than copper. After a week, which rod has lost mass?',
    facts:['Zinc is more reactive than copper','The rods are joined by a wire','The solutions are joined by a salt bridge'],
    after:function(i){ return ['After a week: the zinc rod is thinner, the copper rod has a thicker coating of copper.']; },
    keyLines:['Correct: the zinc electrode (zinc is oxidised: Zn gives Zn2+ + 2e-).','Copper dissolves: reversed the reactivity. Both: unsure. Neither: thinks nothing is used up.']});
  var P2 = [
    {t:'From zinc to copper through the wire', ok:true},
    {t:'From copper to zinc through the wire', tag:'Reversed the direction of electron flow'},
    {t:'Through the salt bridge, from zinc to copper', tag:'Sent electrons through the salt bridge or solution'},
    {t:'Both ways at the same time', tag:'Said electrons move both ways'}];
  var S2 = pickStep({short:'Direction of electron flow in the wire', title:'The wire', opts:P2, order:[2, 0, 3, 1],
    say:'In the same kit, which way do the electrons move?', facts:['Zinc rod: Zn gives Zn2+ + 2e-','Copper rod: Cu2+ + 2e- gives Cu'],
    keyLines:['Correct: zinc to copper through the wire (electrons leave the zinc, which is the negative electrode).','Copper to zinc: reversed it. Salt bridge: electrons do not travel in solution, ions do.']});
  var P3 = [
    {t:'Zinc loses electrons more easily than copper does, so zinc is oxidised at the negative electrode.', ok:true},
    {t:'Zinc is heavier than copper, so it sinks into the solution.', tag:'Reasoned: used mass rather than electron loss'},
    {t:'The salt bridge pulls zinc off the rod.', tag:'Reasoned: salt bridge pulls zinc off'},
    {t:'It is on the left, so it dissolves first.', tag:'Reasoned: used position, not reactivity'}];
  var S3 = pickStep({short:'How you decided', title:'How did you decide?', opts:P3, order:[1, 3, 0, 2],
    say:'Which is closest to why the zinc dissolves and not the copper?', facts:['Pick the one closest to what you really thought. There is no best style.'],
    keyLines:['Sound reason: zinc loses electrons more easily (it is oxidised), so it is the negative electrode.','Compare with levels 1 and 2. A right answer with a faulty reason is the learner a number alone hides.']});
  var S4 = numStep({short:'Cell voltage: Mg / Ag', title:'A strong kit', scale:100, ok:[317, 317], label:'Cell voltage in volts', table:POT,
    say:'A kit joins a magnesium electrode and a silver electrode in solutions of their ions. What voltage does the voltmeter read? (in volts)',
    facts:['Use the table of potentials','Magnesium is more reactive than silver'],
    named:[[[157, 157], 'Subtracted the smaller size from the larger (2.37 - 0.80)'], [[-317, -317], 'Gave the voltage a negative sign'], [[80, 80], 'Gave the silver value only'], [[237, 237], 'Gave the magnesium size only']],
    after:function(v){ return ['The voltmeter reads 3.17 V', 'You said ' + f2(v) + ' V']; },
    keyLines:['Correct: 3.17 V (0.80 minus -2.37).','NOTE: adding the sizes of the two values (0.80 + 2.37) gives 3.17 here too, by luck, because one value is positive. Level 5 separates the two methods.']});
  var S5 = numStep({short:'Cell voltage: Fe / Pb', title:'A weak kit', scale:100, ok:[31, 31], label:'Cell voltage in volts', table:POT,
    say:'Now a kit with an iron electrode and a lead electrode in solutions of their ions. What voltage does the voltmeter read? (in volts)',
    facts:['Use the table of potentials','Both values are negative'],
    named:[[[57, 57], 'Added the sizes of the two values (0.44 + 0.13)'], [[-31, -31], 'Gave a negative voltage (took the wrong electrode as the positive one)'], [[44, 44], 'Gave the iron value only'], [[13, 13], 'Gave the lead value only']],
    after:function(v){ return ['The voltmeter reads 0.31 V. The iron rod is the negative electrode.', 'You said ' + f2(v) + ' V']; },
    keyLines:['Correct: 0.31 V (-0.13 minus -0.44).','0.57: added the sizes. This slip hid on level 4 and shows here.']});
  SF.add({
    id:'ss2-chem-battery-stall', adventure:true, unit:'Kit', icon:'cell',
    facts:['Mr Ikenna sells battery kits at his stall','Each kit has two metals, a wire and a salt bridge'],
    outro:'Mr Ikenna packs the stall away for the night.',
    title:'The Battery Stall', topic:'Electrochemical cells: the more reactive metal is the negative electrode, and cell voltage is a difference', minutes:45, approved:null,
    intro:'Mr Ikenna sells home-made battery kits at a stall in Owerri. Each kit has two metals in solutions of their ions, joined by a <b>wire</b> and a <b>salt bridge</b>. You are his helper. The voltage values are standard textbook values.',
    steps:[S1, S2, S3, S4, S5, {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher what you did to find the voltage. This is optional.'}]
  });
})();
