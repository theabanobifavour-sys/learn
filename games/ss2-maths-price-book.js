/* Struggle First game: ss2-maths-price-book. One file per game. Needs engine.js. Log TABLES version of the Logarithms game. */
(function(){
  var h = SF.h, speech = SF.speech, setSay = SF.setSay, lockBtn = SF.lockBtn, burst = SF.burst;
  SF.ART.book = '<rect x="8" y="8" width="32" height="32" rx="3" style="fill:#C9B27C;' + SF.OUT + '"/><path d="M24 8v32M13 16h6M13 22h6M29 16h6M29 22h6" style="fill:none;' + SF.OUT + '"/>';
  function lg(x){ return Math.log10(x); }
  function f4(x){ return (Math.round(x * 10000) / 10000).toFixed(4); }
  function pow10(x){ var v = Math.pow(10, x); return v >= 10 ? String(Math.round(v)) : String(Math.round(v * 1000) / 1000).replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''); }

  function injectCss(){
    if (document.getElementById('pb-css')) return;
    var s = document.createElement('style'); s.id = 'pb-css';
    s.textContent = [
      '.pb-book{border:1.5px solid var(--line);border-radius:10px;background:var(--bg);padding:8px 10px;display:flex;flex-direction:column;gap:4px}',
      '.pb-book .pb-t{font-size:13px;color:var(--muted)}',
      '.pb-book .pb-r{display:flex;justify-content:space-between;font:600 15px ui-monospace,monospace}',
      '.pb-opts{display:flex;flex-direction:column;gap:10px}',
      '.pb-opt{display:block;width:100%;text-align:left;min-height:52px;padding:12px 14px;border:1.5px solid var(--line);background:var(--surface);color:var(--fg);border-radius:10px;font:inherit;cursor:pointer}',
      '.pb-opt.sel{border-color:var(--accent);outline:2px solid var(--accent)}',
      '.pb-out{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px}',
      '.pb-out li{border-top:1px solid var(--line);padding-top:6px;font:500 15px ui-monospace,monospace}',
      '.pb-in{display:flex;flex-direction:column;gap:6px}',
      '.pb-lab{font-size:14px;color:var(--muted)}'
    ].join('\n');
    document.head.appendChild(s);
  }
  function bookEl(step){
    var rows = [], i;
    rows.push(h('div', {class:'pb-t'}, 'Page A: the decimal part of the log (4 figures). Numbers from 1 to 10 only.'));
    step.pageA.forEach(function(r){ rows.push(h('div', {class:'pb-r'}, h('span', {}, 'log ' + r[0]), h('span', {}, '.' + r[1]))); });
    rows.push(h('div', {class:'pb-t'}, 'Page B: the same book read backwards (decimal part, then the number from 1 to 10).'));
    step.pageB.forEach(function(r){ rows.push(h('div', {class:'pb-r'}, h('span', {}, '.' + r[0]), h('span', {}, r[1]))); });
    return h('div', {class:'pb-book', role:'img', 'aria-label':'A page from the log book'}, rows);
  }

  /* number entry */
  function buildNum(host, api, step){
    injectCss();
    var sp = speech(step.say), lock = lockBtn('I am sure'), out = h('ul', {class:'pb-out'});
    var inp = h('input', {class:'field', inputmode:'decimal', autocomplete:'off', maxlength:'9', 'aria-label':'Your answer'});
    inp.addEventListener('input', function(){ lock.disabled = !/^-?\d{1,3}(\.\d{1,5})?$/.test(inp.value.trim()); });
    lock.addEventListener('click', function(){
      if (api.locked) return; var v = parseFloat(inp.value.trim()); if (isNaN(v)) return;
      api.submit('n' + Math.round(v * 10000), 2600); lock.disabled = true; inp.disabled = true;
      setSay(sp, 'Mr Eze checks your answer against the book.', '');
      step.after(v).forEach(function(t, k){ setTimeout(function(){ out.append(h('li', {}, t)); }, 500 + k * 700); });
      setTimeout(function(){ burst(host); }, 600);
    });
    host.append(sp, bookEl(step), h('label', {class:'pb-lab'}, step.label), inp, lock, out);
  }
  /* pick, with optional consequence */
  function buildPickC(host, api, step){
    injectCss();
    var sp = speech(step.say), sel = null, btns = [], lock = lockBtn('I am sure'), opts = h('div', {class:'pb-opts'}), out = h('ul', {class:'pb-out'});
    step.order.forEach(function(i){
      var b = h('button', {class:'pb-opt', type:'button'}, step.opts[i].t);
      b.addEventListener('click', function(){ if (api.locked) return; btns.forEach(function(x){ x.classList.remove('sel'); }); b.classList.add('sel'); sel = i; lock.disabled = false; });
      btns.push(b); opts.append(b);
    });
    lock.addEventListener('click', function(){
      if (api.locked || sel === null) return; api.submit('p' + sel, step.after ? 2600 : 1600);
      lock.disabled = true; btns.forEach(function(x){ x.disabled = true; });
      if (step.after) { setSay(sp, 'Mr Eze checks your answer against the book.', ''); step.after(sel).forEach(function(t, k){ setTimeout(function(){ out.append(h('li', {}, t)); }, 500 + k * 700); }); setTimeout(function(){ burst(host); }, 600); }
      else setSay(sp, 'Thank you. Mr Eze has written that down.', '');
    });
    host.append(sp); if (step.pageA) host.append(bookEl(step)); host.append(opts, lock, out);
  }
  function pj(opts){ return function(a){ var o = opts[+String(a).slice(1)]; if (!o) return {tag:'Answer could not be read'}; return o.ok ? {ok:true} : {tag:o.tag}; }; }
  function ps(opts){ return function(a){ var o = opts[+String(a).slice(1)]; return o ? 'Chose: ' + o.t : 'Unreadable'; }; }
  function nj(correct, named){ return function(a){ var v = +String(a).slice(1); if (Math.abs(v - correct) <= 2) return {ok:true}; for (var k in named) if (Math.abs(v - +k) <= 2) return {tag:named[k]}; return {tag:'Not a listed slip'}; }; }
  function ns(a){ return 'Typed ' + (+String(a).slice(1) / 10000); }

  var A1 = [['2.0', '3010'], ['2.5', '3979'], ['3.0', '4771'], ['3.5', '5441'], ['4.0', '6021']];
  var B1 = [['3010', '2.0'], ['3979', '2.5'], ['4771', '3.0'], ['5441', '3.5'], ['6021', '4.0']];
  var A3 = [['1.5', '1761'], ['2.0', '3010'], ['4.0', '6021'], ['5.0', '6990']];
  var A5 = [['2.0', '3010'], ['4.0', '6021'], ['9.0', '9542']];
  var B2 = [['1761', '1.5'], ['3010', '2.0'], ['4260', '2.667'], ['6021', '4.0'], ['6532', '4.5'], ['7782', '6.0'], ['9542', '9.0']];
  var L1 = {type:'game', short:'log 350 from the book (3.5 is .5441)', title:'The first price', build:buildNum, pageA:A1, pageB:B1,
    say:'The book says the decimal part of the log of 3.5 is .5441. Type the whole log of 350.', label:'Log of 350 (use a decimal point)', facts:['Page A has log 3.5 = .5441','Mr Eze wants the log of 350'],
    after:function(v){ return ['10 to the power ' + v + ' is about ' + pow10(v), 'The shop price he wanted was 350']; },
    judge:nj(25441, {35441:'Gave the whole number part as 3 (counted the digits of 350)', 15441:'Gave the whole number part as 1 (one too low)', 5441:'Gave only the decimal part from the book'}), show:ns,
    keyLines:['Correct: 2.5441. 350 is 3.5 x 100, so the whole number part is 2 and the decimal part comes from the book.','3.5441: counted three digits. 1.5441: one too low. 0.5441: gave only the book entry.','Consequence: the learner sees what number their answer stands for (10 to the power of it).']};
  var L2opts = [
    {t:'2.5441', tag:'Ignored that 0.035 is below 1 (kept a positive whole number part)', v:'2.5441'},
    {t:'-2.5441', tag:'Made the whole log negative, including the decimal part', v:'-2.5441'},
    {t:'2-bar . 5441, that is -2 + 0.5441', ok:true, v:'-1.4559'},
    {t:'1.5441', tag:'Wrong whole number part for a number below 1 (used one place instead of two)', v:'1.5441'}];
  var L2 = {type:'game', short:'log 0.035 (a number below 1)', title:'A small price', build:buildPickC, pageA:A1, pageB:B1, opts:L2opts, order:[1, 3, 0, 2],
    say:'Now the log of 0.035. The book still says .5441 for 3.5. Which is the log of 0.035?', facts:['0.035 is 3.5 divided by 100','Page A has log 3.5 = .5441'],
    after:function(i){ return ['10 to the power of your answer is about ' + pow10(+L2opts[i].v), 'The price he wanted was 0.035']; },
    keyLines:['Correct: 2-bar.5441, that is -2 + 0.5441 = -1.4559. 0.035 is 3.5 divided by 100, so the whole number part is -2 and the decimal part stays .5441.','Positive 2 or 1, or a fully negative log, show the below-1 rule is not secure.','Consequence: the learner sees what number their answer stands for.']};
  L2.judge = pj(L2opts); L2.show = ps(L2opts);
  var L3opts = [
    {t:'6.0', ok:true}, {t:'5.5', tag:'Added the numbers (4 + 1.5)'}, {t:'0.1060', tag:'Multiplied the logs (0.6021 x 0.1761)'}, {t:'0.7782', tag:'Added the logs but did not look the number up again'}];
  var L3 = {type:'game', short:'4 x 1.5 using the book', title:'Multiplying', build:buildPickC, pageA:A3, pageB:B2, opts:L3opts, order:[2, 0, 3, 1],
    say:'Mr Eze wants to work out 4 x 1.5 using only the book. Which number is the answer?', facts:['Use Page A, then Page B','4 x 1.5 is the sum he wants'],
    after:function(i){ var v = +L3opts[i].t; return ['log of your answer is ' + f4(lg(v)), 'Book: log 4 = 0.6021 and log 1.5 = 0.1761']; },
    keyLines:['Correct: 6.0. 0.6021 + 0.1761 = 0.7782, and Page B shows 0.7782 is the decimal part of 6.0.','5.5: added the numbers. 0.1060: multiplied the logs. 0.7782: stopped at the sum.','Page B holds 0.4260 and 0.6532 as distractors that are not the sum.']};
  L3.judge = pj(L3opts); L3.show = ps(L3opts);
  var L4opts = [
    {t:'Multiplying the numbers is the same as adding their logs, so I added the two book entries.', ok:true},
    {t:'You always add whatever the book gives you.', tag:'Reasoned: add whatever the book gives (no reason connected to multiplying)'},
    {t:'I multiplied the two book entries because the numbers were multiplied.', tag:'Reasoned: multiplied the book entries'},
    {t:'I guessed from the page.', tag:'Reasoned: guessed'}];
  var L4 = {type:'game', short:'How you decided', title:'How did you decide?', build:buildPickC, opts:L4opts, order:[3, 2, 0, 1],
    say:'Think about multiplying 4 by 1.5. Which is closest to what you did?', facts:['Pick the one closest to what you really did. There is no best style.'],
    keyLines:['Sound reason: logs turn multiplying into adding.','Compare with the level 3 answer. A right answer with a faulty reason, or a wrong answer with the sound reason, is the learner a number alone hides.']};
  L4.judge = pj(L4opts); L4.show = ps(L4opts);
  var L5opts = [
    {t:'4.5', ok:true}, {t:'18', tag:'Added the logs when the numbers were divided'}, {t:'0.6532', tag:'Subtracted the logs but did not look the number up again'}, {t:'3.17', tag:'Divided the logs (0.9542 / 0.3010)'}, {t:'7', tag:'Subtracted the numbers (9 - 2)'}];
  var L5 = {type:'game', short:'9 / 2 using the book', title:'Dividing', build:buildPickC, pageA:A5, pageB:B2, opts:L5opts, order:[3, 1, 0, 4, 2],
    say:'Now 9 divided by 2, using the book. Which number is the answer?', facts:['Book: log 9 = 0.9542 and log 2 = 0.3010','Page B reads the book backwards'],
    after:function(i){ var v = +L5opts[i].t; return ['log of your answer is ' + f4(lg(v)), 'Book: 0.9542 and 0.3010']; },
    keyLines:['Correct: 4.5. 0.9542 - 0.3010 = 0.6532, and Page B shows 0.6532 belongs to 4.5.','18: added the logs. 0.6532: stopped at the difference. 3.17: divided the logs. 7: subtracted the numbers.']};
  L5.judge = pj(L5opts); L5.show = ps(L5opts);

  SF.add({
    id:'ss2-maths-price-book', adventure:true, unit:'Level', icon:'book',
    facts:['The book lists the decimal part of the log','Mr Eze has no calculator'],
    outro:'Mr Eze closes the book. The shop is shut for the day.',
    title:'The Price Book', topic:'Logarithms using tables: whole number part, decimal part, adding and subtracting', minutes:45, approved:null,
    intro:'Mr Eze is a cloth trader in Owerri. He has no calculator, only an old <b>book</b> that gives the decimal part of the log of a number. He needs your help to work out prices. The numbers in this game are made up.',
    steps:[L1, L2, L3, L4, L5, {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher what you did when the price was below 1. This is optional.'}]
  });
})();
