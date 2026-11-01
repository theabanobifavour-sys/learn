/* Struggle First game: jss2-maths-naira-tower. One file per game. Needs engine.js. */
(function(){
  var buildTower = SF.buildTower;
  var naira = SF.naira;
  var rungJudge = SF.rungJudge;
SF.add({
  id:'jss2-maths-naira-tower', adventure:true, unit:'Customer', icon:'bag', facts:['Floor 1 is a sweets kiosk: everything costs ₦10','Each floor up sells at 10 times the price of the floor below'], outro:'The tower closes for the night. Thank you for the rides.', title:'The Naira Tower', topic:'Orders of magnitude and the log scale, as a lift in a tower of shops', minutes:45, approved:null,
  intro:'You are the lift operator at the Naira Tower in Owerri. The tower has seven floors of shops, and every shop sells at <b>ten times</b> the price of the shop below it. Floor 1 is a sweets kiosk where everything costs <b>₦10</b>. Customers climb in and tell you what they want. Take each one to the right shop. Prices in this game are rounded.',
  steps:[
    {type:'game', short:'Find the shop (school bag)', title:'School bag for Amaka', build:buildTower, mode:'tap', item:'bag', price:10000, known:[1,2], color:'#C2410C',
      say:'Amaka wants a school bag from the shop that sells at ₦10,000. Tap that floor, then take her there.',
      show:function(a){ var n = +String(a).slice(1); return 'Went to floor ' + n; },
      judge:rungJudge(4, function(n){ return n <= 2 ? 'Went to a floor already labelled below the price' : n === 3 ? 'One floor short (counted the floors wrongly)' : n === 5 ? 'One floor too high' : 'Went far too high (guessed from how big the number looks)'; }),
      keyLines:['Correct: the 4th floor (₦10,000).','One floor off: a counting slip.','Far too high: guessing from the size of the number, not counting the jumps.']},
    {type:'game', short:'No labels (phone)', title:'Phone for Emeka', build:buildTower, mode:'tap', item:'phone', price:100000, known:[1], color:'#1E8E5A',
      say:'Emeka wants a phone from the shop that sells at ₦100,000. Most of the signs are hidden now. Which floor is it?',
      show:function(a){ var n = +String(a).slice(1); return 'Went to floor ' + n; },
      judge:rungJudge(5, function(n){ return n <= 3 ? 'Went too low' : n === 4 ? 'One floor short (counted the floors wrongly)' : n === 6 ? 'One floor too high' : 'Went far too high'; }),
      keyLines:['Correct: the 5th floor (₦100,000).','Watch for learners who find "count the zeros". Ask how they knew.']},
    {type:'game', short:'Ride the lift (sweets to motorbike)', title:'Motorbike for Chidi', build:buildTower, mode:'count', item:'bike', price:1000000, start:1, startPrice:10, known:[], color:'#7C3AED',
      say:'Chidi is at the sweets kiosk (₦10). He wants the motorbike shop that sells at ₦1,000,000. Press Up as many times as you need, then open the doors.',
      show:function(a){ return 'Climbed ' + String(a).slice(1) + ' floors'; },
      judge:function(a){ var n = +String(a).slice(1); if (n === 5) return {ok:true}; return {tag: n === 6 ? 'Climbed one floor too far (counted an extra zero)' : n === 4 ? 'Stopped one floor short (dropped a zero)' : n === 0 ? 'Opened the doors without climbing' : 'Stopped far from the right floor'}; },
      keyLines:['Correct: 5 climbs (floor 6, ₦1,000,000).','6 climbs: counted an extra zero. 4 climbs: dropped a zero.']},
    {type:'game', short:'Cement to rice (one floor)', title:'Rice for Mama Uche', build:buildTower, mode:'count', item:'rice', price:90000, start:3.954, startPrice:9000, known:[], color:'#0E7490',
      say:'Mama Uche is at the cement shop (₦9,000). She wants the rice shop (₦90,000). Press Up as many times as you need, then open the doors.',
      show:function(a){ return 'Climbed ' + String(a).slice(1) + ' floors'; },
      judge:function(a){ var n = +String(a).slice(1); if (n === 1) return {ok:true}; return {tag: n === 0 ? 'Opened the doors without climbing' : n === 2 ? 'Climbed two floors (counted each shop as a floor)' : 'Climbed many floors (read the naira gap as a number of floors)'}; },
      keyLines:['Correct: 1 climb. The shops are exactly one floor apart even though neither sits on a labelled floor.','Many climbs: read the ₦81,000 gap as a number of floors (linear thinking).']},
    {type:'game', short:'Between floors (sandals)', title:'Sandals for Uche', build:buildTower, mode:'slider', item:'sandals', price:3000, known:[3,4], color:'#B4600B',
      say:'Uche wants sandals from the shop that sells at ₦3,000. It sits between the ₦1,000 floor and the ₦10,000 floor. Use the lever to stop at it, then open the doors.',
      show:function(a){ return 'Stopped ' + String(a).slice(1) + '% of the way up the gap'; },
      judge:function(a){ var v = +String(a).slice(1); if (v >= 38 && v <= 60) return {ok:true, note:'Stopped near halfway'}; return {tag: v < 38 ? 'Spaced the naira evenly along the gap (stopped too close to ₦1,000)' : 'Stopped too close to ₦10,000'}; },
      keyLines:['Correct: near the middle (about 48% of the way), because ₦3,000 is about 3 times ₦1,000 and the middle of a ten-times jump is about 3 times.','Too low: spaced the naira evenly (linear thinking).']},
    {type:'text', short:'Note for your teacher', prompt:'Anything you noticed? Tell your teacher what trick you used. This is optional.'}
  ]
});
})();
