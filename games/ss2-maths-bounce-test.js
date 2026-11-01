/* Struggle First game: ss2-maths-bounce-test. One file per game. Needs engine.js. Geometric progressions. */
(function(){
  var h = SF.h, speech = SF.speech, setSay = SF.setSay, lockBtn = SF.lockBtn, burst = SF.burst;
  SF.ART.ball = '<circle cx="24" cy="26" r="15" style="fill:#E07A3F;' + SF.OUT + '"/><path d="M10 22c10 4 18 4 28 0M24 11v30" style="fill:none;' + SF.OUT + '"/>';
  function ht(n){ return 80 / Math.pow(2, n); }          /* bounce n height in cm, dropped from 80 */
  function fmt(x){ return String(Math.round(x * 10000) / 10000); }
  function injectCss(){
    if (document.getElementById('bt-css')) return;
    var s = document.createElement('style'); s.id = 'bt-css';
    s.textContent = [
      '.bt-out{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px}',
      '.bt-out li{border-top:1px solid var(--line);padding-top:6px;font:500 15px ui-monospace,monospace}',
      '.bt-lab{font-size:14px;color:var(--muted)}',
      '.bt-opts{display:flex;flex-direction:column;gap:10px}',
      '.bt-opt{display:block;width:100%;text-align:left;min-height:52px;padding:12px 14px;border:1.5px solid var(--line);background:var(--surface);color:var(--fg);border-radius:10px;font:inherit;cursor:pointer}',
      '.bt-opt.sel{border-color:var(--accent);outline:2px solid var(--accent)}'
    ].join('\n');
    document.head.appendChild(s);
  }
  function buildNum(host, api, step){
    injectCss();
    var sp = speech(step.say), lock = lockBtn('I am sure'), out = h('ul', {class:'bt-out'});
    var inp = h('input', {class:'field', inputmode:'decimal', autocomplete:'off', maxlength:'9', 'aria-label':'Your answer'});
    inp.addEventListener('input', function(){ lock.disabled = !/^\d{1,5}(\.\d{1,4})?$/.test(inp.value.trim()); });
    lock.addEventListener('click', function(){
      if (api.locked) return; var v = parseFloat(inp.value.trim()); if (isNaN(v)) return;
      var lines = step.after(v); api.submit('n' + Math.round(v * 100), 1200 + lines.length * 700); lock.disabled = true; inp.disabled = true;
      setSay(sp, step.checking, '');
      lines.forEach(function(t, k){ setTimeout(function(){ out.append(h('li', {}, t)); }, 500 + k * 700); });
      setTimeout(function(){ burst(host); }, 600);
    });
    host.append(sp, h('label', {class:'bt-lab'}, step.label), inp, lock, out);
  }
  function buildPick(host, api, step){
    injectCss();
    var sp = speech(step.say), sel = null, btns = [], lock = lockBtn('I am sure'), opts = h('div', {class:'bt-opts'});
    step.order.forEach(function(i){
      var b = h('button', {class:'bt-opt', type:'button'}, step.opts[i].t);
      b.addEventListener('click', function(){ if (api.locked) return; btns.forEach(function(x){ x.classList.remove('sel'); }); b.classList.add('sel'); sel = i; lock.disabled = false; });
      btns.push(b); opts.append(b);
    });
    lock.addEventListener('click', function(){ if (api.locked || sel === null) return; api.submit('p' + sel, 1600); lock.disabled = true; btns.forEach(function(x){ x.disabled = true; }); setSay(sp, 'Thank you. Mr Obi has written that down.', ''); });
    host.append(sp, opts, lock);
  }
  function pj(opts){ return function(a){ var o = opts[+String(a).slice(1)]; if (!o) return {tag:'Answer could not be read'}; return o.ok ? {ok:true} : {tag:o.tag}; }; }
  function ps(opts){ return function(a){ var o = opts[+String(a).slice(1)]; return o ? 'Chose: ' + o.t : 'Unreadable'; }; }
  function nj(correct, named){ return function(a){ var v = +String(a).slice(1); if (v === correct) return {ok:true}; if (named[v]) return {tag:named[v]}; return {tag:'Not a listed slip'}; }; }
  function ns(a){ return 'Typed ' + (+String(a).slice(1) / 100); }
  function heights(from, to){ var r = [], i; for (i = from; i <= to; i++) r.push('Bounce ' + i + ': ' + fmt(ht(i)) + ' cm'); return r; }

  var L1 = {type:'game', short:'Height of bounce 4 (40, 20, ...)', title:'The first test', build:buildNum, checking:'Mr Obi drops the ball again and measures.',
    say:'The ball is dropped from 80 cm. Bounce 1 reaches 40 cm. Bounce 2 reaches 20 cm. How high is bounce 4, in cm?', label:'Height of bounce 4 in cm', facts:['Dropped from 80 cm','Bounce 1: 40 cm. Bounce 2: 20 cm'],
    after:function(v){ return heights(1, 4).concat(['You said bounce 4 reaches ' + fmt(v) + ' cm']); },
    judge:nj(500, {0:'Took away the same amount each bounce (20 cm), so the ball ran out', 1000:'Gave bounce 3 (one bounce short)', 250:'Gave bounce 5 (one bounce too far)'}), show:ns,
    keyLines:['Correct: 5 cm (40, 20, 10, 5).','0: took away 20 each bounce, treating the pattern as plain subtraction. 10: gave bounce 3. 2.5: gave bounce 5.','Consequence: Mr Obi measures and the learner sees every bounce up to the one asked, so a learner can notice the halving. Later levels can be affected.']};
  var L2 = {type:'game', short:'Height of bounce 8', title:'The long test', build:buildNum, checking:'Mr Obi has a better measuring stick for this one.',
    say:'Same ball, same rule. How high is bounce 8, in cm? Give your answer to 2 decimal places.', label:'Height of bounce 8 in cm', facts:['Dropped from 80 cm','Each bounce is half of the one before'],
    after:function(v){ return heights(6, 8).concat(['You said bounce 8 reaches ' + fmt(v) + ' cm']); },
    judge:nj(31, {16:'Halved 8 times starting from the first bounce (one halving too many)', 63:'Halved only 6 times from the first bounce (one halving too few)', 1000:'Divided 80 by 8'}), show:ns,
    keyLines:['Correct: 0.31 cm (80 / 256 = 0.3125; accept 0.31 or 0.3125).','0.16: applied 8 halvings to 40 (the first bounce is already one halving). 0.63: one halving short. 10: 80 divided by 8.','This is the off-by-one in the exponent: bounce n is the first bounce times one half, n minus 1 times.']};
  var R = [
    {t:'Bounce 8 is the bounce 1 height halved 7 times, because bounce 1 is already one halving.', ok:true},
    {t:'Bounce 8 is 80 halved 8 times.', ok:true},
    {t:'Bounce 8 is bounce 1 halved 8 times.', tag:'Reasoned: halved the first bounce n times (one halving too many)'},
    {t:'I kept halving until I reached the 8th bounce.', tag:'Reasoned: repeated halving with no rule (slow, easy to slip)'},
    {t:'I divided 80 by 8.', tag:'Reasoned: divided by the bounce number'}];
  var L3 = {type:'game', short:'How you decided', title:'How did you decide?', build:buildPick, opts:R, order:[2, 0, 4, 3, 1],
    say:'Think about bounce 8. Which is closest to what you did?', facts:['Pick the one closest to what you really did. There is no best style.'],
    keyLines:['Both of the first two options are sound: one starts from bounce 1 and halves 7 times, the other starts from the drop height and halves 8 times.','Compare with the level 2 answer. A right answer with a faulty reason is the learner a number hides.']};
  L3.judge = pj(R); L3.show = ps(R);
  var L4 = {type:'game', short:'First bounce below 1 cm', title:'The low test', build:buildNum, checking:'Mr Obi watches the ball bounce.',
    say:'Mr Obi wants to know the first bounce that reaches less than 1 cm. Which bounce number is it?', label:'Bounce number', facts:['Dropped from 80 cm','Each bounce is half of the one before'],
    after:function(v){ return heights(5, 8).concat(['The first bounce under 1 cm is the one Mr Obi is looking for']); },
    judge:nj(700, {600:'Gave the last bounce that is still above 1 cm', 800:'Gave a bounce well past the first one under 1 cm', 8000:'Gave the drop height as a bounce number'}), show:ns,
    keyLines:['Correct: bounce 7 (0.625 cm; bounce 6 is 1.25 cm).','6: the last bounce still above 1 cm. 8: overshoots.','Consequence: the learner sees heights for bounces 5 to 8.']};
  var L5 = {type:'game', short:'A rumour that triples every hour', title:'A different pattern', build:buildNum, checking:'The market women count who has heard.',
    say:'At 8 am, 2 people have heard a rumour. Every hour the number who have heard triples. After 1 hour, 6 people have heard. How many have heard after 5 hours?', label:'People who have heard after 5 hours', facts:['8 am: 2 people','After 1 hour: 6 people','Every hour the number triples'],
    after:function(v){ var r = [], i; for (i = 0; i <= 5; i++) r.push('After ' + i + ' hours: ' + (2 * Math.pow(3, i))); return r.concat(['You said ' + fmt(v)]); },
    judge:nj(48600, {2200:'Added 4 each hour (treated it as adding the same amount)', 145800:'Tripled one time too many', 16200:'Tripled one time too few', 3000:'Multiplied the hours by 6'}), show:ns,
    keyLines:['Correct: 486 (2 x 3 to the power 5).','22: added 4 each hour. 1458: one extra tripling. 162: one too few. 30: 5 x 6.','This level has a ratio of 3 (growth, not shrinking), so it checks the idea transfers.']};

  SF.add({
    id:'ss2-maths-bounce-test', adventure:true, unit:'Level', icon:'ball',
    facts:['Dropped from 80 cm','Each bounce is half of the one before'],
    outro:'Mr Obi packs the ball away. The shop is closing.',
    title:'The Bounce Test', topic:'Geometric progressions: multiply by the same ratio each step', minutes:45, approved:null,
    intro:'Mr Obi sells sports goods in Owerri. He tests a new rubber ball by dropping it and measuring how high each bounce goes. You are his helper. The numbers in this game are made up.',
    steps:[L1, L2, L3, L4, L5, {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher what you did to find bounce 8. This is optional.'}]
  });
})();
