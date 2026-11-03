/* Struggle First game: ss2-phys-mast-drop. One file per game. Needs engine.js. */
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
  SF.ART.mast = '<path d="M24 4L14 44h20z" style="fill:#D9D9D9;' + SF.OUT + '"/><path d="M19 24h10M16 34h16" style="fill:none;' + SF.OUT + '"/>';
  var S1 = numStep({short:'Fall time from an 80 m mast', title:'The dropped spanner', scale:100, ok:[395, 405], label:'Time in seconds',
    say:'Ifeanyi works at the top of an 80 m telecom mast. He drops a spanner from rest. Ignore air. Use g = 10 m/s squared. How long does it take to reach the ground? (in seconds)',
    facts:['Height: 80 m','Dropped from rest','g = 10 m/s squared, air ignored'],
    named:[[[1600, 1600], 'Forgot the square root (gave 2h/g)'], [[800, 800], 'Divided the height by g'], [[4000, 4000], 'Halved the height and stopped']],
    after:function(v){ return ['The spanner hits the ground after 4 s.', 'You said ' + v + ' s']; },
    keyLines:['Correct: 4 s (h = half g t squared, so t = square root of 2h/g = square root of 16).','16: stopped before the square root. 8: divided height by g.']});
  var P2 = [
    {t:'They land together, because the pull of gravity gives every falling body the same acceleration.', ok:true},
    {t:'The 2 kg wrench lands first, because it is heavier.', tag:'Reasoned: heavier objects fall faster'},
    {t:'The 0.5 kg bolt lands first, because it is lighter and easier to move.', tag:'Reasoned: lighter objects fall faster'},
    {t:'I guessed.', tag:'Reasoned: guessed'}];
  var S2 = pickStep({short:'Wrench and bolt dropped together', title:'Two tools', opts:P2, order:[1, 3, 0, 2],
    say:'Ifeanyi drops a 2 kg wrench and a 0.5 kg bolt together from the same height. Air resistance is small enough to ignore. Which is true?', facts:['Same height, same moment','Air resistance ignored'],
    after:function(i){ return ['A camera at the bottom records both.', 'Both hit the ground at the same time.']; },
    keyLines:['Correct: both land together. Mass does not change the acceleration in free fall.','Heavier first: a common belief from everyday life, where air slows light things.']});
  var S3 = numStep({short:'Horizontal distance of a ball rolled off the mast', title:'The rolling ball', scale:100, ok:[2395, 2405], label:'Distance from the base in metres',
    say:'Ifeanyi rolls a ball off the edge of the mast platform. It leaves horizontally at 6 m/s. The mast is 80 m high. How far from the base does it land? (in metres)',
    facts:['Leaves the edge horizontally at 6 m/s','Height: 80 m','Fall time for 80 m: 4 s (as in level 1)'],
    named:[[[600, 600], 'Gave the horizontal speed as the distance'], [[48000, 48000], 'Multiplied speed by height'], [[150, 150], 'Divided the speed by the time']],
    after:function(v){ return ['The ball is in the air for 4 s.', 'In that time it moves 6 x 4 = 24 m sideways.', 'You said ' + v + ' m']; },
    keyLines:['Correct: 24 m (distance = horizontal speed x time in the air).','6: stopped at the speed. 480: used height instead of time.']});
  var P4 = [
    {t:'They land at the same time, because the sideways motion does not change the falling motion.', ok:true},
    {t:'The dropped bolt lands first, because the thrown bolt has to travel farther.', tag:'Thought the sideways path makes it take longer'},
    {t:'The thrown bolt lands first, because it has more speed.', tag:'Thought extra speed makes it land sooner'},
    {t:'It depends on how hard the second bolt is thrown.', tag:'Thought the throw speed changes the fall time'}];
  var S4 = pickStep({short:'Dropped bolt and thrown bolt', title:'Drop and throw', opts:P4, order:[3, 0, 2, 1],
    say:'From the top of the mast, Ifeanyi drops one bolt and, at the same moment, throws another bolt sideways. Which lands first?', facts:['Same height, same moment','One bolt dropped, one thrown sideways'],
    after:function(i){ return ['Ifeanyi watches both from the ground.', 'Both hit the ground at the same time.']; },
    keyLines:['Correct: the same time. Falling is set by height and g alone. The sideways speed only decides where it lands.','This is the key idea of projectiles: the two motions are independent.']});
  var S5 = numStep({short:'Maximum height of a ball thrown up at 30 m/s', title:'The ball thrown up', scale:100, ok:[4495, 4505], label:'Maximum height in metres',
    say:'At ground level Ifeanyi throws a ball straight up at 30 m/s. Ignore air. Use g = 10 m/s squared. How high does it rise? (in metres)',
    facts:['Starts at 30 m/s upward','At the top the speed is 0','g = 10 m/s squared'],
    named:[[[9000, 9000], 'Used v squared over g (forgot to halve)'], [[90000, 90000], 'Gave v squared'], [[3000, 3000], 'Gave the starting speed'], [[300, 300], 'Divided the speed by g (time to the top)']],
    after:function(v){ return ['The ball slows by 10 m/s every second and stops after 3 s.', 'It rises 45 m.', 'You said ' + v + ' m']; },
    keyLines:['Correct: 45 m (v squared = u squared minus 2gh, so h = 900 / 20).','90: forgot the 2. 3: that is the time to the top, not the height.']});
  SF.add({
    id:'ss2-phys-mast-drop', adventure:true, unit:'Job', icon:'mast',
    facts:['Ifeanyi works on a telecom mast in Owerri','g = 10 m/s squared and air is ignored'],
    outro:'Ifeanyi packs up his tools and climbs down.',
    title:'The Mast Drop', topic:'Projectiles and falling bodies', minutes:45, approved:null,
    intro:'Ifeanyi climbs telecom masts in Owerri and tests what happens when things fall or are thrown from the top. You are his helper on the ground. The numbers are made up, but the physics is real.',
    steps:[S1, S2, S3, S4, S5, {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher what you thought about the dropped and thrown bolt. This is optional.'}]
  });
})();
