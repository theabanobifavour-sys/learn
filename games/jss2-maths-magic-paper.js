/* Struggle First game: jss2-maths-magic-paper. One file per game. Needs engine.js. */
(function(){
  var buildPaper = SF.buildPaper;
SF.add({
  id:'jss2-maths-magic-paper', adventure:true, unit:'Challenge', icon:'paper', facts:['Your sheet is 0.1 mm thick, one page of an exercise book','Each fold stacks the paper twice as high'], outro:'The elder nods. The magic paper goes back in his pocket.', title:'The Magic Paper', topic:'Doubling growth (powers of 2) and why it surprises us', minutes:45, approved:null,
  intro:'The village elder hands you a magic sheet of paper as thin as one page of an exercise book: <b>0.1 mm</b>. It never tears. Every time you fold it in half, the pile has <b>twice as many layers</b>. The elder smiles: "Fold it enough and it will reach where no ladder can." Prove him right.',
  steps:[
    {type:'game', short:'Height after 10 folds', title:'Ten folds', build:buildPaper, mode:'pick', mmPerPx:0.5, demo:true, ruler:true, optIcons:['coin','finger','phone','table','house'],
      say:'The elder asks: if you fold the magic paper 10 times, how tall will the pile be? Choose one, then press I am sure.',
      opts:['About 1 mm, as thick as a coin','About 1 cm, as thick as a finger','About 10 cm, as tall as a phone','About 1 m, as tall as a table','About 10 m, as tall as a house'],
      show:function(a){ return 'Chose option ' + (+String(a).slice(1) + 1) + ' of 5'; },
      judge:function(a){ var i = +String(a).slice(1); if (i === 2) return {ok:true}; return {tag: i === 0 ? 'Added about 0.1 mm per fold (thought it grows steadily)' : i === 1 ? 'Guessed a little more than steady growth' : i === 3 ? 'Overestimated the growth' : 'Far overestimated the growth'}; },
      keyLines:['Correct: about 10 cm (1,024 layers of 0.1 mm is about 10.2 cm).','1 mm: thought each fold adds the same small amount (linear thinking).','1 m or 10 m: overestimated.','After locking in, the pile is folded 10 times on screen with the height at each fold.']},
    {type:'game', short:'Folds to pass a door', title:'Taller than the door', build:buildPaper, mode:'number', mmPerPx:10, ref:'door',
      say:'The elder points at a 2 metre door. How many folds until your pile is taller than it? Type your number, then press I am sure. The paper will be folded that many times.',
      show:function(a){ return 'Guessed ' + String(a).slice(1) + ' folds'; },
      judge:function(a){ var n = +String(a).slice(1); if (n === 15) return {ok:true}; return {tag: n === 14 ? 'Guessed one fold short' : n === 16 ? 'Guessed one fold too many' : n >= 100 ? 'Guessed in the hundreds or thousands (added 0.1 mm per fold)' : n > 16 ? 'Overestimated the folds needed' : 'Underestimated the folds needed'}; },
      keyLines:['Correct: 15 folds (14 folds is about 1.6 m, 15 folds is about 3.3 m).','Hundreds or thousands: thought each fold adds the same small amount. This is the most important wrong answer.','The pile is drawn to scale next to a door, so it stays tiny for a long time and then shoots up.']},
    {type:'game', short:'Folds to pass a 20-storey building', title:'Taller than the building', build:buildPaper, mode:'number', mmPerPx:300, ref:'building',
      say:'Now the elder points at a 20-storey building, about 60 metres tall. How many folds until your pile is taller than that? Type your number, then press I am sure.',
      show:function(a){ return 'Guessed ' + String(a).slice(1) + ' folds'; },
      judge:function(a){ var n = +String(a).slice(1); if (n === 20) return {ok:true}; return {tag: n === 19 ? 'Guessed one fold short' : n === 21 ? 'Guessed one fold too many' : n >= 100 ? 'Guessed in the hundreds or thousands (added 0.1 mm per fold)' : n > 21 ? 'Overestimated the folds needed' : 'Underestimated the folds needed'}; },
      keyLines:['Correct: 20 folds (19 folds is about 52 m, 20 folds is about 105 m).','This tests whether the doubling idea transferred from the door level: 5 more folds multiplies the height by about 32.']},
    {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher what surprised you about how the pile grew. This is optional.'}
  ]
});
})();
