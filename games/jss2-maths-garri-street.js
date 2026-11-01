/* Struggle First game: jss2-maths-garri-street. One file per game. Needs engine.js. */
(function(){
  var buildStreet = SF.buildStreet;
SF.add({
  id:'jss2-maths-garri-street', adventure:true, unit:'Chapter', icon:'garri', facts:['Full sack: 64 cups','Each share: half of what is in your hands goes to the next house'], outro:'Mama Ngozi thanks you and closes her stall.', title:'The Garri Street', topic:'Repeated halving, shrinking amounts and the idea that halving never reaches zero', minutes:45, approved:null,
  intro:'Mama Ngozi sells garri at Eke market. After a good harvest she has a sack of <b>64 cups</b> to give to the families on her street. Her rule is fair: each family gets <b>half of what she is holding</b> at that moment, and she keeps the other half. You are her helper.',
  steps:[
    {type:'game', short:'Guess the last house', title:'How far down the street?', build:buildStreet, mode:'predict', startAmt:64, capText:'64 cups',
      say:'Mama Ngozi wants to end up holding just 1 cup. Tap the house you think will get the last share, then press I am sure. The game will share with that many houses.',
      show:function(a){ return 'Guessed house ' + String(a).slice(1); },
      judge:function(a){ var n = +String(a).slice(1); if (n === 6) return {ok:true}; return {tag: n === 7 ? 'Counted the starting sack as a house' : n === 5 ? 'Guessed one house short' : n === 8 ? 'Divided 64 by 8 (guessed 8)' : n < 5 ? 'Guessed far too few houses' : 'Guessed far too many houses'}; },
      keyLines:['Correct: house 6 (64, 32, 16, 8, 4, 2, 1 means six halvings).','After locking in, the game shares with as many houses as the learner chose, so they see the result of their own guess. There is no retry.']},
    {type:'game', short:'What is left after 3 shares', title:'Cups and crumbs', build:buildStreet, mode:'pie', startAmt:1, capText:'1 cup',
      say:'Mama Ngozi has 1 cup left for the last few houses. Share half three times, then say which cup shows what is left in her hands.',
      show:function(a){ var d = +String(a).slice(1); return d ? 'Chose the 1/' + d + ' cup' : 'Chose the empty cup'; },
      judge:function(a){ var d = +String(a).slice(1); if (d === 8) return {ok:true}; return {tag: d === 6 ? 'Treated three halvings as dividing by 2 times 3' : d === 3 ? 'Divided by the number of halvings instead of halving that many times' : 'Thinks halving empties the bowl'}; },
      keyLines:['Correct: 1/8 of a cup.','1/6: treated three halvings as 2 times 3. 1/3: divided by the count. Empty: thinks halving empties the bowl.','The amount is not printed on screen while sharing, so the learner has to work it out.']},
    {type:'game', short:'Rewind (doubling back)', title:'Rewind', build:buildStreet, mode:'double', startAmt:0.25, capText:'1/4 cup',
      say:'The next harvest is in! Mama Ngozi holds 1/4 cup and wants her whole 64 cup sack back. Double it again and again. When you think she is back to 64 cups, press I am sure.',
      show:function(a){ return 'Doubled ' + String(a).slice(1) + ' times'; },
      judge:function(a){ var n = +String(a).slice(1); if (n === 8) return {ok:true}; return {tag: n === 6 ? 'Reused the count from 64 cups down to 1 cup' : n === 7 ? 'Stopped one doubling short' : n === 9 ? 'Went one doubling too far' : n < 7 ? 'Stopped far too early' : 'Went far too far'}; },
      keyLines:['Correct: 8 doublings.','6 doublings: reused the earlier count. 7 or 9: one off.','The amount is not printed, so the learner must count the doublings themselves. They can press Start again before locking in.']},
    {type:'game', short:'Is it ever all gone?', title:'Is it ever gone?', build:buildStreet, mode:'crumb', startAmt:1,
      say:'Mama Ngozi has a magic spoon that can split anything. Share half as many times as you like, then say what you believe.',
      show:function(a){ return a === 'n' ? 'Said there is always a crumb' : 'Said it will all be gone (after ' + String(a).slice(1) + ' shares tried)'; },
      judge:function(a){ if (a === 'n') return {ok:true}; return {tag:'Thought repeated halving eventually runs out'}; },
      keyLines:['Correct: there is always a crumb left.','Wrong: thinks repeated halving eventually reaches nothing.']},
    {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher how fast the garri shrank at the start compared with later. This is optional.'}
  ]
});
})();
