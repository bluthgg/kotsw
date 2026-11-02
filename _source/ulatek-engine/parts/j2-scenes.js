/* ---------- scene definitions ---------- */
function tankOf(id){ return roster().filter(function(p){ return p.id===id; }); }
function eggs(ids,big){ return ids.map(function(id){ return {id:id,type:'egg',big:id===big}; }); }
function nt(){ return {noTank:true}; }

function cfgP1(){
  var G=function(g){ return members(g,nt()); };
  var BOSS=[300,142], TAIL=[388,255];
  var BOSS2=[164,215], TAIL2=[400,137];
  var A={T0:BOSS,T1:TAIL}, B={T0:TAIL,T1:BOSS};
  var A2={T0:BOSS2,T1:TAIL2}, B2={T0:TAIL2,T1:BOSS2};
  var nonT=roster().filter(function(p){ return p.role!=='T'; })
    .sort(function(a,b){ return ORDER[a.role]-ORDER[b.role]||a.i-b.i; });
  var mixed=function(x,y,s){ return merge(cluster(nonT,x,y,s,5),{otag:null,etag:null}); };
  var carrier=function(k,n){ if(!nonT.length) return null; return 'at:'+nonT[Math.min(nonT.length-1,Math.floor((k+.5)*nonT.length/n))].id; };
  var carry=function(ids,odd){ var o={}; ids.forEach(function(id,k){ o[id]=carrier(k,ids.length); }); return o; };
  var nm=function(id){ return disp(tankOf(id)[0]); };
  var whoT=function(sw){ return who('tank','Tanks',"Ula'tek / Tail",[],(sw?nm('T1'):nm('T0'))+' / '+(sw?nm('T0'):nm('T1'))); };
  var coils=[who('odds','Odds','First soak',G('o')),who('evens','Evens','Second soak',G('e'))];
  var G3=['g1','g2','g3'], H8=['h1','h2','h3','h4','h5','h6','h7','h8'], AD=['ad1','ad2','ad3','ad4','ad5'];
  var adds=AD.map(function(id){ return {id:id,type:'egg',cls:'add'}; });
  var ents=eggs(G3.concat(H8)).concat(adds).concat(groupEnts());
  var nul=function(ids){ var o={}; ids.forEach(function(k){ o[k]=null; }); return o; };
  var atCoils=function(){ return merge(grp('o',380,340,.65,nt()),grp('e',380,170,.65,nt())); };
  var atCoils2=function(){ return merge(grp('o',485,145,.65,nt()),grp('e',315,145,.65,nt())); };
  var addsInCircles={ad1:[473,151],ad2:[497,151],ad3:[485,135],ad4:[303,151],ad5:[327,151]};
  var halfCarried={}; H8.forEach(function(id,k){ halfCarried[id]=(k%2===0)?carrier(k,8):null; });
  var halfGround={h1:[190,215],h2:[227,185],h3:[237,245],h4:[274,215],h5:[310,183],h6:[320,247],h7:[354,215],h8:[388,215]};
  var mixPick={}; H8.forEach(function(id,k){ mixPick[id]=(k%2===0)?carrier(k,8):halfGround[id]; });
  return {hold:5600, ents:ents, steps:[
    {t:'Pull: three eggs in the center', p:"Three eggs sit in the middle of the platform. Walk over each one to carry it. One tank on Ula'tek and one on the Tail. Groups stay mixed for now.",
      pos:merge(mixed(300,225,.85),A,{g1:[290,215],g2:[320,195],g3:[350,215]}), who:[whoT(false)]},
    {t:'Wave 1: she turns left', p:"Her head turns left, so the wave comes from the left. Stay close to Ula'tek, shift to the right of her and group up. Do not get hit holding an egg.",
      pos:merge(mixed(390,172,.8),A,carry(G3)), who:[]},
    {t:'Wave 2: she turns right', p:"Now her head turns right. Slide to the left side of her, still close to Ula'tek, and group up. The Tail sends smaller waves too, so stay together.",
      pos:merge(mixed(215,172,.8),A,carry(G3)), who:[]},
    {t:'Tanks swap after the waves', p:"The tanks swap places now, one on Ula'tek and one on the Tail. The raid regroups in the middle, still holding the eggs.",
      pos:merge(mixed(300,225,.85),B,carry(G3)), who:[whoT(true)]},
    {t:'Spectral Coils: Odds first, Evens second', p:"Odds take the first soak, the tail's right coil. Evens take the second, the left coil. The tail can pop up on either side. The timing is the same. The held eggs pop and the first adds spawn inside the circles.",
      pos:merge(atCoils(),B,nul(G3),{ad1:[380,346],ad2:[380,176],ad3:[394,332]}), who:coils},
    {t:'Mephitic Thrash: leave the half circle', p:"The Tail slams a huge half circle in front of it. Nobody should be standing there, so everyone moves out of the red zone. The first adds are cleaned up by now. The tank on the Tail runs out too and comes back in after.",
      pos:merge(mixed(200,225,.85),{T0:[318,255],T1:BOSS},nul(['ad1','ad2','ad3'])), who:[whoT(true)]},
    {t:'Ula\'tek and the Tail submerge', p:"After the Thrash, Ula'tek and the Tail dive under the platform. The dashed outlines show where they go down and where they will come back up: Ula'tek moves from the north to the west, and the Tail from the east to the north. The raid gathers in the center and waits.",
      pos:merge(mixed(320,230,.85),{T0:[250,215],T1:[250,243]}), who:[]},
    {t:'They re-emerge: Ula\'tek west, Tail north', p:"Ula'tek comes up on the west side and the Tail on the north. Every position from here on is measured from their new spots. Tanks take them back up and the raid stays in the center.",
      pos:merge(mixed(310,230,.85),B2), who:[whoT(true)]},
    {t:'Eggs spawn again: 6 to 8', p:"Call of the Serpent drops a second set of 6 to 8 eggs, spread across the center out from Ula'tek. The raid collects them, some already picked up and some still on the ground.",
      pos:merge(mixed(290,215,.95),B2,mixPick), who:[]},
    {t:"Mother's Wrath: tanks swap again", p:"Everyone is holding an egg now. After the next Mother's Wrath the tanks swap again. The tank gets slowed. Remove it with a movement ability, like Druid shapeshift or Paladin Freedom.",
      pos:merge(mixed(290,215,.95),A2,carry(H8)), who:[whoT(false)]},
    {t:'Second waves, wave 1: she turns north', p:"Another wave phase, again two big waves. The direction is random each time. This time her head turns north, so the wave comes from the north. Drop to the south of her, stay close to Ula'tek and group up. A wave hitting an egg carrier spawns a Viper. If that happens, nuke it down.",
      pos:merge(mixed(175,320,.8),A2,carry(H8)), who:[]},
    {t:'Second waves, wave 2: she turns south', p:"The second wave always goes the opposite way from the first, so move as one group to the other side. Her head turns south, so go to the north of her, stay close, and keep the eggs safe. The Tail still sends small waves.",
      pos:merge(mixed(175,110,.8),A2,carry(H8)), who:[]},
    {t:'Spectral Coils again: adds spawn', p:'Same soaks, Odds first then Evens. Face the Tail from the center: Odds take the right side (east), Evens the left side (west). The eggs pop and all the adds spawn inside the circles. Use Heroism the moment they appear.',
      pos:merge(atCoils2(),A2,nul(H8),addsInCircles), who:coils},
    {t:"Tank moves the adds to Ula'tek", p:"The tank pulls the adds to Ula'tek quickly so everyone can cleave them down as the Heart phase starts.",
      pos:merge(mixed(262,325,.85),{T0:BOSS2,T1:[267,215]},{ad1:[207,185],ad2:[217,215],ad3:[207,245],ad4:[234,200],ad5:[239,230]}),
      who:[who('tank','Tank','Moves the adds',[],nm('T1'))]},
    {t:'Rage of the Shackled: burst the Heart', p:'This usually starts right at 2 minutes. Use your potion now. The Heart takes 100% more damage for 20 seconds. Dodge the falling debris.',
      pos:merge(mixed(250,215,.9),{T0:[164,196],T1:[164,234]},nul(AD)), who:[who('tank','Tanks','Both on the Heart',[],nm('T0')+' / '+nm('T1'))]}
  ]};
}

var TP={o:[],e:[]};
function rerollTethers(){ TP={o:[],e:[]}; }
function cfgP2(){
  var tank=function(g){ return members(g).filter(function(p){ return p.role==='T'; }); };
  var ox=function(g,x){ return g==='o'?x:640-x; };
  var P=function(g,x,y){ return [ox(g,x),y]; };
  function side(g,cx,cy,s,tx,ty){
    var o=grp(g,ox(g,cx),cy,s,nt());
    tank(g).forEach(function(p,k){ o[p.id]=P(g,tx,ty+k*26); });
    return o;
  }
  function both(cx,cy,s,tx,ty){ return merge(side('o',cx,cy,s,tx,ty),side('e',cx,cy,s,tx,ty)); }
  function tethered(g){
    var all=members(g), keep=TP[g].filter(function(id){ return all.some(function(p){ return p.id===id; }); });
    if(keep.length<Math.min(3,all.length)){
      var pool=all.slice(), pk=[];
      while(pk.length<Math.min(3,all.length)){ pk.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0].id); }
      TP[g]=pk; keep=pk;
    }
    return all.filter(function(p){ return keep.indexOf(p.id)>-1; });
  }
  function placeG(g,list,pts){ var o={}; list.forEach(function(p,k){ o[p.id]=P(g,pts[k][0],pts[k][1]); }); return o; }
  function lines3(g,list,cls){ return list.map(function(p){ return [P(g,112,128),p.id,cls||'']; }); }
  function nonTank(g){ return members(g,nt()); }
  function pick(g,k){ var l=nonTank(g); return l.length?l[k%l.length]:null; }
  function mover(g){ var l=nonTank(g), id=R.egg&&R.egg[g]; if(id){ var f=l.filter(function(p){ return p.id===id; }); if(f[0]) return f[0]; } var m=l.filter(function(p){ return p.role==='M'; }); return (m[0]||l[0])||null; }
  var tO=tethered('o'), tE=tethered('e');
  var slack=[[72,150],[112,160],[152,150]], stretch=[[40,76],[184,76],[112,222]];
  var G=function(g){ return members(g); };
  var GR=[[56,192],[84,174],[114,186],[144,168],[64,222],[92,236],[108,226]];
  var BIG=[112,66], CAUL=[100,326];
  var RING=[[58,322],[142,322],[66,352],[134,352],[100,364],[62,292],[140,292]];
  var sfx={o:'a',e:'b'}, ents=[], sIds=[], aIds=[], eIds=[];
  ['o','e'].forEach(function(g){
    var x=sfx[g];
    for(var i=1;i<=7;i++){ ents.push({id:x+i,type:'egg'}); ents.push({id:'s'+x+i,type:'egg',cls:'add'}); }
    ents.push({id:x+'b',type:'egg',big:true}); ents.push({id:'g'+x,type:'egg',cls:'add',big:true});
    ents.push({id:'w'+x,type:'warden'});
  });
  ents=ents.concat(groupEnts());
  function setAll(fn){ var o={}; ['o','e'].forEach(function(g){ merge(o,{}); var r=fn(g,sfx[g]); for(var k in r) o[k]=r[k]; }); return o; }
  function eggsAt(g,x){ var o={}; for(var i=0;i<7;i++) o[x+(i+1)]=P(g,GR[i][0],GR[i][1]); o[x+'b']=P(g,BIG[0],BIG[1]); return o; }
  function hideSmallAdds(x){ var o={}; for(var i=1;i<=7;i++) o['s'+x+i]=null; return o; }
  var hideAll=setAll(function(g,x){ var o=hideSmallAdds(x); o['g'+x]=null; o['w'+x]=null; for(var i=1;i<=7;i++) o[x+i]=null; o[x+'b']=null; return o; });
  var gate={o:null,e:null};
  return {hold:5600, ents:ents, steps:[
    {t:"Ula'tek dives: split", p:'Odds go left and Evens go right. A venom gap separates the main platform from each ledge. A Warlock gateway makes the crossing easy. Movement abilities or swimming work too.',
      pos:merge(both(293,262,.58,270,312),hideAll),
      who:[who('odds','Odds','Go left',G('o')),who('evens','Evens','Go right',G('e'))]},
    {t:'Cross the venom, climb the stairs', p:'Cross the small venom gap and take the stairs at the back end of your ledge. Keep the gateway for the trip home.',
      pos:merge(both(226,268,.6,233,240),setAll(function(g,x){ var o=eggsAt(g,x); o['w'+x]=P(g,112,100); return o; })), who:[]},
    {t:'Tank pulls the Warden behind the line', p:'At the very start the tank brings the Warden behind the small line by the stairs. That makes it bug, teleport or molt and snap onto the set of eggs. Those eggs can be killed quickly, and they sit close to the cauldron.',
      pos:merge(both(88,276,.72,178,232),setAll(function(g,x){ var o={}; o['w'+x]=P(g,178,264); return o; })),
      who:[who('tank','Tanks','Pull the Warden behind the line',[],tank('o').concat(tank('e')).map(disp).join(', '))]},
    {t:'Kill the Warden and its eggs', p:'The Warden snaps onto the eggs. Tanks interrupt every Malice and keep it next to the attackable eggs. Everyone else burns the eggs and the Warden down.',
      pos:merge(both(88,276,.72,96,222),setAll(function(g,x){ var o={}; o['w'+x]=P(g,96,198); return o; })),
      who:[who('tank','Tanks','Interrupt Malice',[],tank('o').concat(tank('e')).map(disp).join(', '))]},
    {t:'Odds snap their tethers first', p:'The Warden is dead. 3 random players per side are tethered, whether melee, ranged, healer or tank. Odds spread out slowly until their 3 tethers snap. Evens keep still and wait. Dodge the swirlies.',
      pos:merge(both(112,272,.72,150,250),hideAll,eggsAt('o','a'),eggsAt('e','b'),placeG('o',tO,stretch),placeG('e',tE,slack)),
      lines:lines3('o',tO).concat(lines3('e',tE,'slack')),
      who:[who('odds','Odds','Snap tethers',tO),who('evens','Evens','Wait',tE)]},
    {t:'Odds DoT drops, then Evens snap', p:'When the Odds DoT falls off, Evens spread out and snap their 3 tethers. Odds stay out of the swirlies.',
      pos:merge(placeG('o',tO,slack),placeG('e',tE,stretch)), lines:lines3('e',tE),
      who:[who('evens','Evens','Snap tethers',tE),who('odds','Odds','DoT dropped',[],'wait for it to clear')]},
    {t:'Small eggs to the cauldron', p:'DPS, healers and tanks all carry the small eggs (6 to 8) to the cauldron. The tank stays at the cauldron and picks up the small adds. Avoid every green falling circle. One hatches an egg and makes the adds harder to kill.',
      pos:merge(both(150,262,.72,100,284),setAll(function(g,x){
        var o={}, c=[pick(g,1),pick(g,3),pick(g,5)];
        for(var i=1;i<=4;i++){ o[x+i]=null; o['s'+x+i]=RING[i-1]?P(g,RING[i-1][0],RING[i-1][1]):null; }
        for(var k=0;k<3;k++){ o[x+(5+k)]=c[k]?'at:'+c[k].id:null; }
        return o; }),{ab:P('o',BIG[0],BIG[1]),bb:P('e',BIG[0],BIG[1])}),
      who:[who('tank','Tanks','Hold the cauldron adds',[],tank('o').concat(tank('e')).map(disp).join(', '))]},
    {t:'Big egg goes in last', p:'Assign one player with a movement ability to grab the big egg at the very end of the ledge. Bring it to the cauldron only after every small egg is in.',
      pos:merge(setAll(function(g,x){
        var o={}, m=mover(g);
        for(var i=5;i<=7;i++){ o[x+i]=null; o['s'+x+i]=P(g,RING[i-1][0],RING[i-1][1]); }
        if(m){ o[m.id]=P(g,120,170); o[x+'b']='at:'+m.id; }
        return o; })),
      who:[who('odds','Odds','Big egg runner',mover('o')?[mover('o')]:[]),who('evens','Evens','Big egg runner',mover('e')?[mover('e')]:[])]},
    {t:'Nuke the adds', p:'Everything hatches around the cauldron and the tank holds it. The big add has a frontal, so the tank turns it away from the group. It also casts a stun on the whole raid unless it is interrupted. Strong DPS can kill every add here.',
      pos:merge(setAll(function(g,x){
        var o={}, m=mover(g);
        if(m) o[m.id]=P(g,122,300); o[x+'b']=null; o['g'+x]=P(g,CAUL[0],CAUL[1]);
        return o; })),
      who:[who('tank','Tanks','Turn the frontal away',[],tank('o').concat(tank('e')).map(disp).join(', '))]},
    {t:'Back to the main platform', p:'With strong DPS, kill all the adds and use the Warlock gateway when it is ready (1:30 cooldown) to go back. If DPS struggles, bring everything back to the main platform and kill the adds there.',
      pos:merge(both(293,262,.58,270,312),setAll(function(g,x){ var o=hideSmallAdds(x); o['g'+x]=null; return o; })), who:[]},
    {t:'Rage of the Shackled: burn the Heart', p:"Back on the main platform, Ula'tek rises and the Heart takes 100% more damage for 20 seconds. This is the heart burn phase at the very end of Phase 2. Use cooldowns and burst it down.",
      pos:merge(both(293,262,.58,270,312)), who:[who('odds','Odds','Burst the Heart',G('o')),who('evens','Evens','Burst the Heart',G('e'))]},
    {t:'Ula\'tek dives: the intermission starts', p:"After the Heart phase Ula'tek goes under the venom, the platform trembles and the intermission begins. Get ready to follow your tank.",
      pos:merge(both(293,262,.58,270,312)), who:[]}
  ]};
}

var SPOTS=[[320,75],[484,138],[484,262],[320,325],[156,262],[156,138]];
function cfgInt(){
  var O=members('o'), E=members('e');
  var at=function(g,k){ return grp(g,SPOTS[k][0],SPOTS[k][1]+8,.8); };
  var soakO=who('odds','Odds','Soak casts 1, 3, 5',O), soakE=who('evens','Evens','Soak casts 2, 4, 6',E);
  var EG=[[262,158],[302,140],[344,152],[384,168],[246,206],[290,192],[336,206],[380,214],[420,198],[272,250],[318,260],[364,252]];
  var eIds=EG.map(function(p,i){ return 'x'+i; });
  var aIds=[]; SPOTS.forEach(function(sp,k){ for(var j=0;j<3;j++) aIds.push('q'+k+j); });
  var OFF=[[-44,-6],[44,-6],[0,-46]];
  var ents=eIds.map(function(id){ return {id:id,type:'egg'}; })
    .concat(aIds.map(function(id){ return {id:id,type:'egg',cls:'add'}; })).concat(groupEnts());
  var nonT=function(g){ return members(g,nt()); };
  var carriers=function(g,k,n){ var l=nonT(g), o={}; for(var j=0;j<2;j++){ var c=l.length?l[(k*2+j*3+1)%l.length]:null; o['x'+(k*2+j)]=c?'at:'+c.id:null; } return o; };
  var gone=function(k){ var o={}; o['x'+(k*2)]=null; o['x'+(k*2+1)]=null; return o; };
  var addsAt=function(k){ var o={}; for(var j=0;j<3;j++) o['q'+k+j]=[SPOTS[k][0]+OFF[j][0],SPOTS[k][1]+OFF[j][1]]; return o; };
  var killed=function(k){ var o={}; for(var j=0;j<3;j++) o['q'+k+j]=null; return o; };
  var ground={}; EG.forEach(function(p,i){ ground['x'+i]=p; });
  var allGone={}; aIds.forEach(function(id){ allGone[id]=null; }); eIds.forEach(function(id){ allGone[id]=null; });
  var cast=function(n,t,p,sg,wg,sk,wk){
    var pos=merge(at(sg,sk),at(wg,wk),gone(sk),addsAt(sk));
    if(sk>0) pos=merge(pos,killed(sk-1));
    if(wk<6&&wg!==sg&&wk!==sk&&wk>sk) pos=merge(pos,carriers(wg,wk));
    return {t:t,p:p,pos:pos,who:[sg==='o'?soakO:soakE]};
  };
  return {hold:4800, ents:ents, steps:[
    {t:'Eggs spread across the center', p:'Eggs spawn all over the middle of the platform. Each group picks them up and carries them to its soaks. This repeats a few times in the intermission, so keep grabbing eggs, soak with your tank and your group, and kill the adds. The slams can land anywhere, not always next to each other. Just take every other one.',
      pos:merge(grp('o',255,210,.7),grp('e',385,210,.7),ground,allGone,ground), who:[soakO,soakE]},
    {t:'Cast 1: Odds soak with eggs', p:'Odds follow their tank to the first smash carrying eggs. The eggs go into the soak and hatch adds. Evens wait at spot 2 with their eggs.',
      pos:merge(at('o',0),at('e',1),gone(0),addsAt(0),carriers('e',1)), who:[soakO]},
    {t:'Cast 2: Evens soak, Odds kill adds', p:'Evens soak spot 2 with their eggs, and more adds hatch. Odds kill the first adds, then run to spot 3 with their eggs.',
      pos:merge(at('e',1),at('o',2),gone(1),addsAt(1),killed(0),carriers('o',2)), who:[soakE]},
    {t:'Cast 3: Odds soak with eggs', p:'Odds soak spot 3 and drop their eggs for new adds. Evens clear the last adds, then move to spot 4 with eggs.',
      pos:merge(at('o',2),at('e',3),gone(2),addsAt(2),killed(1),carriers('e',3)), who:[soakO]},
    {t:'Cast 4: Evens soak, Odds kill adds', p:'Evens soak spot 4 with their eggs. Odds kill their adds and head to spot 5 with eggs.',
      pos:merge(at('e',3),at('o',4),gone(3),addsAt(3),killed(2),carriers('o',4)), who:[soakE]},
    {t:'Cast 5: Odds soak with eggs', p:'Odds soak spot 5 and drop the eggs. Evens kill their adds and go to the last spot.',
      pos:merge(at('o',4),at('e',5),gone(4),addsAt(4),killed(3),carriers('e',5)), who:[soakO]},
    {t:'Cast 6: Evens soak, kill the adds', p:'Evens take the last smash with their eggs. Everyone kills the remaining adds. Odds stay clear of the smash.',
      pos:merge(at('e',5),at('o',4),gone(5),addsAt(5),killed(4)), who:[soakE]},
    {t:'The platform shatters: stay in the middle', p:'The platform breaks into 4 pieces and everyone is knocked up. The knock-up pushes you outward. Stand close to the middle so you do not land in the venom, then take the fall into Phase 3.',
      pos:merge(grp('o',285,205,.8),grp('e',355,205,.8),allGone), who:[]}
  ]};
}

function cfgP3(){
  var rs=roster(), T=byRole('T'), H=byRole('H'), M=byRole('M'), Rn=byRole('R');
  var nExtra=Math.min(R.extra,Rn.length), extras=Rn.slice(Rn.length-nExtra), plain=Rn.slice(0,Rn.length-nExtra);
  var ents=rs.map(function(p){
    var cls={T:'tk',H:'hl',M:'ml',R:'rg'}[p.role];
    if(p.role==='R'&&extras.indexOf(p)>-1) cls+=' extra';
    return dotEnt(p,cls);
  });
  var EGG=[[275,150],[365,150],[365,250],[275,250]];
  for(var i=0;i<4;i++){ ents.push({id:'E'+i,type:'egg'}); ents.push({id:'A'+i,type:'egg',cls:'add'}); }
  var lanes=function(list){ var o={}; list.forEach(function(p,i){ var row=i%2, col=Math.floor(i/2); o[p.id]=[412+col*18, row?154:116]; }); return o; };
  var healSoak=H.concat(extras);
  var tk1={T0:[486,112],T1:[490,156]}, tk2={T0:[154,112],T1:[150,156]};
  var tn=T.map(disp).join(', ');
  var eggAt=function(){ var o={}; for(var k=0;k<arguments.length;k++) o['E'+arguments[k]]=EGG[arguments[k]]; return o; };
  var hatch=function(){ var o={}; for(var k=0;k<arguments.length;k++){ o['E'+arguments[k]]=null; o['A'+arguments[k]]=EGG[arguments[k]]; } return o; };
  var nulls=function(pre){ var o={}; for(var k=0;k<4;k++) o[pre+k]=null; return o; };
  var bitten={}; if(M[0]) bitten[M[0].id]='bite'; if(H[0]) bitten[H[0].id]='bite'; if(plain[0]) bitten[plain[0].id]='bite';
  var all={}, purgeNo={}; rs.forEach(function(p){ all[p.id]='purge'; if(!bitten[p.id]) purgeNo[p.id]='purge'; });
  var bitePurge=merge(purgeNo,bitten);
  var team1=merge(tk1,cluster(M,432,132,.8),cluster(H,165,135,.7),cluster(Rn,245,135,.7));
  var whoSoak=[who('melee','Melee','Soak on the Ula\'tek platform',M),who('heal','Healers','Left circle, left platform',healSoak),who('range','Ranged','Right circle, left platform',plain)];
  return {hold:5800, ents:ents, steps:[
    {t:'The venom bubbles', p:"The 4 platforms stand apart with venom between them and a Tail in the middle that you cannot target. The venom bubbles in front of the platform where Ula'tek will rise. Melee and tanks go to her platform. Healers and ranged go to the platform on her left.",
      pos:merge(team1,nulls('E'),nulls('A')),
      who:[who('melee','Melee','Her platform',M),who('heal','Healers','Platform to her left, left side',H),who('range','Ranged','Platform to her left, right side',Rn)]},
    {t:"Ula'tek rises, eggs spawn", p:'One egg spawns on every platform. Kill the eggs so the adds hatch and can be killed. Melee takes the egg to the right of Ula\'s platform and the egg on her platform. Ranged takes the rest.',
      pos:merge(team1,eggAt(0,1,2,3)), who:[]},
    {t:'Melee runs right, ranged kills the rest', p:"Melee runs to the platform to the right of Ula'tek and kills that egg. Ranged kills the other eggs from range. The off-tank grabs the adds as they spawn so they can be nuked down.",
      pos:merge(tk1,{T1:[388,176]},cluster(M,410,272,.8),cluster(H,165,135,.7),cluster(Rn,245,135,.7),hatch(0,2,3)),
      who:[who('melee','Melee','Right platform egg',M),who('range','Ranged','The other eggs',Rn),who('tank','Off-tank','Grab the adds',[],T[1]?disp(T[1]):'')]},
    {t:'Melee back, off-tank holds the adds', p:"Melee jumps back to Ula'tek's platform and kills that platform's egg. The off-tank holds all the adds together and everyone nukes them down. Interrupt every Vicious Echoes cast. Tanks swap on the tank buster that still comes in this phase.",
      pos:merge(tk1,{T1:[388,176]},cluster(M,410,140,.8),cluster(H,165,135,.7),cluster(Rn,245,135,.7),hatch(1),{A0:[352,160],A2:[372,184],A3:[350,178]}),
      who:[who('tank','Off-tank','Hold the adds',[],T[1]?disp(T[1]):''),who('tank','Tanks','Swap on each tank buster',T)]},
    {t:"Serpent's Bite: soak all three", p:"Melee soaks on Ula'tek's platform. Healers soak on the left circle of the platform to her left. Ranged soak on the right circle. Add extra ranged to the healer soak so it has 3 or 4 players. A missed soak is a wipe. The three players who soak do not get a Volatile Purge circle.",
      pos:merge(tk1,cluster(M,437,135,.6),cluster(healSoak,165,135,.6),cluster(plain,245,135,.6),nulls('A'),nulls('E')), flag:bitten, who:whoSoak},
    {t:'Volatile Purge: melee spread early', p:"Volatile Purge comes after the bite and before the first Circling Prey, so there is time. The three players who just soaked the bite do not get a purge circle. Melee and tanks spread their purge circles out on Ula'tek's platform. Healers and ranged spread on their own platform.",
      pos:merge(spread(M.concat(T),352,60,488,170),spread(H.concat(Rn),124,56,292,170)), flag:purgeNo,
      who:[who('melee','Melee and tanks','Spread on her platform',M.concat(T)),who('heal','Healers and ranged','Spread on their platform',H.concat(Rn))]},
    {t:'Orbs and tail waves: dodge', p:"Orbs spawn on the front of Ula'tek's platform and send out single waves. Stand in the gaps between the orb lines so the waves miss you. The Tail also sends single waves that hurt a lot, so dodge them.",
      pos:merge(tk1,lanes(M),spread(H,126,70,200,170),spread(Rn,214,70,290,170),nulls('A'),nulls('E')), who:[]},
    {t:'Circling Prey: melee jump left', p:"Circling Prey destroys the platform Ula'tek is on. Melee and tanks jump to the platform on the left. After that she always moves to the left.",
      pos:merge(spread(M.concat(T),214,66,292,166),spread(H.concat(Rn),124,64,206,166)),
      who:[who('melee','Melee and tanks','Jump to the left platform',M.concat(T))]},
    {t:"Round 2: Ula'tek moves left, eggs spawn", p:"She moves to the left, to the platform the others just jumped to, and eggs spawn again. Melee and tanks stay on her platform. Healers and ranged go to the platform on her left.",
      pos:merge(tk2,cluster(M,215,132,.8),cluster(H,165,268,.7),cluster(Rn,245,268,.7),eggAt(0,2,3),nulls('A')),
      who:[who('melee','Melee','Her platform',M),who('range','Ranged','The other platforms',Rn)]},
    {t:'Melee kills only her egg', p:"With the first platform gone, melee no longer jumps to the platform on her right. Melee just kills the egg on Ula'tek's platform. Ranged gets the others. The off-tank grabs the adds so they can be nuked down.",
      pos:merge(tk2,{T1:[300,176]},cluster(M,215,132,.8),cluster(H,165,268,.7),cluster(Rn,245,268,.7),hatch(0,2,3),{A2:[304,158],A3:[270,172]}),
      who:[who('melee','Melee','Her egg only',M),who('range','Ranged','The other eggs',Rn),who('tank','Off-tank','Grab the adds',[],T[1]?disp(T[1]):'')]},
    {t:"Bite into Purge: use a defensive", p:"The second round is where Serpent's Bite runs straight into Volatile Purge and Circling Prey with very little time to move. This is a good place for a defensive. Soak first.",
      pos:merge(tk2,cluster(M,195,135,.6),cluster(healSoak,165,268,.6),cluster(plain,245,268,.6),nulls('E'),nulls('A')), flag:bitePurge, who:whoSoak},
    {t:'Purge overlaps Circling Prey: healers and ranged to the back', p:"This time Volatile Purge overlaps Circling Prey. Healers and ranged move to the back of their platform, so melee and tanks have room to jump over and spread their circles.",
      pos:merge(spread(M.concat(T),124,226,294,262),spread(H.concat(Rn),166,284,296,352)), flag:purgeNo,
      who:[who('heal','Healers and ranged','Move to the back of the platform',H.concat(Rn)),who('melee','Melee and tanks','Jump and spread',M.concat(T))]},
    {t:'Last platform: the third Heart', p:"At the very end everyone is on the last platform. This is the last hurrah, so use everything on the Heart. She moves left once more. Before Circling Prey destroys the last platform, the venom does heavy damage to anyone who falls in.",
      pos:merge({T0:[150,240],T1:[156,284]},cluster(M,215,262,.65),cluster(H,190,322,.6),cluster(Rn,258,302,.6),nulls('E'),nulls('A')), flag:{}, who:[]}
  ]};
}

/* intermission spots (static) */
(function(){
  var g=$('#int-spots'); if(!g) return;
  SPOTS.forEach(function(s,k){
    var odd=(k%2===0), cls=odd?'odds':'evens', f=odd?'f-odds':'f-evens';
    svgEl('circle',{'class':'zone',cx:s[0],cy:s[1],r:46},g);
    svgEl('circle',{'class':'ov hot '+cls,'data-on':String(k+1),cx:s[0],cy:s[1],r:46},g);
    svgEl('circle',{cx:s[0]+36,cy:s[1]-36,r:12,'class':f,style:'stroke:var(--bg);stroke-width:2'},g);
    var t=svgEl('text',{'class':'lbl sm',x:s[0]+36,y:s[1]-36,style:'fill:var(--bg)'},g); t.textContent=String(k+1);
  });
})();
