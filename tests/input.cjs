const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const el=()=>({style:{},setAttribute(){},classList:{add(){},remove(){},toggle(){}},append(){},querySelector:el});
const els={},ctx=new Proxy({}, {get:()=>()=>{}}),captures=new Set();
const canvas={...el(),getContext:()=>ctx,getBoundingClientRect:()=>({left:0,top:0,width:400,height:225}),setPointerCapture:id=>captures.add(id),hasPointerCapture:id=>captures.has(id),releasePointerCapture:id=>captures.delete(id)};
const box={assert,console,Math,encodeURIComponent,localStorage:{getItem:()=>0},document:{querySelector:()=>canvas,getElementById:i=>els[i]??=el(),createElement:el,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},requestAnimationFrame(){}};
vm.createContext(box);
vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../game.js'),'utf8')+`
function event(time,x=100,y=150,type='touch',button=0){return {timeStamp:time,clientX:x,clientY:y,pointerId:1,pointerType:type,button,preventDefault(){}}}
function tap(t,x=100,type='touch',button=0){c.onpointerdown(event(t,x,150,type,button));c.onpointerup(event(t+40,x,150,type,button))}
function setup(gun){begin();choose(gun)}
setup(3);tap(0,50);assert.equal(hands[0],11);assert.equal(hands[1],12);handCool=[0,0];pistolGap=0;tap(300,50);assert.equal(hands[0],11);tap(600,350);assert.equal(hands[1],11);
for(const gun of [0,1]){setup(gun);tap(0);assert.equal(reloads[gun],0);tap(150);assert.equal(reloads[gun],guns[gun].reload);assert.equal(ammo[gun],guns[gun].cap-1);assert.equal(down,false);
setup(gun);ammo[gun]=0;tap(0);tap(150);assert.equal(reloads[gun],guns[gun].reload);
setup(gun);tap(0);tap(150,250);assert.equal(reloads[gun],0);
setup(gun);c.onpointerdown(event(0));c.onpointerup(event(400));tap(450);assert.equal(reloads[gun],0);
setup(gun);c.onpointerdown(event(0));c.onpointermove(event(20,140));c.onpointermove(event(30,100));c.onpointerup(event(40));tap(150);assert.equal(reloads[gun],0);
setup(gun);tap(0);choose(3);choose(gun);tap(150);assert.equal(reloads[gun],0);
setup(gun);tap(0);pause();pause();tap(150);assert.equal(reloads[gun],0);
setup(gun);tap(0);tap(500);assert.equal(reloads[gun],0);
setup(gun);tap(0,100,'mouse');reload();assert.equal(reloads[gun],0);for(let i=0;i<4;i++)tap(100+i*100,100,'mouse',2);assert.equal(reloads[gun],0);tap(600,100,'mouse',2);assert.equal(reloads[gun],guns[gun].reload);
}
setup(1);c.onpointerdown(event(0));assert.equal(down,true);c.onpointercancel(event(20));assert.equal(down,false);assert.equal(activePointer,null);tap(150);assert.equal(reloads[1],0);
setup(1);c.onpointerdown(event(0));c.onlostpointercapture(event(20));assert.equal(down,false);
setup(3);tap(0,350,'mouse',0);handCool=[0,0];pistolGap=0;tap(300,50,'mouse',2);assert.deepEqual(hands,[11,11]);
setup(2);tap(0);tap(150);assert.equal(reloads[2],0);
assert.equal(c.onmousedown,undefined);assert.ok(reportUrl().includes(encodeURIComponent('https://layer812.github.io/greenline/')));
console.log('PASS: mobile sides/alternation, double-tap/full/empty magazines, hold/drag/distance/timeout, switch/pause/cancel, PC reload and pistol controls, share URL');
`,box);
