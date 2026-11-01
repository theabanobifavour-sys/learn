/* Struggle First game: ss2-maths-hall-chairs. One file per game. Needs engine.js. */
(function(){
var h = SF.h, speech = SF.speech, setSay = SF.setSay, lockBtn = SF.lockBtn;
var FIRST = 12, STEP = 3;
function term(n){ return FIRST + STEP * (n - 1); }
function sumTo(n){ var s = 0, i; for (i = 1; i <= n; i++) s += term(i); return s; }

SF.ART.chair = '<rect x="15" y="6" width="18" height="18" rx="2" style="fill:#C77B30;' + SF.OUT + '"/><rect x="12" y="24" width="24" height="7" rx="2" style="fill:#A8743A;' + SF.OUT + '"/><path d="M15 31v11M33 31v11" style="fill:none;' + SF.OUT + '"/>';

function css(){
  if (document.getElementById('hc-css')) return;
  var s = document.createElement('style'); s.id = 'hc-css';
  s.textContent =
    '.hc-wrap svg{width:100%;height:auto;display:block}' +
    '.hc-panel{border:1.5px dashed var(--line);border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:8px}' +
    '.hc-cap{font-size:14px;color:var(--muted);min-height:20px}' +
    '.hc-btns{display:flex;gap:8px}' +
    '.hc-btns .btn{flex:1}' +
    '.hc-in{display:flex;flex-direction:column;gap:6px}' +
    '.hc-lab{font-size:14px;color:var(--muted)}';
  document.head.append(s);
}

function dotStep(maxNeed){ return Math.max(2.4, Math.min(11, 330 / maxNeed)); }
/* rows: [{need, placed}]. Draws the first k rows. Filled dot = chair placed, ring = place waiting for a chair. */
function svgHall(rows, k, maxNeed){
  var step = dotStep(maxNeed), r = step * 0.38, rowH = Math.max(5, Math.min(13, step + 2));
  var W = Math.round(maxNeed * step + 8), H = Math.round(rows.length * rowH + 8), s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Chairs set out in rows">';
  for (var i = 0; i < rows.length && i < k; i++) {
    var row = rows[i], y = (4 + i * rowH + rowH / 2).toFixed(1);
    for (var j = 0; j < row.need; j++) {
      var x = (4 + j * step + step / 2).toFixed(1);
      s += j < row.placed
        ? '<circle cx="' + x + '" cy="' + y + '" r="' + r.toFixed(2) + '" fill="var(--accent)"/>'
        : '<circle cx="' + x + '" cy="' + y + '" r="' + r.toFixed(2) + '" fill="none" stroke="var(--muted)" stroke-width="0.7"/>';
    }
  }
  return s + '</svg>';
}
function svgStack(n, maxNeed){
  if (n <= 0) return '';
  var step = dotStep(maxNeed), r = step * 0.38, per = Math.max(1, maxNeed), lines = Math.min(6, Math.ceil(n / per)), shown = Math.min(n, lines * per);
  var W = Math.round(maxNeed * step + 8), H = Math.round(lines * (step + 2) + 8), s = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Chairs left on the trolley">';
  for (var i = 0; i < shown; i++) s += '<circle cx="' + (4 + (i % per) * step + step / 2).toFixed(1) + '" cy="' + (4 + Math.floor(i / per) * (step + 2) + (step + 2) / 2).toFixed(1) + '" r="' + r.toFixed(2) + '" fill="var(--fg)"/>';
  return s + '</svg>';
}
function svgBars(v){
  var top = Math.max(term(v), 110), scale = 300 / top, H = v * 5 + 16, s = '<svg viewBox="0 0 340 ' + H + '" role="img" aria-label="Chairs in each row, row 1 at the top">';
  for (var i = 1; i <= v; i++) s += '<rect x="20" y="' + (6 + (i - 1) * 5) + '" width="' + (term(i) * scale).toFixed(1) + '" height="3.6" fill="' + (i === v ? 'var(--fg)' : 'var(--accent)') + '"/>';
  s += '<line x1="' + (20 + 100 * scale).toFixed(1) + '" x2="' + (20 + 100 * scale).toFixed(1) + '" y1="0" y2="' + H + '" stroke="var(--muted)" stroke-width="1" stroke-dasharray="3 3"/>';
  s += '<text x="' + (20 + 100 * scale + 3).toFixed(1) + '" y="12" font-size="9" fill="var(--muted)">100 chairs</text>';
  return s + '</svg>';
}

function practicePanel(){
  var n = 3, view = h('div', {class:'hc-wrap'}), out = h('div', {class:'hc-cap'}, '');
  var add = h('button', {class:'btn ghost small'}, 'Add a row'), rem = h('button', {class:'btn ghost small'}, 'Remove a row');
  function draw(){
    var rows = [], list = [], i;
    for (i = 1; i <= n; i++) { rows.push({need: 5 + 2 * (i - 1), placed: 5 + 2 * (i - 1)}); list.push(5 + 2 * (i - 1)); }
    view.innerHTML = svgHall(rows, n, 5 + 2 * 7);
    out.textContent = 'Chairs in each row: ' + list.join(', ');
    add.disabled = n >= 8; rem.disabled = n <= 1;
  }
  add.addEventListener('click', function(){ if (n < 8) { n++; draw(); } });
  rem.addEventListener('click', function(){ if (n > 1) { n--; draw(); } });
  draw();
  return h('div', {class:'hc-panel'}, h('div', {class:'hc-lab'}, 'Practice hall. This is not part of the game, and its numbers are different: its first row has 5 chairs.'), view, out, h('div', {class:'hc-btns'}, add, rem));
}

function buildChairs(host, api, step){
  css();
  var sp = speech(step.say), lock = lockBtn(), cap = h('div', {class:'hc-cap', role:'status'}, ''), view = h('div', {class:'hc-wrap'}), stack = h('div', {class:'hc-wrap'});
  var preLab = null;
  var inp = h('input', {class:'field', id:'hc-n', inputmode:'numeric', autocomplete:'off', maxlength:'3', 'aria-label':'Number of chairs'});
  host.append(sp);
  if (step.practice) host.append(practicePanel());
  if (step.pre) {
    var pr = [], i;
    for (i = 1; i <= 4; i++) pr.push({need: term(i), placed: term(i)});
    view.innerHTML = svgHall(pr, 4, term(4));
    preLab = h('div', {class:'hc-lab'}, 'The hall now: rows 1 to 4 are set out.'); host.append(preLab, view);
  } else host.append(view);
  host.append(stack, cap, h('label', {class:'hc-lab', for:'hc-n'}, step.label), inp, lock);
  inp.addEventListener('input', function(){ var v = inp.value.trim(); lock.disabled = !(/^\d{1,3}$/.test(v) && +v >= 1 && +v <= step.max); cap.textContent = (/^\d+$/.test(v) && +v > step.max) ? 'Use a number from 1 to ' + step.max + '.' : ''; });
  lock.addEventListener('click', function(){
    if (api.locked) return;
    var v = +inp.value.trim(); if (!(v >= 1 && v <= step.max)) return;
    if (preLab) preLab.textContent = '';
    var N = step.rows || step.row, hold;
    if (step.mode === 'first') {
      hold = 1200 + Math.min(v, 60) * 50 + 1800; api.submit('n' + v, hold);
      lock.disabled = true; inp.disabled = true; setSay(sp, 'Mr Okoro opens row ' + v + '. Here are the rows up to it.', '');
      view.innerHTML = svgBars(v); cap.textContent = 'Row ' + v + ' holds ' + term(v) + ' chairs.';
      return;
    }
    hold = 1200 + N * 140 + 1800; api.submit('n' + v, hold);
    lock.disabled = true; inp.disabled = true; setSay(sp, 'The delivery arrives and the crew starts setting out chairs...', '');
    var rows = [], remaining = v, i, maxNeed = term(N);
    if (step.mode === 'row') {
      for (i = 1; i < N; i++) rows.push({need: term(i), placed: term(i)});
      var need = term(N); rows.push({need: need, placed: Math.min(v, need)});
      var extra = Math.max(0, v - need);
      var k = 0, t = setInterval(function(){
        k++; view.innerHTML = svgHall(rows, k, maxNeed);
        if (k >= N) { clearInterval(t); stack.innerHTML = svgStack(extra, maxNeed); cap.textContent = 'You sent ' + v + ' chairs for row ' + N + '.' + (extra ? ' The extra chairs wait on the trolley.' : ''); setSay(sp, 'The crew has finished setting out row ' + N + '.', ''); }
      }, 140);
      view.innerHTML = svgHall(rows, 0, maxNeed);
    } else {
      for (i = 1; i <= N; i++) { var nd = term(i), pl = Math.min(remaining, nd); rows.push({need: nd, placed: pl}); remaining -= pl; }
      var done = rows.filter(function(r){ return r.placed >= r.need; }).length;
      var k2 = 0, t2 = setInterval(function(){
        k2++; view.innerHTML = svgHall(rows, k2, maxNeed);
        if (k2 >= N) { clearInterval(t2); stack.innerHTML = svgStack(remaining, maxNeed); cap.textContent = 'You sent ' + v + ' chairs for the first ' + N + ' rows. Rows completely set: ' + done + ' of ' + N + '.' + (remaining ? ' Chairs left on the trolley: ' + remaining + '.' : ''); setSay(sp, 'The crew has set out what it could.', ''); }
      }, 140);
      view.innerHTML = svgHall(rows, 0, maxNeed);
    }
  });
}

function buildPick(host, api, step){
  var sp = speech(step.say), list = h('div', {class:'opts'}), lock = lockBtn(), chosen = null, btns = [], order = [], i, j, t;
  for (i = 0; i < step.opts.length; i++) order.push(i);
  for (i = order.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = order[i]; order[i] = order[j]; order[j] = t; }
  order.forEach(function(oi){
    var b = h('button', {class:'opt', html:step.opts[oi].t});
    b.addEventListener('click', function(){ if (api.locked) return; btns.forEach(function(x){ x.classList.remove('sel'); }); b.classList.add('sel'); chosen = oi; lock.disabled = false; });
    btns.push(b); list.append(b);
  });
  lock.addEventListener('click', function(){ if (api.locked || chosen === null) return; api.submit('p' + chosen, 1600); lock.disabled = true; btns.forEach(function(x){ x.disabled = true; }); setSay(sp, 'Noted. Thank you.', ''); });
  host.append(sp, list, lock);
}
function pickJudge(opts){ return function(a){ var o = opts[+String(a).slice(1)]; if (!o) return {tag:'Unreadable choice'}; return o.ok ? {ok:true, note:o.note || ''} : {tag:o.tag}; }; }
function pickShow(opts){ return function(a){ var o = opts[+String(a).slice(1)]; return o ? 'Chose: ' + o.t.replace(/<[^>]+>/g, '') : a; }; }
function nj(correct, named){
  return function(a){
    var v = +String(a).slice(1);
    if (v === correct) return {ok:true};
    if (named[v]) return {tag:named[v]};
    return {tag: v < correct * 0.5 ? 'Far too low (not a listed slip)' : v > correct * 1.5 ? 'Far too high (not a listed slip)' : 'Close but not a listed slip'};
  };
}
function nshow(txt){ return function(a){ return txt + ' ' + String(a).slice(1); }; }

var R1 = [
  {t:'Row 20 is row 1 plus 19 steps of 3, because row 1 has no steps added.', ok:true},
  {t:'Row 20 is row 1 plus 20 steps of 3.', tag:'Added the step once for every row, including row 1'},
  {t:'I multiplied the first row by the row number.', tag:'Multiplied the first row by the row number'},
  {t:'I added row after row in my head until I got there.', tag:'Added row by row with no rule (slow, easy to slip)'}
];
var R2 = [
  {t:'Row n holds 12 plus 3 times (n minus 1). I looked for the first n that passes 100.', ok:true, note:'Used the row formula'},
  {t:'I tried rows near 30 and counted the chairs in each one.', ok:true, note:'Checked nearby rows (valid, slower)'},
  {t:'I divided 100 by 3.', tag:'Divided the limit by the step'},
  {t:'I kept adding the chairs of every row together until the total passed 100.', tag:'Confused one row with the total of all rows'}
];

SF.add({
  id:'ss2-maths-hall-chairs', adventure:true, unit:'Job', icon:'chair', facts:['Row 1 has 12 chairs','Every row has 3 more chairs than the row before it'], outro:'Mr Okoro locks the hall. The doors open at nine tomorrow.',
  title:'The Hall Chairs', topic:'Sequences and series', minutes:45, approved:null,
  intro:'Mr Okoro runs an event hall in Owerri. Before every event his crew sets out chairs in rows. <b>Row 1 has 12 chairs</b>, and <b>every row after it has 3 more chairs than the row before</b>. You are his assistant. He will give you jobs, and the crew will set out the hall using the number you tell him. No calculator is allowed in the hall.',
  steps:[
    {type:'game', short:'Chairs in row 6', title:'Chairs for row 6', build:buildChairs, mode:'row', row:6, max:200, pre:true, practice:true, label:'Chairs to send for row 6',
      say:'Rows 1 to 4 are already out. Mr Okoro needs the chairs for row 6 and asks how many to send. Type the number, then press I am sure.',
      show:nshow('Said row 6 holds'),
      judge:nj(27, {24:'Gave row 5 (counted one row short)', 30:'Added the step six times to row 1 (6 steps, not 5)', 18:'Added the step six times and ignored the first row', 72:'Multiplied the first row by the row number', 21:'Gave row 4 (read the last row shown)'}),
      keyLines:['Correct: 27 (12 + 5 x 3).','24: gave row 5. 30: added 6 steps instead of 5. 18: 6 x 3, forgot the first row. 72: 12 x 6.','Consequence: rows 1 to 5 are set out, row 6 gets as many chairs as they sent; empty rings show places still waiting. No words say whether they were close.']},
    {type:'game', short:'Chairs in row 20', title:'Chairs for row 20', build:buildChairs, mode:'row', row:20, max:400, label:'Chairs to send for row 20',
      say:'The crew is far ahead of you. Row 20 is next. How many chairs does it need? No time to list every row.',
      show:nshow('Said row 20 holds'),
      judge:nj(69, {72:'Added the step 20 times to row 1 (20 steps, not 19)', 66:'Added the step 18 times (one step short)', 240:'Multiplied the first row by the row number', 60:'Multiplied the step by the row number and ignored row 1', 36:'Multiplied the first row by the step'}),
      keyLines:['Correct: 69 (12 + 19 x 3).','72 is the key slip: n steps instead of n minus 1. 240 and 36 are multiplication methods. 60 ignores the first row.','Faulty and sound methods give different answers, so the number itself exposes the method.']},
    {type:'game', short:'Reasoning (row 20)', title:'How you decided', build:buildPick, say:'Mr Okoro asks how you got your number for row 20. Pick the one closest to what you did.', opts:R1,
      show:pickShow(R1), judge:pickJudge(R1),
      keyLines:['Sound: 19 steps added to row 1.','Compare with the row 20 number: right number with a faulty reason, or wrong number with a sound reason, are the learners a number alone hides.']},
    {type:'game', short:'Chairs for the first 10 rows', title:'An order for 10 rows', build:buildChairs, mode:'total', rows:10, max:600, label:'Chairs to order for rows 1 to 10 together',
      say:'A big event needs rows 1 to 10. You place one order for all of them. How many chairs do you order?',
      show:nshow('Ordered'),
      judge:nj(255, {390:'Counted every row as if it held the last row', 120:'Counted every row as if it held the first row', 285:'Used first plus n steps for every row', 51:'Added only the first and last rows'}),
      keyLines:['Correct: 255 (10 over 2 times (12 + 39)).','390: 10 x 39. 120: 10 x 12. 285: each row used n steps instead of n minus 1. 51: first plus last only.','Consequence: the crew fills rows in order with the chairs ordered. Short orders leave empty rings; extra chairs wait on the trolley.']},
    {type:'game', short:'First row over 100', title:'The first row over 100', build:buildChairs, mode:'first', max:60, label:'Row number (1 to 60)',
      say:'The hall allows at most 100 chairs in a row. Mr Okoro wants the first row that goes over 100. Which row number is it?',
      show:nshow('Said the first row over 100 is row'),
      judge:nj(31, {30:'Stopped one row early (used n steps, row 30 holds 99)', 33:'Divided 100 by 3', 29:'Stopped two rows early', 32:'One row too late'}),
      keyLines:['Correct: row 31 (102 chairs). Row 30 holds 99.','30: n steps slip again, now showing up as an off by one. 33: 100 divided by 3 rounded up.','Trap level: the sound and faulty methods give different rows.','Consequence: bars for each row up to the chosen row, a dashed line at 100, and the chosen row count printed.']},
    {type:'game', short:'Reasoning (row over 100)', title:'How you decided', build:buildPick, say:'Last one. How did you find that row? Pick the closest.', opts:R2,
      show:pickShow(R2), judge:pickJudge(R2),
      keyLines:['Sound: the row formula, or checking rows near 30 (valid, slower).','Faulty: dividing the limit by the step, or confusing a row with the running total.']},
    {type:'text', short:'Note for your teacher', prompt:'Anything you noticed about how the rows grew? This is optional.'}
  ]
});
})();
