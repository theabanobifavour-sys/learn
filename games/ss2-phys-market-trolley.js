/* Struggle First game: ss2-phys-market-trolley. One file per game. Needs engine.js. */
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
  SF.ART.cart = '<rect x="6" y="16" width="30" height="14" rx="3" style="fill:#E3A857;' + SF.OUT + '"/><circle cx="14" cy="36" r="5" style="fill:#555;' + SF.OUT + '"/><circle cx="30" cy="36" r="5" style="fill:#555;' + SF.OUT + '"/><path d="M36 20h8" style="fill:none;' + SF.OUT + '"/>';
  var S1 = numStep({short:'Acceleration of a 40 kg loaded trolley', title:'The loaded trolley', scale:100, ok:[295, 305], label:'Acceleration in m/s squared',
    say:'Chidi pushes a loaded market trolley of total mass 40 kg. The net force on it is 120 N. What is its acceleration? (in m/s squared)',
    facts:['Mass: 40 kg','Net force: 120 N'],
    named:[[[33, 33], 'Divided mass by force'], [[480000, 480000], 'Multiplied force by mass'], [[16000, 16000], 'Added force and mass']],
    after:function(v){ return ['Chidi times the trolley with his phone.', 'It speeds up by 3 m/s every second.', 'You said ' + v + ' m/s squared']; },
    keyLines:['Correct: 3 m/s squared (F = ma, so a = 120 / 40).','0.33: divided the wrong way round. 4800: multiplied.']});
  var P2 = [
    {t:'The passengers keep moving forward because no force acts to stop them yet, while the keke stops.', ok:true},
    {t:'A forward force from the brakes pushes the passengers forward.', tag:'Thought the brakes push passengers forward'},
    {t:'The passengers have a force pushing them forward that is bigger than the force on the keke.', tag:'Thought a forward force on the passenger is needed to keep moving'},
    {t:'I guessed.', tag:'Reasoned: guessed'}];
  var S2 = pickStep({short:'Why passengers lurch forward when a keke brakes', title:'The sudden stop', opts:P2, order:[1, 3, 0, 2],
    say:'A keke brakes suddenly and the passengers lurch forward. Which explanation is best?', facts:['The keke was moving at steady speed before braking'],
    after:function(i){ return ['Chidi replays the video of the stop.', 'The keke slows down. The passengers carry on at the old speed until the seat belt or seat stops them.']; },
    keyLines:['Correct: a body keeps its motion unless a force acts on it (Newton\'s first law, inertia).','Forward push from the brakes: no such force exists. The brakes act on the keke, not forward on the passenger.']});
  var S3 = numStep({short:'Momentum of a 1200 kg car at 15 m/s', title:'The moving car', scale:100, ok:[1799900, 1800100], label:'Momentum in kg m/s',
    say:'Chidi watches a 1200 kg car move at 15 m/s. What is its momentum? (in kg m/s)',
    facts:['Mass: 1200 kg','Speed: 15 m/s','Momentum = mass x velocity'],
    named:[[[8000, 8000], 'Divided mass by speed'], [[121500, 121500], 'Added mass and speed'], [[1500, 1500], 'Gave the speed instead of the momentum']],
    after:function(v){ return ['1200 x 15 = 18000.', 'You said ' + v + ' kg m/s']; },
    keyLines:['Correct: 18000 kg m/s (p = mv).','80: divided. 1215: added.']});
  var S4 = numStep({short:'Two trolleys that stick together after a collision', title:'The sticking trolleys', scale:100, ok:[195, 205], label:'Speed after the collision in m/s',
    say:'A 2 kg trolley moving at 3 m/s hits a 1 kg trolley that is standing still. They stick together. What is their speed after the collision? (in m/s)',
    facts:['2 kg trolley at 3 m/s','1 kg trolley at rest','They move off together'],
    named:[[[300, 300], 'Kept the original speed'], [[600, 600], 'Divided by the mass that was standing still'], [[150, 150], 'Averaged the two speeds']],
    after:function(v){ return ['Momentum before: 2 x 3 = 6 kg m/s.', 'Momentum after: (2 + 1) x v = 6, so v = 2 m/s.', 'You said ' + v + ' m/s']; },
    keyLines:['Correct: 2 m/s (total momentum before equals total momentum after).','3: forgot the extra mass. 1.5: averaged the speeds.']});
  var P5 = [
    {t:'The forces are equal in size and opposite in direction.', ok:true},
    {t:'The truck pushes on the bicycle with a bigger force.', tag:'Thought the bigger object exerts the bigger force'},
    {t:'The bicycle is damaged more, so the force on it is bigger.', tag:'Confused damage with force size'},
    {t:'The forces depend on which one was moving.', tag:'Thought the moving object exerts the bigger force'}];
  var S5 = pickStep({short:'Truck hits a bicycle: compare the forces', title:'The truck and the bicycle', opts:P5, order:[2, 0, 3, 1],
    say:'A truck hits a bicycle. During the crash, how does the force the truck puts on the bicycle compare with the force the bicycle puts on the truck?', facts:['Think about the moment of contact'],
    after:function(i){ return ['A sensor on each vehicle records the force.', 'The two forces are equal and opposite. The bicycle is damaged more because it has far less mass, so the same force gives it a much bigger acceleration.']; },
    keyLines:['Correct: equal and opposite (Newton\'s third law). The effects differ because the masses differ.','Bigger force on the bike: a very common belief. Damage shows the effect, not the size of the force.']});
  SF.add({
    id:'ss2-phys-market-trolley', adventure:true, unit:'Job', icon:'cart',
    facts:['Chidi works in a market and helps with deliveries in Owerri','Newton\'s laws and momentum'],
    outro:'Chidi parks the trolley for the night.',
    title:'The Market Trolley', topic:'Newton\'s laws of motion and conservation of linear momentum', minutes:45, approved:null,
    intro:'Chidi pushes loaded trolleys and rides kekes around a busy market in Owerri. He keeps noticing how things start, stop and crash. You are his helper. The numbers are made up, but the physics is real.',
    steps:[S1, S2, S3, S4, S5, {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher what you thought about the truck and the bicycle. This is optional.'}]
  });
})();
