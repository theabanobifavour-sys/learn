/* Struggle First game: ss2-phys-salon-mirror. One file per game. Needs engine.js. */
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
  SF.ART.mirror = '<ellipse cx="24" cy="22" rx="14" ry="17" style="fill:#CFE8F2;' + SF.OUT + '"/><path d="M24 39v7M16 46h16" style="fill:none;' + SF.OUT + '"/>';
  function rayBuild(host, api, step){
    injectCss();
    var sp = speech(step.say), lock = lockBtn('I am sure'), box = h('div', {class:'cx-svg'}), out = h('ul', {class:'cx-out'});
    var inp = h('input', {class:'field', inputmode:'decimal', autocomplete:'off', maxlength:'6', 'aria-label':'Angle in degrees'});
    function draw(r){
      var O = [150, 160], L = 120, a = 30 * Math.PI / 180, sx = O[0] - L * Math.cos(a), sy = O[1] - L * Math.sin(a);
      var s = '<svg viewBox="0 0 300 190" width="100%" role="img" aria-label="A torch beam hits a flat mirror">';
      s += '<line x1="20" y1="160" x2="280" y2="160" stroke="var(--fg)" stroke-width="4"/>';
      s += '<line x1="150" y1="160" x2="150" y2="35" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="4 4"/><text x="154" y="42" font-size="11" fill="var(--muted)">normal</text>';
      s += '<line x1="' + sx.toFixed(1) + '" y1="' + sy.toFixed(1) + '" x2="150" y2="160" stroke="var(--accent)" stroke-width="3"/>';
      s += '<text x="95" y="182" font-size="12" fill="var(--fg)">30° to the mirror</text>';
      s += '<circle cx="' + (O[0] + L * Math.cos(a)).toFixed(1) + '" cy="' + (O[1] - L * Math.sin(a)).toFixed(1) + '" r="7" fill="none" stroke="var(--fg)" stroke-width="2"/><text x="236" y="86" font-size="11" fill="var(--muted)">target</text>';
      if (r !== null) { var b = (90 - Math.max(0, Math.min(90, r))) * Math.PI / 180; s += '<line x1="150" y1="160" x2="' + (O[0] + L * Math.cos(b)).toFixed(1) + '" y2="' + (O[1] - L * Math.sin(b)).toFixed(1) + '" stroke="var(--accent)" stroke-width="3" stroke-dasharray="1 0"/>'; }
      box.innerHTML = s + '</svg>';
    }
    draw(null);
    inp.addEventListener('input', function(){ lock.disabled = !/^\d{1,3}(\.\d{1,2})?$/.test(inp.value.trim()); });
    lock.addEventListener('click', function(){
      if (api.locked) return; var v = parseFloat(inp.value.trim()); if (isNaN(v)) return;
      var lines = step.after(v); api.submit('n' + Math.round(v * step.scale), 1800 + lines.length * 700);
      lock.disabled = true; inp.disabled = true; draw(v); setSay(sp, 'The torch is set so the beam leaves at your angle.', '');
      lines.forEach(function(t, k){ setTimeout(function(){ out.append(h('li', {}, t)); }, 600 + k * 700); });
      setTimeout(function(){ burst(host); }, 600);
    });
    host.append(sp, box, h('label', {class:'cx-lab'}, step.label), inp, lock, out);
  }
  var S1 = numStep({short:'Angle of reflection (beam at 30 degrees to the mirror)', title:'The torch beam', scale:10, ok:[595, 605], label:'Angle of reflection in degrees, measured from the normal',
    say:'A torch beam hits a flat mirror and makes an angle of 30 degrees with the mirror surface. What is the angle of reflection, measured from the normal? (in degrees)',
    facts:['The normal is a line at 90 degrees to the mirror','The beam makes 30 degrees with the mirror surface'],
    named:[[[300, 300], 'Gave the angle with the mirror surface (30) instead of the angle with the normal'], [[1200, 1200], 'Gave 120 (added instead of subtracting from 180)'], [[900, 900], 'Gave 90']],
    after:function(v){ var hit = Math.abs(v - 60) <= 2; return [hit ? 'The beam lands on the target.' : 'The beam misses the target.', 'The beam leaves at ' + v + ' degrees from the normal.']; },
    keyLines:['Correct: 60 degrees (the angle with the normal is 90 minus 30; the angle of reflection equals the angle of incidence).','30: used the angle with the mirror. 120: added.','Consequence: the learner sees their beam and whether it hits the target, so later levels can be influenced.']});
  S1.build = rayBuild;
  var S2 = numStep({short:'Image distance in a plane mirror', title:'The candle', scale:1, ok:[80, 80], label:'Distance in cm',
    say:'A candle is 40 cm in front of a flat mirror. How far is the candle from its image? (in cm)',
    facts:['The mirror is flat (plane)','The candle is 40 cm from the mirror'],
    named:[[[40, 40], 'Gave the distance to the mirror (stopped at the mirror)'], [[20, 20], 'Halved the distance'], [[160, 160], 'Doubled twice']],
    after:function(v){ return ['Nkechi measures: the image is 40 cm behind the mirror.', 'So the candle and its image are 80 cm apart.', 'You said ' + v + ' cm']; },
    keyLines:['Correct: 80 cm (the image is as far behind the mirror as the object is in front).','40: the distance to the mirror only. 20: halved.']});
  var P3 = [
    {t:'The angle of reflection equals the angle of incidence, and both are measured from the normal, not from the mirror.', ok:true},
    {t:'The beam leaves the mirror at the same angle it arrived at, measured from the mirror.', tag:'Reasoned: angles measured from the mirror surface'},
    {t:'The beam bounces off at whatever angle looks right.', tag:'Reasoned: judged by eye'},
    {t:'I used 90 minus the angle in the picture without knowing why.', tag:'Reasoned: used a rule without a reason'}];
  var S3 = pickStep({short:'How you decided', title:'How did you decide?', opts:P3, order:[2, 0, 3, 1],
    say:'Think about the torch beam. Which is closest to what you did?', facts:['Pick the one closest to what you really did. There is no best style.'],
    keyLines:['Sound reason: the law of reflection uses angles from the normal.','Compare with level 1. A right answer with a faulty reason is the learner a number hides.']});
  var S4 = numStep({short:'Image distance in a concave mirror (u 30, f 10)', title:'The shaving mirror', scale:10, ok:[145, 155], label:'Image distance in cm',
    say:'Nkechi has a curved (concave) shaving mirror with a focal length of 10 cm. She holds a candle 30 cm from it. How far from the mirror does the image form? (in cm)',
    facts:['Mirror formula: 1/f = 1/u + 1/v','f = 10 cm, u = 30 cm'],
    named:[[[200, 200], 'Subtracted the distances (30 minus 10)'], [[75, 75], 'Used f x u divided by (f + u)'], [[100, 100], 'Said the image forms at the focus'], [[400, 400], 'Added the distances (30 plus 10)']],
    after:function(v){ var sharp = Math.abs(v - 15) <= 1; return ['Nkechi puts a card ' + v + ' cm from the mirror.', sharp ? 'The candle image is sharp on the card.' : 'The image on the card is blurred.']; },
    keyLines:['Correct: 15 cm (1/v = 1/10 - 1/30 = 2/30, so v = 15). The image is real and inverted.','20: 30 minus 10. 7.5: f u over (f + u). 10: image at the focus.']});
  var P5 = [
    {t:'A virtual image, 10 cm behind the mirror, upright and bigger', ok:true},
    {t:'A real image, 10 cm in front of the mirror', tag:'Ignored the negative sign (treated the answer as real)'},
    {t:'A real image, 3.3 cm in front of the mirror', tag:'Added the reciprocals (1/10 + 1/5) instead of subtracting'},
    {t:'No image forms, because the candle is inside the focal length', tag:'Thought no image forms inside the focal length'}];
  var S5 = pickStep({short:'Candle 5 cm from the concave mirror', title:'The close candle', opts:P5, order:[3, 1, 0, 2],
    say:'Now Nkechi holds the candle only 5 cm from the same concave mirror (f = 10 cm). Which describes the image?', facts:['Mirror formula: 1/f = 1/u + 1/v','f = 10 cm, u = 5 cm'],
    after:function(i){ return ['Nkechi looks into the mirror: the candle looks bigger and the right way up.', 'She cannot catch it on a card. It only appears behind the mirror.']; },
    keyLines:['Correct: virtual, 10 cm behind the mirror (1/v = 1/10 - 1/5 = -1/10, so v = -10), upright and magnified.','The negative v means a virtual image. Ignoring the sign gives a real image. No image forms: wrong, a virtual image forms.']});
  SF.add({
    id:'ss2-phys-salon-mirror', adventure:true, unit:'Mirror', icon:'mirror',
    facts:['Nkechi runs a salon in Owerri','She has a flat mirror and a curved shaving mirror'],
    outro:'Nkechi switches off the lights and locks the salon.',
    title:'The Salon Mirror', topic:'Light I: reflection at plane and curved mirrors', minutes:45, approved:null,
    intro:'Nkechi runs a salon in Owerri. She has a flat <b>mirror</b> on the wall and a curved <b>shaving mirror</b> on the counter. You are helping her nephew with a science project on light. The numbers are made up, but the physics is real.',
    steps:[S1, S2, S3, S4, S5, {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher what you did when the beam missed the target. This is optional.'}]
  });
})();
