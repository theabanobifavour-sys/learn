/* Struggle First game: ss2-phys-talking-drum. One file per game. Needs engine.js. */
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
  SF.ART.drum = '<ellipse cx="24" cy="14" rx="16" ry="6" style="fill:#E3C28D;' + SF.OUT + '"/><path d="M8 14v18c0 4 7 7 16 7s16-3 16-7V14" style="fill:#A8743A;' + SF.OUT + '"/>';
  var S1 = numStep({short:'Wavelength of a 170 Hz note in air', title:'The first drum', scale:100, ok:[200, 200], label:'Wavelength in metres',
    say:'In air, sound travels at 340 m/s. A drum gives a note of frequency 170 Hz. What is its wavelength? (in metres)',
    facts:['Speed of sound in air: 340 m/s','Frequency of the drum note: 170 Hz'],
    named:[[[50, 50], 'Divided the frequency by the speed (0.5 m)'], [[5780000, 5780000], 'Multiplied the speed by the frequency'], [[51000, 51000], 'Used 510 as the speed']],
    after:function(v){ return ['Emeka checks with a measuring rod: the wavelength is 2 m.', 'You said ' + v + ' m']; },
    keyLines:['Correct: 2 m (wavelength = speed / frequency).','0.5: divided the wrong way round. 57800: multiplied.']});
  var S2 = numStep({short:'Wavelength of the same note in water (1500 m/s)', title:'The drum in the river', scale:100, ok:[875, 890], label:'Wavelength in metres',
    say:'The same drum is played on a boat, and the sound travels into the water. In water, sound travels at about 1500 m/s. The frequency is still 170 Hz. What is the wavelength in the water? (in metres)',
    facts:['Speed of sound in water: about 1500 m/s','Frequency: 170 Hz'],
    named:[[[200, 200], 'Kept the wavelength the same as in air'], [[11, 11], 'Divided the frequency by the speed'], [[1500, 1500], 'Gave the speed as the wavelength']],
    after:function(v){ return ['Emeka measures the sound in the water: wavelength 8.8 m.', 'The frequency stayed at 170 Hz.', 'You said ' + v + ' m']; },
    keyLines:['Correct: about 8.8 m (1500 / 170). The frequency stays the same, the speed and wavelength change.','2: kept the wavelength. 0.11: divided the wrong way.']});
  var P3 = [
    {t:'When sound moves from air to water, the frequency stays the same, and the speed and wavelength change.', ok:true},
    {t:'When sound moves into water, the speed stays the same and the wavelength changes.', tag:'Reasoned: speed stays the same in a new medium'},
    {t:'When sound moves into water, the wavelength stays the same and the frequency changes.', tag:'Reasoned: wavelength stays the same in a new medium'},
    {t:'I guessed which number to change.', tag:'Reasoned: guessed'}];
  var S3 = pickStep({short:'How you decided', title:'How did you decide?', opts:P3, order:[3, 1, 0, 2],
    say:'Think about the drum on the boat. Which is closest to what you did?', facts:['Pick the one closest to what you really did. There is no best style.'],
    keyLines:['Sound reason: frequency is set by the source and does not change; speed depends on the medium, so wavelength changes.','Compare with level 2. A right answer with a faulty reason is the learner a number hides.']});
  var P4 = [
    {t:'The sound is louder because the amplitude is bigger. The pitch and the speed stay the same.', ok:true},
    {t:'The sound is louder and travels faster.', tag:'Thought a louder sound travels faster'},
    {t:'The sound is louder and higher in pitch.', tag:'Confused loudness with pitch'},
    {t:'The sound is louder because the frequency is higher.', tag:'Thought a louder sound has a higher frequency'}];
  var S4 = pickStep({short:'Drummer hits harder', title:'The loud drum', opts:P4, order:[2, 0, 3, 1],
    say:'The drummer hits the same drum harder. Which is true?', facts:['Same drum, same air'],
    after:function(i){ return ['Emeka records the two sounds.', 'The hard hit has a bigger amplitude and the same frequency as the soft hit.']; },
    keyLines:['Correct: louder means bigger amplitude. Pitch (frequency) and speed do not change.','Faster: a louder sound is not faster. Higher pitch: loudness and pitch are different.']});
  var S5 = numStep({short:'Distance to lightning (thunder 3 s later)', title:'The thunder', scale:1, ok:[1000, 1040], label:'Distance in metres',
    say:'Emeka sees a lightning flash and hears the thunder 3 seconds later. The speed of sound is 340 m/s, and the light arrives at once. How far away was the lightning? (in metres)',
    facts:['Speed of sound: 340 m/s','Light arrives at once'],
    named:[[[113, 114], 'Divided the speed by the time'], [[340, 340], 'Gave the speed as the distance'], [[1, 1], 'Gave the time']],
    after:function(v){ return ['The thunder took 3 s at 340 m/s, so the lightning was 1020 m away.', 'You said ' + v + ' m']; },
    keyLines:['Correct: 1020 m (distance = speed x time).','113: divided the wrong way round. 340: gave the speed.']});
  SF.add({
    id:'ss2-phys-talking-drum', adventure:true, unit:'Job', icon:'drum',
    facts:['Emeka sells talking drums in Owerri','The speed of sound in air is about 340 m/s'],
    outro:'Emeka covers the drums for the night.',
    title:'The Talking Drum', topic:'Sound waves: speed, frequency and wavelength; loudness and pitch', minutes:45, approved:null,
    intro:'Emeka makes and sells talking drums in Owerri. He tests each drum by listening to the sound and measuring it. You are his helper. The numbers are made up, but the physics is real.',
    steps:[S1, S2, S3, S4, S5, {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher what you did when the sound went into water. This is optional.'}]
  });
})();
