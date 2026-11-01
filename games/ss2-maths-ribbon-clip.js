/* Struggle First game: ss2-maths-ribbon-clip. One file per game. Needs engine.js. */
(function(){
  var h = SF.h, speech = SF.speech, setSay = SF.setSay, lockBtn = SF.lockBtn, burst = SF.burst;

  function injectCss(){
    if (document.getElementById('rc-css')) return;
    var s = document.createElement('style'); s.id = 'rc-css';
    s.textContent = [
      '.rc-box{border:1.5px solid var(--line);border-radius:12px;background:var(--bg);padding:12px 14px 10px;display:flex;flex-direction:column;gap:8px}',
      '.rc-track{position:relative;height:80px;margin:0 6px}',
      '.rc-bar{position:absolute;left:0;right:0;top:30px;height:8px;border-radius:4px;background:var(--line)}',
      '.rc-mark{position:absolute;top:22px;width:2px;height:24px;background:var(--fg);transform:translateX(-1px)}',
      '.rc-lab{position:absolute;top:0;transform:translateX(-50%);font:700 13px var(--f-mono,ui-monospace,monospace);color:var(--accent);white-space:nowrap}',
      '.rc-pos{position:absolute;top:48px;transform:translateX(-50%);font:600 12px var(--f-mono,ui-monospace,monospace);color:var(--muted);white-space:nowrap}',
      '.rc-clip{position:absolute;top:18px;width:16px;height:32px;margin-left:-8px;border-radius:5px;background:var(--accent);border:2px solid var(--fg)}',
      '.rc-range{width:100%;min-height:48px;accent-color:var(--accent)}',
      '.rc-read{font:700 24px var(--f-mono,ui-monospace,monospace);text-align:center;color:var(--fg)}',
      '.rc-note{font-size:14px;color:var(--muted);text-align:center;min-height:20px}',
      '.rc-prac{border:1.5px dashed var(--line);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:6px}',
      '.rc-opt{display:block;width:100%;text-align:left;min-height:52px;padding:12px 14px;border:1.5px solid var(--line);background:var(--surface);color:var(--fg);border-radius:10px;font:inherit;cursor:pointer}',
      '.rc-opt.sel{border-color:var(--accent);background:var(--accent-bg,var(--bg));outline:2px solid var(--accent)}',
      '.rc-opts{display:flex;flex-direction:column;gap:10px}'
    ].join('\n');
    document.head.appendChild(s);
  }
  function f2(n){ return (Math.round(n * 100) / 100).toFixed(2); }
  function priceAt(pos){ return Math.pow(10, pos); }
  function fmtPrice(v){ return v >= 100 ? String(Math.round(v)) : v >= 10 ? String(Math.round(v)) : v.toPrecision(1); }

  /* ribbon drawing: marks is [{pos, text}], max is the right-hand end of the ribbon */
  function ribbon(marks, max, clipPos){
    var track = h('div', {class:'rc-track'}), bar = h('div', {class:'rc-bar'}), clip = h('div', {class:'rc-clip'});
    track.append(bar);
    marks.forEach(function(m, i){
      var x = (m.pos / max * 100) + '%';
      var mk = h('div', {class:'rc-mark'}); mk.style.left = x;
      var lb = h('div', {class:'rc-lab'}, m.text); lb.style.left = x;
      var ps = h('div', {class:'rc-pos'}, f2(m.pos)); ps.style.left = x; ps.style.top = (i % 2 ? 62 : 48) + 'px';
      track.append(mk, lb, ps);
    });
    track.append(clip);
    function set(p){ clip.style.left = (p / max * 100) + '%'; }
    set(clipPos);
    return {el: track, set: set};
  }

  /* ---------- practice ribbon (not counted): whole spots only, so it never shows a spot used in the levels ---------- */
  function practice(){
    var marks = [{pos:0, text:'1'}, {pos:1, text:'10'}, {pos:2, text:'100'}, {pos:3, text:'1000'}];
    var rb = ribbon(marks, 3, 0), r = h('input', {type:'range', min:'0', max:'3', step:'1', value:'0', class:'rc-range', 'aria-label':'Practice clip'});
    var t = h('div', {class:'rc-read'}, 'Price 1');
    r.addEventListener('input', function(){ var p = +r.value; rb.set(p); t.textContent = 'Price ' + Math.round(Math.pow(10, p)); });
    return h('div', {class:'rc-prac'}, h('div', {class:'small muted'}, 'Practice ribbon (not counted). It uses other prices. Slide the clip along it.'), rb.el, r, t);
  }

  /* ---------- mechanic: slide the clip to the spot for a new price ---------- */
  function buildClip(host, api, step){
    injectCss();
    var sp = speech(step.say), lock = lockBtn('I am sure');
    var marks = [{pos:0, text:'1'}, {pos:0.30, text:'2'}, {pos:0.48, text:'3'}, {pos:1.00, text:'10'}];
    var rb = ribbon(marks, 2, 0);
    var r = h('input', {type:'range', min:'0', max:'200', step:'1', value:'0', class:'rc-range', 'aria-label':'Clip position for price ' + step.price});
    var read = h('div', {class:'rc-read'}, '0.00'), note = h('div', {class:'rc-note', role:'status'}, 'Slide the clip. You can change your mind until you lock in.');
    var moved = false;
    r.addEventListener('input', function(){ if (api.locked) return; moved = true; var p = +r.value / 100; rb.set(p); read.textContent = f2(p); lock.disabled = false; });
    lock.addEventListener('click', function(){
      if (api.locked || !moved) return;
      var v = +r.value; api.submit('c' + v, 3200);
      lock.disabled = true; r.disabled = true;
      setSay(sp, 'Mr Eze reads the price at your spot.', '');
      setTimeout(function(){ note.textContent = 'At ' + f2(v / 100) + ' the ribbon reads a price of about ' + fmtPrice(priceAt(v / 100)) + '.'; burst(host); }, 800);
    });
    host.append(sp);
    if (step.practice) host.append(practice());
    host.append(h('div', {class:'rc-box'}, h('div', {class:'small muted'}, 'New price: ', h('b', {}, String(step.price))), rb.el, r, read), note, lock);
  }

  /* ---------- judge ---------- */
  function clipJudge(correct, named, dir){
    return function(a){
      var v = +String(a).slice(1); if (!isFinite(v)) return {tag:'Answer could not be read'};
      if (Math.abs(v - correct) <= 2) return {ok:true};
      var keys = Object.keys(named);
      for (var i = 0; i < keys.length; i++) if (Math.abs(v - +keys[i]) <= 2) return {tag:named[keys[i]]};
      return {tag: v < correct ? 'Clip placed too far left (not a listed slip)' : 'Clip placed too far right (not a listed slip)'};
    };
  }
  function clipShow(a){ var v = +String(a).slice(1); return 'Clip at ' + f2(v / 100) + ' (price about ' + fmtPrice(priceAt(v / 100)) + ')'; }

  /* ---------- reasoning pick ---------- */
  function buildPick(host, api, step){
    injectCss();
    var sp = speech(step.say), sel = null, btns = [], lock = lockBtn('I am sure'), opts = h('div', {class:'rc-opts'});
    step.order.forEach(function(i){
      var b = h('button', {class:'rc-opt', type:'button'}, step.options[i].t);
      b.addEventListener('click', function(){ if (api.locked) return; btns.forEach(function(x){ x.classList.remove('sel'); }); b.classList.add('sel'); sel = i; lock.disabled = false; });
      btns.push(b); opts.append(b);
    });
    lock.addEventListener('click', function(){ if (api.locked || sel === null) return; api.submit('p' + sel, 1600); lock.disabled = true; btns.forEach(function(x){ x.disabled = true; }); setSay(sp, 'Thank you. Mr Eze has written that down.', ''); });
    host.append(sp, opts, lock);
  }
  var PICK = {
    type:'game', short:'How you decided', title:'How did you decide?', build:buildPick,
    say:'Think about how you found the spots for prices 4, 6 and 5. Which is closest to what you did?',
    facts:['Pick the one closest to how you really worked. Be honest, there is no best style to pick.'],
    options:[
      {t:'Prices that multiply give spots that add. I split the new price into prices I know.', ok:true},
      {t:'I looked for a pattern in the spots and guessed the next one.', tag:'Reasoned: guessed from a pattern in the spots'},
      {t:'A price that is double should have a spot that is double.', tag:'Reasoned: doubling the price doubles the spot'},
      {t:'A price that is half should have a spot that is half.', tag:'Reasoned: halving the price halves the spot'}
    ],
    order:[3, 0, 2, 1],
    show:function(a){ var o = this.options[+String(a).slice(1)]; return o ? 'Said: ' + o.t : 'Unreadable'; },
    keyLines:['Sound reason: multiplying prices adds the spots (the log of a product is the sum of the logs).','Compare with the clip answers. A learner who placed the clips well but picked a faulty reason, or placed them badly but picked the sound reason, is the one a final answer hides. A stated reason is one signal: learners may pick the reason that sounds smartest.']
  };
  PICK.judge = function(a){ var o = PICK.options[+String(a).slice(1)]; if (!o) return {tag:'Answer could not be read'}; return o.ok ? {ok:true} : {tag:o.tag}; };

  var UNSOLVED = 'Tap the clip into place. Spots are rounded to 2 decimal places.';
  SF.add({
    id:'ss2-maths-ribbon-clip', adventure:true, unit:'Level', icon:'garri',
    facts:['Price 1 sits at 0','Price 2 sits at 0.30','Price 3 sits at 0.48','Price 10 sits at 1.00','Same price, same spot. Spots are rounded to 2 decimal places'],
    outro:'Mr Eze rolls up the ribbon. His notes are back in order.',
    title:'The Ribbon Clip', topic:'Logarithms: multiplying prices adds their spots on the ribbon', minutes:45, approved:null,
    intro:'Mr Eze is a cloth trader in Owerri. He keeps one long <b>ribbon</b> with a <b>clip</b> on it. Every price in his shop has its own fixed spot on the ribbon: the same price always has the same spot. He has lost most of his notes. You help him slide the clip to the spot for each new price. The numbers in this game are rounded and made up.',
    steps:[
      {type:'game', short:'Spot for price 4', title:'Price 4', build:buildClip, price:4, practice:true,
        say:'Slide the clip to the spot for price 4, then press I am sure.',
        show:clipShow,
        judge:clipJudge(60, {48:'Used the spot of 3 (added 1 to the price 3 and kept its spot)', 120:'Multiplied the spot of 2 by 4', 30:'Used the spot of 2 (treated 4 as 2 doubled but kept the spot)'}),
        keyLines:['Correct: 0.60 (4 is 2 times 2, so 0.30 plus 0.30). Accepted within 0.02.','0.48: used 3 as the nearest known price. 1.20: 4 times the spot of 2. 0.30: kept the spot of 2.','Practice ribbon shows only whole spots (prices 1, 10, 100, 1000) so it does not reveal any spot used in the levels.']},
      {type:'game', short:'Spot for price 6', title:'Price 6', build:buildClip, price:6,
        say:'Now price 6. Slide the clip to its spot.',
        show:clipShow,
        judge:clipJudge(78, {14:'Multiplied the two spots (0.30 times 0.48)', 18:'Subtracted the spots', 180:'Multiplied the spot of 3 by 6 or the spot of 2 by 6'}),
        keyLines:['Correct: 0.78 (6 is 2 times 3, so 0.30 plus 0.48).','0.14: multiplied the spots. 0.18: subtracted. 1.80: multiplied a spot by 6.','Sound and faulty methods give different answers, so the clip position itself exposes the method.']},
      {type:'game', short:'Spot for price 5', title:'Price 5', build:buildClip, price:5,
        say:'Price 5 is exactly half of price 10. Slide the clip to its spot.',
        show:clipShow,
        judge:clipJudge(70, {50:'Took half of the spot of 10 (halving a price does not halve its spot)', 130:'Added the spots of 2 and 10 (added where dividing needs subtracting)', 30:'Used the spot of 2'}),
        keyLines:['Correct: 0.70 (5 is 10 divided by 2, so 1.00 minus 0.30).','0.50: halved the spot, the trap level. 1.30: added instead of subtracting.','This level shows whether the learner knows dividing prices subtracts spots.']},
      PICK,
      {type:'game', short:'Spot for price 8', title:'Price 8', build:buildClip, price:8,
        say:'Price 8. Slide the clip to its spot.',
        show:clipShow,
        judge:clipJudge(90, {60:'Used only two factors of 2 (8 is 2 times 2 times 2)', 120:'Added four copies of the spot of 2 (4 times the spot, one factor too many)', 150:'Added the spot of 5 and the spot of 3 without checking the product'}),
        keyLines:['Correct: 0.90 (8 is 2 times 2 times 2, so three times 0.30).','0.60: only two factors of 2. 1.20: four copies. 1.50: added the spots of 5 and 3 (that is price 15).','This level shows that repeated multiplying adds the spot repeatedly (a power multiplies the spot).']},
      {type:'game', short:'Spot for price 20', title:'Price 20', build:buildClip, price:20,
        say:'Price 20. Slide the clip to its spot.',
        show:clipShow,
        judge:clipJudge(130, {30:'Multiplied the spots of 2 and 10 (0.30 times 1.00)', 200:'Doubled the spot of 10 (20 is two tens, not ten tens)', 100:'Used the spot of 10 and ignored the 2'}),
        keyLines:['Correct: 1.30 (20 is 2 times 10, so 0.30 plus 1.00).','0.30: multiplied the spots. 2.00: doubled the spot of 10. 1.00: ignored the 2.','Transfer level: the known prices are different from the ones used so far.']},
      {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher what you did to find the spot for price 8. This is optional.'}
    ]
  });
})();
