/* Struggle First game: ss2-phys-echo-hill. One file per game. Needs engine.js. */
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
  SF.ART.hill = '<path d="M4 40L20 12l10 14 6-8 8 22z" style="fill:#9BC38B;' + SF.OUT + '"/>';
  var S1 = numStep({short:'Distance to a cliff (echo after 2 s)', title:'The echo from the cliff', scale:1, ok:[340, 340], label:'Distance to the cliff in metres',
    say:'A boy shouts toward a cliff and hears his echo 2 seconds later. The speed of sound is 340 m/s. How far away is the cliff? (in metres)',
    facts:['Speed of sound: 340 m/s','The echo comes back after 2 s'],
    named:[[[680, 680], 'Forgot the return trip (used the whole time for one way)'], [[170, 170], 'Halved the distance twice'], [[170, 170], 'Halved twice']],
    after:function(v){ return ['The sound goes to the cliff and back: 2 x ' + v + ' m = ' + (2 * v) + ' m.', 'That takes ' + (Math.round(2 * v / 340 * 100) / 100) + ' s. The echo took 2 s.']; },
    keyLines:['Correct: 340 m (the sound travels to the cliff and back, so 680 m in 2 s).','680: used the whole time for one way.']});
  var S2 = numStep({short:'Sea depth by sonar (echo after 0.4 s, 1500 m/s)', title:'The ship\'s sonar', scale:1, ok:[300, 300], label:'Depth in metres',
    say:'A ship sends a sound pulse down. The echo from the seabed comes back after 0.4 seconds. Sound travels at 1500 m/s in sea water. How deep is the water? (in metres)',
    facts:['Speed of sound in sea water: 1500 m/s','The echo returns after 0.4 s'],
    named:[[[600, 600], 'Forgot the return trip'], [[150, 150], 'Halved twice'], [[3750, 3750], 'Divided the speed by the time']],
    after:function(v){ return ['The pulse goes down and back: 2 x ' + v + ' m = ' + (2 * v) + ' m.', 'That takes ' + (Math.round(2 * v / 1500 * 1000) / 1000) + ' s. The echo took 0.4 s.']; },
    keyLines:['Correct: 300 m (1500 x 0.4 = 600 m there and back).','600: forgot to halve.']});
  var P3 = [
    {t:'The sound goes to the surface and back, so the distance to the surface is half of speed x time.', ok:true},
    {t:'Distance is speed x time. The echo time is for one way.', tag:'Reasoned: echo time is for one way'},
    {t:'I divided the speed by the time.', tag:'Reasoned: divided speed by time'},
    {t:'I used the formula from the example without checking.', tag:'Reasoned: copied the example'}];
  var S3 = pickStep({short:'How you decided', title:'How did you decide?', opts:P3, order:[2, 0, 3, 1],
    say:'Think about the cliff and the sea. Which is closest to what you did?', facts:['Pick the one closest to what you really did. There is no best style.'],
    keyLines:['Sound reason: an echo travels there and back, so use half the total distance.','Compare with levels 1 and 2. A right number with a faulty reason is the learner a number hides.']});
  var S4 = numStep({short:'Fundamental frequency of an open pipe (0.5 m)', title:'The open flute', scale:1, ok:[340, 340], label:'Frequency in Hz',
    say:'A flute is a pipe open at both ends and 0.5 m long. The speed of sound in air is 340 m/s. What is the frequency of its lowest note? (in Hz)',
    facts:['Open pipe: wavelength = 2 x length','Speed of sound: 340 m/s'],
    named:[[[170, 170], 'Used the closed pipe rule (quarter wavelength)'], [[680, 680], 'Used one whole wavelength equal to the length'], [[1360, 1360], 'Used a quarter of the length']],
    after:function(v){ return ['The flute plays its lowest note: 340 Hz.', 'You said ' + v + ' Hz']; },
    keyLines:['Correct: 340 Hz (wavelength = 2 x 0.5 = 1 m; f = 340 / 1).','170: closed pipe rule. 680: wavelength equal to length.']});
  var S5 = numStep({short:'Fundamental frequency of a closed pipe (0.5 m)', title:'The closed pipe', scale:1, ok:[170, 170], label:'Frequency in Hz',
    say:'Now a pipe closed at one end, also 0.5 m long. What is the frequency of its lowest note? (in Hz)',
    facts:['Closed pipe: wavelength = 4 x length','Speed of sound: 340 m/s'],
    named:[[[340, 340], 'Used the open pipe rule (half wavelength)'], [[680, 680], 'Used one whole wavelength equal to the length'], [[85, 85], 'Used eight times the length']],
    after:function(v){ return ['The closed pipe plays its lowest note: 170 Hz.', 'It is one octave lower than the open pipe of the same length.', 'You said ' + v + ' Hz']; },
    keyLines:['Correct: 170 Hz (wavelength = 4 x 0.5 = 2 m; f = 340 / 2).','340: open pipe rule applied to a closed pipe.']});
  SF.add({
    id:'ss2-phys-echo-hill', adventure:true, unit:'Job', icon:'hill',
    facts:['Echoes come back after the sound travels there and back','Sound travels at about 340 m/s in air'],
    outro:'The hill goes quiet. The day is over.',
    title:'The Echo Hill', topic:'Application of sound waves: echoes, sonar and wind instruments', minutes:45, approved:null,
    intro:'A group of students from Owerri visits a hill with a cliff that gives a loud echo. Then they go to a river to try a ship\'s sonar and to a music shop to test pipes and flutes. You are helping them. The numbers are made up, but the physics is real.',
    steps:[S1, S2, S3, S4, S5, {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher what you did with the echo time. This is optional.'}]
  });
})();
