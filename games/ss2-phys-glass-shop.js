/* Struggle First game: ss2-phys-glass-shop. One file per game. Needs engine.js. */
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
  SF.ART.glass = '<path d="M10 34L24 10l14 24z" style="fill:#CFE8F2;' + SF.OUT + '"/><path d="M6 40h36" style="fill:none;' + SF.OUT + '"/>';
  var S1 = numStep({short:'Angle of refraction air to glass (45 degrees, n 1.5)', title:'The glass block', scale:10, ok:[275, 290], label:'Angle of refraction in degrees',
    say:'A ray in air hits a glass block at 45 degrees to the normal. The refractive index of the glass is 1.5. What is the angle of refraction inside the glass? (in degrees)',
    facts:['Snell\'s law: sin i = n x sin r','Refractive index of glass = 1.5'],
    named:[[[300, 300], 'Divided the angle by the index (45 / 1.5)'], [[675, 675], 'Multiplied the angle by the index (45 x 1.5)'], [[450, 450], 'Gave no bending'], [[615, 625], 'Bent the ray away from the normal']],
    after:function(v){ return ['Mr Obinna measures the ray inside the glass: 28.1 degrees.', 'It has bent toward the normal.', 'You said ' + v + ' degrees']; },
    keyLines:['Correct: about 28 degrees (sin r = sin 45 / 1.5 = 0.471).','30: divided 45 by 1.5. 67.5: multiplied. 45: no bend.']});
  var S2 = numStep({short:'Critical angle of glass (n 1.5)', title:'The glass wedge', scale:10, ok:[412, 425], label:'Critical angle in degrees',
    say:'Mr Obinna shines light from inside the glass toward the air. What is the critical angle for glass of refractive index 1.5? (in degrees)',
    facts:['sin c = 1 / n','Light goes from glass to air'],
    named:[[[480, 485], 'Gave 90 minus the critical angle'], [[336, 338], 'Used tan instead of sin'], [[6, 7], 'Gave sin c (0.67) instead of the angle']],
    after:function(v){ return v > 41.8 ? ['Mr Obinna sends a ray at ' + v + ' degrees from inside the glass.', 'It stays inside: total internal reflection.'] : ['Mr Obinna sends a ray at ' + v + ' degrees from inside the glass.', 'Some light escapes into the air.']; },
    keyLines:['Correct: about 41.8 degrees (sin c = 1/1.5).','48.2: 90 minus c. 33.7: used tan. 0.67: gave sin c.']});
  var P3 = [
    {t:'Light slows down in glass and bends toward the normal. Total internal reflection needs light going from the denser to the less dense medium at more than the critical angle.', ok:true},
    {t:'Light always bends away from the normal when it enters glass.', tag:'Reasoned: bends away from the normal entering a denser medium'},
    {t:'Total internal reflection can happen going from air into glass if the angle is big enough.', tag:'Reasoned: TIR from the less dense into the denser medium'},
    {t:'I used the formula without thinking about which way the light bends.', tag:'Reasoned: used the formula without the direction'}];
  var S3 = pickStep({short:'How you decided', title:'How did you decide?', opts:P3, order:[3, 1, 0, 2],
    say:'Think about the glass block and the wedge. Which is closest to what you did?', facts:['Pick the one closest to what you really did. There is no best style.'],
    keyLines:['Sound reason: light slows in glass (bends toward the normal); TIR needs dense to less dense, above the critical angle.','Compare with levels 1 and 2. A right number with a faulty reason is the learner a number hides.']});
  var P4 = [
    {t:'A concave (diverging) lens, because the image forms in front of the retina', ok:true},
    {t:'A convex (converging) lens, because the image forms in front of the retina', tag:'Right defect, wrong lens (used a converging lens for short sight)'},
    {t:'A convex (converging) lens, because the image forms behind the retina', tag:'Mixed up short sight with long sight'},
    {t:'A concave (diverging) lens, because the image forms behind the retina', tag:'Right lens, wrong place for the image'}];
  var S4 = pickStep({short:'Short sight: which lens and why', title:'The spectacle counter', opts:P4, order:[1, 3, 0, 2],
    say:'A customer can read a book clearly but sees far-away signs as a blur. She is short-sighted. Which lens corrects it, and why?', facts:['Short sight: near objects clear, far objects blurred'],
    after:function(i){ return ['Mr Obinna tries a lens in front of her eye.', i === 0 ? 'The sign comes into focus.' : 'The sign stays blurred or gets worse.']; },
    keyLines:['Correct: a concave (diverging) lens. In short sight the image forms in front of the retina, and a diverging lens moves it back onto the retina.','Convex for short sight: used the wrong lens. Image behind the retina: that is long sight.']});
  var S5 = numStep({short:'Power of a lens with f 25 cm', title:'The lens shelf', scale:100, ok:[400, 400], label:'Power in dioptres',
    say:'A convex lens has a focal length of 25 cm. What is its power in dioptres? (in D)',
    facts:['Power = 1 / f, with f in metres','1 dioptre = 1 per metre'],
    named:[[[4, 4], 'Divided 1 by 25 without changing cm to metres (0.04)'], [[2500, 2500], 'Gave the focal length in cm'], [[25, 25], 'Gave 1 divided by 4']],
    after:function(v){ return ['Mr Obinna reads the label: power 4 D (f = 0.25 m).', 'You said ' + v + ' D']; },
    keyLines:['Correct: 4 D (1 / 0.25 m).','0.04: forgot to convert cm to m. 25: gave f.']});
  SF.add({
    id:'ss2-phys-glass-shop', adventure:true, unit:'Job', icon:'glass',
    facts:['Mr Obinna runs a glass shop in Owerri','He cuts glass blocks, prisms and lenses'],
    outro:'Mr Obinna locks the glass shop.',
    title:'The Glass Shop', topic:'Light II and the human eye: refraction, total internal reflection, lenses', minutes:45, approved:null,
    intro:'Mr Obinna runs a glass shop in Owerri. He cuts glass blocks and lenses, and he also sells spectacles. You are his helper. The numbers are made up, but the physics is real.',
    steps:[S1, S2, S3, S4, S5, {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher what you did to find the angle. This is optional.'}]
  });
})();
