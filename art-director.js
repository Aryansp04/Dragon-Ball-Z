import * as T from './vendor/three.module.js';
import {AnimeAudio} from './audio.js';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const sound=new AnimeAudio();
const characters=[
 {name:'SON GOKU',id:'goku',tag:'EARTH’S WARRIOR',forms:['BASE','SUPER SAIYAN','SUPER SAIYAN 2','SUPER SAIYAN 3'],color:0xffce42,move:'KAMEHAMEHA'},
 {name:'VEGETA',id:'vegeta',tag:'THE SAIYAN PRINCE',forms:['BASE','SUPER SAIYAN','SUPER SAIYAN 2'],color:0xb996ff,move:'FINAL FLASH'},
 {name:'SON GOHAN',id:'gohan',tag:'THE HIDDEN POTENTIAL',forms:['BASE','SUPER SAIYAN','SUPER SAIYAN 2'],color:0x86caff,move:'MASENKO'},
 {name:'PICCOLO',id:'piccolo',tag:'THE NAMEKIAN',forms:['WEIGHTED CAPE','UNLEASHED'],color:0x8cef91,move:'SPECIAL BEAM CANNON'},
 {name:'FUTURE TRUNKS',id:'trunks',tag:'THE LAST HOPE',forms:['BASE','SUPER SAIYAN'],color:0x9ebdff,move:'BURNING ATTACK'}
];
const battles=[{id:'vegeta',name:'GOKU / VEGETA',place:'SAIYAN SAGA · EARTH',color:0xa287ff},{id:'frieza',name:'GOKU / FRIEZA',place:'NAMEK · THE FINAL FIVE MINUTES',color:0xffb74b},{id:'cell',name:'GOHAN / CELL',place:'CELL GAMES · EARTH',color:0x76baff},{id:'buu',name:'GOKU / MAJIN BUU',place:'SACRED WORLD · THE FINAL WISH',color:0xff9dbd}];
let selected=0,form=0,time=0,transition=null,attackAt=-100,sequence=false,nextAt=0,summoned=false,summonAt=-100,battleIndex=0,battleAt=0,mode='',stage=null,active=true,dragX=0,dragY=0;
const states=new Map(characters.map(c=>[c.id,0]));
const chapter=document.createElement('section');chapter.id='warriors';chapter.className='art-roster panel dark';chapter.innerHTML=`<p class="art-kicker">04 / THE EARTH ALLIANCE</p><h2>FIVE WARRIORS.<br>ONE EARTH.</h2><div class="art-character-info"><p class="character-tag"></p><h3 class="character-name"></h3><p class="character-form" role="status"></p></div><div class="character-buttons">${characters.map((c,i)=>`<button data-character="${i}" aria-pressed="${i===0}"><small>0${i+1}</small>${c.name}</button>`).join('')}</div><div class="character-actions"><button class="art-button" data-transform>TRANSFORM</button><button class="art-button secondary" data-attack>KAMEHAMEHA</button><button class="art-button secondary" data-character-film>PLAY SEQUENCE</button></div>`;$('.rivals').before(chapter);
$('.site-header nav').innerHTML='<a href="#warriors">WARRIORS</a><a href="#forms">TRANSFORM</a><a href="#dragonballs">SHENRON</a><a href="#battles">BATTLES</a><i></i>';
const heroUI=document.createElement('div');heroUI.className='art-hero-actions';heroUI.innerHTML='<button class="art-button" data-hero-transform>TRANSFORM</button><button class="art-button secondary" data-hero-attack>KAMEHAMEHA</button><button class="art-button secondary" data-watch>PLAY CINEMATIC</button>';$('.hero').append(heroUI);
$('.form-figure').hidden=true;$('.forms').classList.add('art-forms');$('.form-counter').innerHTML='FORM <b>01</b> / 04';$('.form-track').innerHTML=characters[0].forms.map((f,i)=>`<button data-form="${i}" aria-pressed="${i===0}">${f}</button>`).join('');
const formsUI=document.createElement('div');formsUI.className='art-form-controls';formsUI.innerHTML='<button class="art-button" data-form-next>TRANSFORM</button><button class="art-button secondary" data-form-play>PLAY ALL FORMS</button><p class="form-status" role="status"></p>';$('.forms-sticky').append(formsUI);
const theatre=document.createElement('dialog');theatre.className='art-theatre';theatre.setAttribute('aria-label','Artwork cinematic');theatre.innerHTML='<div class="art-theatre-stage"><div class="cinema-matte"></div><p class="art-kicker">Z / STUDIO — ASCENSION</p><h2 class="cinema-type"></h2><p class="cinema-caption" role="status"></p><button class="art-close" aria-label="Close cinematic">CLOSE ×</button><div class="cinema-actions"><button class="art-button" data-cinema-next>TRANSFORM</button><button class="art-button secondary" data-cinema-attack>KAMEHAMEHA</button><button class="art-button secondary" data-replay>PLAY SEQUENCE</button><button class="art-button secondary" data-video hidden>WATCH VIDEO</button></div><video class="art-video" controls playsinline hidden></video></div>';document.body.append(theatre);
const battleDialog=document.createElement('dialog');battleDialog.className='art-theatre battle-theatre';battleDialog.setAttribute('aria-label','Battle cinematic');battleDialog.innerHTML='<div class="art-battle-stage"><div class="cinema-matte"></div><p class="art-kicker battle-location"></p><h2 class="battle-title"></h2><p class="battle-instruction">MOVE TO SHIFT PERSPECTIVE / CLICK CLASH TO REPLAY</p><button class="art-close" aria-label="Close battle">CLOSE ×</button><button class="art-button battle-clash">ENERGY CLASH</button></div>';document.body.append(battleDialog);
$('.shenron').hidden=true;
const summoner=document.createElement('div');summoner.className='art-summoner';summoner.innerHTML='<p class="summon-status" role="status">0 / 7 — COLLECT THE DRAGON BALLS</p><button class="art-button" data-summon>SUMMON SHENRON</button><button class="art-button secondary" data-dismiss hidden>DISMISS SHENRON</button>';$('.dragonballs').append(summoner);$('.dragonballs').classList.add('art-dragon');
const summonTitle=document.createElement('div');summonTitle.className='shenron-title';summonTitle.innerHTML='<small>THE ETERNAL DRAGON</small><strong>SHENRON.</strong>';$('.dragonballs').append(summonTitle);
$$('.orb').forEach((b,i)=>{b.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span>`;b.setAttribute('aria-pressed','false');});
const soundButton=document.createElement('button');soundButton.className='art-sound';soundButton.textContent='SOUND ON';soundButton.setAttribute('aria-pressed','true');soundButton.onclick=()=>{const enabled=sound.toggle();soundButton.textContent=enabled?'SOUND ON':'SOUND OFF';soundButton.setAttribute('aria-pressed',String(enabled));};document.body.append(soundButton);
const stageEl=document.createElement('div');stageEl.className='art-webgl';stageEl.setAttribute('aria-label','Layered artwork with interactive 3D effects');
const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor(0x030405,1);stageEl.append(renderer.domElement);chapter.append(stageEl);
const scene=new T.Scene(),camera=new T.PerspectiveCamera(35,1,.1,90);camera.position.set(0,0,12);
scene.add(new T.HemisphereLight(0xffffff,0x121117,2));const light=new T.PointLight(0x6699ff,20,15);light.position.set(0,2,3);scene.add(light);
const textures=new Map(),loader=new T.TextureLoader();
function load(url){if(textures.has(url))return textures.get(url);const promise=loader.loadAsync(url).then(tx=>{tx.colorSpace=T.SRGBColorSpace;tx.minFilter=T.LinearFilter;tx.magFilter=T.LinearFilter;tx.generateMipmaps=false;return tx;});textures.set(url,promise);return promise;}
const empty=new T.DataTexture(new Uint8Array([0,0,0,255]),1,1);empty.needsUpdate=true;
function artMaterial(){return new T.ShaderMaterial({transparent:true,side:T.DoubleSide,depthWrite:false,uniforms:{map:{value:empty},columns:{value:1},rows:{value:1},frame:{value:0},alpha:{value:1},reveal:{value:1.06},clock:{value:0},bend:{value:0}},vertexShader:`varying vec2 v; uniform float clock;uniform float bend;void main(){v=uv;vec3 p=position;p.z+=sin(uv.y*3.14159)*sin(uv.x*3.14159)*bend;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`varying vec2 v;uniform sampler2D map;uniform float columns;uniform float rows;uniform float frame;uniform float alpha;uniform float reveal;void main(){vec2 uv=vec2((v.x+mod(frame,columns))/columns,(v.y+rows-1.-floor(frame/columns))/rows);vec4 c=texture2D(map,uv);float key=smoothstep(.003,.035,max(c.r,max(c.g,c.b)));float r=1.-smoothstep(reveal-.06,reveal,v.y);gl_FragColor=vec4(c.rgb,c.a*key*alpha*r);
gl_FragColor.a*=smoothstep(.012,.05,v.x)*smoothstep(.012,.05,1.-v.x)*smoothstep(.012,.05,v.y)*smoothstep(.012,.05,1.-v.y);
#include <colorspace_fragment>
}`});}
const art=new T.Mesh(new T.PlaneGeometry(3,6.8,28,40),artMaterial());scene.add(art);
const standingMaterial=art.material,attackMaterial=artMaterial();
attackMaterial.uniforms.nextFrame={value:0};attackMaterial.uniforms.frameMix={value:0};
// Blend inside one surface: two transparent planes darkened each other and ghosted.
attackMaterial.fragmentShader=attackMaterial.fragmentShader.replace('uniform float frame;',
  'uniform float frame;uniform float nextFrame;uniform float frameMix;').replace('vec4 c=texture2D(map,uv);',
  'vec2 nextUV=vec2((v.x+mod(nextFrame,columns))/columns,(v.y+rows-1.-floor(nextFrame/columns))/rows);vec4 c=mix(texture2D(map,uv),texture2D(map,nextUV),frameMix);');
const previous=new T.Mesh(art.geometry,artMaterial());scene.add(previous);previous.visible=false;
const dragonArt=new T.Mesh(new T.PlaneGeometry(6.3,8.7,40,60),artMaterial());dragonArt.position.set(0,.15,-1);scene.add(dragonArt);dragonArt.visible=false;
const backdrop=new T.Mesh(new T.PlaneGeometry(18,10.1,48,32),new T.MeshBasicMaterial({color:0xffffff}));backdrop.position.z=-3;scene.add(backdrop);backdrop.visible=false;
let textureRequest=0;
async function showArt(index,frame){const request=++textureRequest,c=characters[index];try{const texture=await load(`/art/${c.id}-forms.png`);if(request!==textureRequest)return;standingMaterial.uniforms.map.value=texture;standingMaterial.uniforms.columns.value=c.forms.length;standingMaterial.uniforms.rows.value=1;standingMaterial.uniforms.alpha.value=1;standingMaterial.uniforms.frame.value=frame;const aspect=texture.image.width/texture.image.height/c.forms.length;art.scale.set(aspect*6.8/3,1,1);previous.scale.copy(art.scale);}catch{caption('ARTWORK COULD NOT LOAD — RELOAD TO RETRY');}}
load('/art/shenron-art.png').then(tx=>{dragonArt.material.uniforms.map.value=tx;dragonArt.scale.x=(tx.image.width/tx.image.height*8.7)/6.3;});
// Particle and beam geometry moves independently of the illustrated figures.
const n=1200,positions=new Float32Array(n*3),rates=[];for(let i=0;i<n;i++){positions[i*3]=(Math.random()-.5)*17;positions[i*3+1]=(Math.random()-.5)*10;positions[i*3+2]=(Math.random()-.5)*7;rates.push(.2+Math.random());}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));const particleMaterial=new T.PointsMaterial({color:0xd7c694,size:.025,transparent:true,opacity:.6,depthWrite:false,blending:T.AdditiveBlending});const particles=new T.Points(geo,particleMaterial);scene.add(particles);
const glowMaterial=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,blending:T.AdditiveBlending,uniforms:{time:{value:0},strength:{value:0},tint:{value:new T.Color(0xffd347)}},vertexShader:`varying vec2 v;uniform float time;void main(){v=uv;vec3 p=position;p.x+=sin(p.y*8.+time*9.)*.06;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`varying vec2 v;uniform float time;uniform float strength;uniform vec3 tint;void main(){float a=pow(abs(sin(v.x*38.+sin(v.y*19.-time*8.))),13.)*sin(v.y*3.14159);gl_FragColor=vec4(tint,a*.5*strength);}`});const aura=new T.Mesh(new T.SphereGeometry(1,48,32),glowMaterial);aura.scale.set(1.8,3.5,.65);aura.position.z=-.1;scene.add(aura);
const rings=Array.from({length:3},(_,i)=>{const m=new T.Mesh(new T.TorusGeometry(1,.015,6,100),new T.MeshBasicMaterial({color:0xffc65c,transparent:true,opacity:0,blending:T.AdditiveBlending,depthWrite:false}));m.rotation.x=i===2?0:Math.PI/2;m.position.y=-2.5;scene.add(m);return m;});
const core=new T.Mesh(new T.SphereGeometry(.16,32,24),new T.MeshBasicMaterial({color:0xe8ffff}));scene.add(core);const corona=new T.Mesh(new T.SphereGeometry(.29,32,24),new T.MeshBasicMaterial({color:0x46baff,transparent:true,opacity:.45,blending:T.AdditiveBlending,depthWrite:false}));scene.add(corona);
const beam=new T.Group();for(let i=0;i<3;i++){const b=new T.Mesh(new T.CylinderGeometry(.07+i*.095,.09+i*.12,16,24,1,true),new T.MeshBasicMaterial({color:i===0?0xffffff:0x43baff,transparent:true,opacity:i===0?1:.18,depthWrite:false,blending:T.AdditiveBlending}));b.rotation.z=-Math.PI/2;beam.add(b);}scene.add(beam);
const beamTip=new T.Mesh(new T.SphereGeometry(.19,24,16),new T.MeshBasicMaterial({color:0xffffff}));scene.add(beamTip);
const energyFlow=new T.Mesh(new T.PlaneGeometry(1,1),new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,uniforms:{clock:{value:0},tint:{value:new T.Color()},strength:{value:0}},vertexShader:`varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec2 v;uniform float clock;uniform vec3 tint;uniform float strength;void main(){float edge=pow(max(0.,1.-abs(v.y-.5)*2.),2.);float stream=pow(.5+.5*sin(v.x*42.-clock*19.+v.y*9.),5.);float ends=smoothstep(0.,.08,v.x)*(1.-smoothstep(.88,1.,v.x));gl_FragColor=vec4(mix(tint,vec3(1.),stream*.5),edge*ends*(.15+stream*.6)*strength);}`}));energyFlow.visible=false;scene.add(energyFlow);
const haloCanvas=document.createElement('canvas');haloCanvas.width=haloCanvas.height=128;const haloContext=haloCanvas.getContext('2d'),haloGradient=haloContext.createRadialGradient(64,64,0,64,64,64);haloGradient.addColorStop(0,'#fff');haloGradient.addColorStop(.2,'#ffffffcc');haloGradient.addColorStop(1,'#ffffff00');haloContext.fillStyle=haloGradient;haloContext.fillRect(0,0,128,128);const beamHalo=new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(haloCanvas),color:0x43baff,transparent:true,blending:T.AdditiveBlending,depthWrite:false}));scene.add(beamHalo);
const boltArray=new Float32Array(6*20*6),boltGeo=new T.BufferGeometry();boltGeo.setAttribute('position',new T.BufferAttribute(boltArray,3));const bolts=new T.LineSegments(boltGeo,new T.LineBasicMaterial({color:0x94cdff,transparent:true,opacity:0,blending:T.AdditiveBlending}));scene.add(bolts);
const debris=new T.InstancedMesh(new T.IcosahedronGeometry(.1,0),new T.MeshStandardMaterial({color:0x45424a,roughness:1,flatShading:true}),50);scene.add(debris);const dummy=new T.Object3D();
const ballGroup=new T.Group();scene.add(ballGroup);const balls=[],collected=new Set();
function ballMap(count){const c=document.createElement('canvas');c.width=512;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#f3a127';ctx.fillRect(0,0,512,256);ctx.fillStyle='#c3250e';for(let i=0;i<count;i++){const a=i/count*Math.PI*2,r=count===1?0:28,x=256+Math.sin(a)*r,y=128+Math.cos(a)*r;ctx.beginPath();for(let j=0;j<10;j++){const t=j*Math.PI/5-Math.PI/2,rad=j%2?5:12;ctx.lineTo(x+Math.cos(t)*rad,y+Math.sin(t)*rad);}ctx.closePath();ctx.fill();}const tx=new T.CanvasTexture(c);tx.colorSpace=T.SRGBColorSpace;return tx;}
for(let i=0;i<7;i++){const mat=artMaterial();mat.uniforms.columns.value=4;mat.uniforms.rows.value=2;mat.uniforms.frame.value=i;const b=new T.Mesh(new T.PlaneGeometry(1.35,1.35,12,12),mat);ballGroup.add(b);balls.push(b);}load('/art/dragonballs.png').then(tx=>balls.forEach(b=>b.material.uniforms.map.value=tx));

const captionNodes=$$('.cinema-caption,.form-status,.character-form');let lastCaption='';
function caption(text){if(text===lastCaption)return;lastCaption=text;for(const node of captionNodes)node.textContent=text;}
function labels(){const c=characters[selected];$('.character-tag').textContent=c.tag;$('.character-name').textContent=c.name;$('.cinema-type').textContent=c.name;$('.form-name').textContent=c.forms[form]+'.';$('.form-counter b').textContent=String(form+1).padStart(2,'0');$('[data-attack]').textContent=c.move;$('[data-cinema-attack]').textContent=c.move;caption(c.forms[form]);$$('[data-character]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===selected)));$$('[data-form]').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===form)));}
function controlsBusy(value){$$('[data-transform],[data-form-next],[data-cinema-next],[data-cinema-attack],[data-attack],[data-hero-transform],[data-hero-attack],[data-character],[data-form],[data-character-film],[data-replay],[data-form-play]').forEach(b=>b.disabled=value);}
function selectCharacter(index){actionToken++;liveAction=null;filmBusy=false;sound.stopTransform();selected=index;form=states.get(characters[index].id)||0;transition=null;sequence=false;attackAt=-100;controlsBusy(false);showArt(selected,form);labels();warmAction('attack');}
let filmBusy=false,liveAction=null,actionToken=0;
function attackURL(id){return `/art/films/${id}-attack.${id==='goku'?'png':'webp'}`;}
async function runLiveAction(steps,kind){if(filmBusy)return;filmBusy=true;controlsBusy(true);if(kind==='transform')sound.prepare();caption('FOCUS');const token=++actionToken;try{const texture=await load(kind==='attack'?attackURL(characters[selected].id):`/art/${characters[selected].id}-forms.png`);if(token!==actionToken)return;renderer.initTexture(texture);liveAction={steps,texture,kind,index:0,from:form,start:time,duration:reduced?.8:kind==='transform'?2.8:selected===0?4.2:2.8,released:false};kind==='transform'?sound.powerUp(liveAction.duration):sound.tone(0,1.2,70,420,.18,'sine');}catch{filmBusy=false;controlsBusy(false);caption('ARTWORK UNAVAILABLE — RETRY');}}
async function transformTo(next){if(filmBusy)return;next=Math.max(0,Math.min(next,characters[selected].forms.length-1));if(next===form)return;sequence=false;const c=characters[selected],direction=next>form?1:-1,steps=[];for(let current=form;current!==next;current+=direction)steps.push({clip:`${c.id}-transform-${direction>0?current+1:current}`,reverse:direction<0,result:current+direction});return runLiveAction(steps,'transform');}
function nextForm(){return(form+1)%characters[selected].forms.length;}
function beginSequence(){if(filmBusy)return;form=0;states.set(characters[selected].id,0);showArt(selected,0);labels();transformTo(characters[selected].forms.length-1);}
let focusReturn=null;
function openTheatre(kind='sequence'){focusReturn=document.activeElement;theatre.showModal();document.body.style.overflow='hidden';chooseStage();if(kind==='sequence')beginSequence();else if(kind==='attack')attack();else transformTo(nextForm());$('.art-theatre .art-close').focus();}
function closeTheatre(){actionToken++;liveAction=null;filmBusy=false;stopRecording();$('.art-video').pause();$('.art-video').hidden=true;sequence=false;transition=null;attackAt=-100;showArt(selected,form);controlsBusy(false);theatre.close();document.body.style.overflow='';chooseStage();focusReturn?.focus();}
theatre.addEventListener('cancel',e=>{e.preventDefault();closeTheatre();});$('.art-theatre .art-close').onclick=closeTheatre;
theatre.addEventListener('close',()=>sound.stopTransform());
$$('[data-character]').forEach(b=>b.onclick=()=>selectCharacter(+b.dataset.character));
$('[data-transform]').onclick=()=>transformTo(nextForm());$('[data-cinema-next]').onclick=()=>transformTo(nextForm());$('[data-replay]').onclick=beginSequence;
$('[data-watch]').onclick=()=>{selectCharacter(0);openTheatre();};$('[data-character-film]').onclick=()=>openTheatre();
$('[data-hero-transform]').onclick=()=>{selectCharacter(0);openTheatre('transform');};$('[data-hero-attack]').onclick=()=>{selectCharacter(0);openTheatre('attack');};
$('[data-awaken]').onclick=()=>{selectCharacter(0);form=0;states.set('goku',0);showArt(0,0);openTheatre('transform');};
$('[data-form-next]').onclick=()=>transformTo(nextForm());$('[data-form-play]').onclick=beginSequence;
$$('[data-form]').forEach(b=>b.onclick=()=>{sequence=false;transformTo(+b.dataset.form);});
let attackTexture=null,attackPose=0;
async function attack(){if(filmBusy)return;sequence=false;return runLiveAction([{clip:`${characters[selected].id}-attack`}],'attack');}
$('[data-attack]').onclick=attack;$('[data-cinema-attack]').onclick=attack;
// Decode and upload on intent so the first action frame does not stall on a PNG upload.
function warmAction(kind){if(filmBusy)return;const id=characters[selected].id;load(kind==='attack'?attackURL(id):`/art/${id}-forms.png`).then(tx=>renderer.initTexture(tx)).catch(()=>{});}
for(const selector of ['[data-transform]','[data-cinema-next]','[data-form-next]','[data-attack]','[data-cinema-attack]']){const button=$(selector),kind=selector.includes('attack')?'attack':'transform';button.addEventListener('pointerenter',()=>warmAction(kind));button.addEventListener('focus',()=>warmAction(kind));}
for(const selector of ['[data-attack]','[data-transform]'])$(selector).addEventListener('click',()=>chapter.scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'}));
function summon(){if(summoned)return;summoned=true;summonAt=time;sound.summon();for(let i=0;i<7;i++)collected.add(i);updateBalls();$('.dragonballs').classList.add('summoning');$('[data-summon]').hidden=true;$('[data-dismiss]').hidden=false;}
function updateBalls(){$$('.orb').forEach((b,i)=>b.setAttribute('aria-pressed',String(collected.has(i))));$('.summon-status').textContent=summoned?'THE ETERNAL DRAGON — YOUR WISH AWAITS':`${collected.size} / 7 — COLLECT THE DRAGON BALLS`;}
$$('.orb').forEach((b,i)=>b.onclick=()=>{if(summoned)return;collected.has(i)?collected.delete(i):collected.add(i);sound.collect();updateBalls();if(collected.size===7)summon();});$('[data-summon]').onclick=summon;
$('[data-dismiss]').onclick=()=>{summoned=false;collected.clear();updateBalls();$('.dragonballs').classList.remove('summoning');$('[data-summon]').hidden=false;$('[data-dismiss]').hidden=true;};
$$('.battle').forEach((el,i)=>{el.tabIndex=0;el.setAttribute('role','button');el.style.setProperty('--battle-image',`url('/art/battle-${battles[i].id}.png')`);const open=async()=>{battleIndex=i;battleAt=time;$('.battle-title').textContent=battles[i].name;$('.battle-location').textContent=battles[i].place;backdrop.material.map=await load(`/art/battle-${battles[i].id}.png`);backdrop.material.needsUpdate=true;battleDialog.showModal();document.body.style.overflow='hidden';chooseStage();};el.onclick=open;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}};});
function closeBattle(){battleDialog.close();document.body.style.overflow='';chooseStage();}$('.battle-theatre .art-close').onclick=closeBattle;battleDialog.addEventListener('cancel',e=>{e.preventDefault();closeBattle();});$('.battle-clash').onclick=()=>{battleAt=time;sound.attack();};

let recording=null,recordURL=null;
function startRecording(){if(!theatre.open||!window.MediaRecorder)return;stopRecording();$('[data-video]').hidden=true;$('.art-video').hidden=true;try{sound.start();const stream=renderer.domElement.captureStream(30);if(sound.recordBus)for(const track of sound.recordBus.stream.getAudioTracks())stream.addTrack(track.clone());const mime=['video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));const rec=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:4500000}:{}),parts=[];rec.ondataavailable=e=>{if(e.data.size)parts.push(e.data);};rec.onstop=()=>{if(recordURL)URL.revokeObjectURL(recordURL);recordURL=URL.createObjectURL(new Blob(parts,{type:rec.mimeType}));$('.art-video').src=recordURL;$('[data-video]').hidden=false;stream.getTracks().forEach(t=>t.stop());};rec.start(250);recording=rec;}catch{recording=null;}}
function stopRecording(){if(recording?.state==='recording')recording.stop();}
$('[data-video]').onclick=()=>{$('.art-video').hidden=false;$('.art-video').play().catch(()=>{});};
const views=[['roster',chapter],['forms',$('.forms-sticky')],['dragon',$('.dragonballs')]];
function chooseStage(){let name,el;if(theatre.open){name='theatre';el=$('.art-theatre-stage');}else if(battleDialog.open){name='battle';el=$('.art-battle-stage');}else{let max=0;for(const [n,e]of views){const r=e.getBoundingClientRect(),v=Math.max(0,Math.min(innerHeight,r.bottom)-Math.max(0,r.top));if(v>max){max=v;name=n;el=e;}}active=max>0;}if(el&&stage!==el){stage=el;mode=name;el.prepend(stageEl);if(name==='forms'&&selected!==0)selectCharacter(0);resize();}}
function resize(){if(!stage)return;renderer.setSize(stage.clientWidth,stage.clientHeight);camera.aspect=stage.clientWidth/stage.clientHeight;camera.updateProjectionMatrix();}
addEventListener('resize',resize);addEventListener('scroll',chooseStage,{passive:true});stageEl.addEventListener('pointermove',e=>{const r=stageEl.getBoundingClientRect();dragX=(e.clientX-r.left)/r.width-.5;dragY=(e.clientY-r.top)/r.height-.5;});stageEl.addEventListener('pointerleave',()=>{dragX=dragY=0;});
selectCharacter(0);chooseStage();
const raycaster=new T.Raycaster();
stageEl.addEventListener('pointerup',e=>{if(mode!=='dragon'||summoned)return;const r=stageEl.getBoundingClientRect();raycaster.setFromCamera(new T.Vector2((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1),camera);const hit=raycaster.intersectObjects(balls)[0];if(hit)$$('.orb')[balls.indexOf(hit.object)].click();});
const clock=new T.Clock();let boltAt=0;
$('[data-summon]').addEventListener('click',()=>$('.dragonballs').scrollIntoView({behavior:reduced?'instant':'smooth',block:'start'}));
function tick(){requestAnimationFrame(tick);const elapsed=clock.getDelta(),dt=Math.min(elapsed,.05);if(document.hidden)return;time+=elapsed;if(!active&&!theatre.open&&!battleDialog.open)return;const isDragon=mode==='dragon',isBattle=mode==='battle';let charge=0;
  if(sequence&&!transition&&time>nextAt){if(form<characters[selected].forms.length-1){transformTo(form+1);nextAt=time+8.5;}else{sequence=false;caption('ASCENSION COMPLETE / '+characters[selected].forms[form]);stopRecording();}}
  previous.visible=false;
  art.material=standingMaterial;
  energyFlow.visible=false;
  aura.scale.set(1.8,3.5,.65);
  art.material.uniforms.alpha.value=1;
  if(transition){const age=time-transition.start,p=age/7.5;charge=T.MathUtils.smoothstep(age,0,3.8)*(1-T.MathUtils.smoothstep(age,5.5,7.5));caption((age<1.5?'FOCUS':age<3.8?'POWER RISING':age<5.7?'BREAKING THE LIMIT':'STABILIZING')+' / '+characters[selected].forms[transition.to]);if(age>3.8&&!transition.changed){form=transition.to;states.set(characters[selected].id,form);art.material.uniforms.frame.value=form;transition.changed=true;labels();sound.transform();}if(age>3.8&&age<5.7){previous.visible=true;const mix=T.MathUtils.smoothstep(age,3.8,5.7);previous.material.uniforms.alpha.value=1-mix;art.material.uniforms.alpha.value=mix;}if(p>=1){transition=null;controlsBusy(false);labels();}}
  art.visible=!(isDragon||isBattle);art.position.set(mode==='roster'?1.7:0,.2,0);previous.position.copy(art.position);art.rotation.y=dragX*.08;previous.rotation.copy(art.rotation);art.material.uniforms.bend.value=.11;art.material.uniforms.clock.value=time;
  if(!reduced){art.position.y+=Math.sin(time*1.2)*.022;art.position.x+=Math.sin(time*43)*charge*.013;}
  const age=time-attackAt;let attacking=age>=0&&age<8&&!isDragon&&!isBattle;
  if(attacking){charge=Math.max(charge,T.MathUtils.smoothstep(age,0,3.8)*(1-T.MathUtils.smoothstep(age,6.3,8)));if(attackPose===0){art.material.uniforms.map.value=attackTexture;art.material.uniforms.columns.value=2;art.material.uniforms.frame.value=0;art.scale.x=attackTexture.image.width/attackTexture.image.height/2*6.8/3;attackPose=1;}if(age<1.1){previous.visible=true;previous.material.uniforms.alpha.value=1-T.MathUtils.smoothstep(age,0,1.1);art.material.uniforms.alpha.value=T.MathUtils.smoothstep(age,0,1.1);}if(age>=4&&attackPose===1){previous.material.uniforms.map.value=attackTexture;previous.material.uniforms.columns.value=2;previous.material.uniforms.frame.value=0;previous.scale.copy(art.scale);art.material.uniforms.frame.value=1;attackPose=2;sound.attack();}if(age>=4&&age<4.35){previous.visible=true;const mix=T.MathUtils.smoothstep(age,4,4.35);previous.material.uniforms.alpha.value=1-mix;art.material.uniforms.alpha.value=mix;}caption(characters[selected].move+' / '+(age<1.2?'FOCUS':age<4?'CHARGING':age<6.5?'RELEASE':'RECOVERY'));art.position.x-=T.MathUtils.smoothstep(age,4,4.3)*.2*(1-T.MathUtils.smoothstep(age,6,8));if(age>7&&attackPose===2){previous.material.uniforms.map.value=attackTexture;previous.material.uniforms.frame.value=1;showArt(selected,form);attackPose=3;}if(age>7){previous.visible=true;previous.material.uniforms.alpha.value=1-T.MathUtils.smoothstep(age,7,8);art.material.uniforms.alpha.value=T.MathUtils.smoothstep(age,7,8);}if(age>7.95){attackAt=-100;controlsBusy(false);labels();stopRecording();}}
  const firing=attacking&&age>=4&&age<7,fade=1-T.MathUtils.smoothstep(age,6,7);
  core.visible=corona.visible=attacking&&age>1&&age<7;beam.visible=firing;
  const colors=[0x43baff,0xffd34c,0xffd75e,0xffd65e,0xffba53],tint=colors[selected];corona.material.color.set(tint);beam.children.forEach((b,i)=>b.material.color.set(i?tint:0xffffff));
  const origins=age<4?[[-1.68,-.05],[1.7,1.1],[0,2.7],[-.43,2.34],[0,1.35]]:[[.98,.48],[1.45,1.21],[1.31,.94],[1.78,1.61],[1.38,1.34]];
  const px=art.position.x+origins[selected][0],py=art.position.y+origins[selected][1];core.position.set(px,py,.4);corona.position.copy(core.position);const size=(age<4?T.MathUtils.smoothstep(age,1,4)*1.2:1.2)*fade*(selected===3?.4:1);core.scale.setScalar(size);corona.scale.setScalar(size);const length=T.MathUtils.smoothstep(age,4,4.7);beam.position.set(px+2*length,py,.4);beam.scale.set(.25*length,(selected===3?.3:1)*fade*(1+Math.sin(time*48)*.04),1);
  beamTip.visible=beamHalo.visible=firing;beamTip.position.set(px+4*length,py,.4);beamTip.scale.set(1.6*fade,fade,fade);beamHalo.position.copy(beamTip.position);beamHalo.material.color.set(tint);beamHalo.scale.setScalar(1.25*fade);
  previous.position.copy(art.position);previous.visible=previous.visible&&!isDragon&&!isBattle;
  const energy=form>0?.65:0;aura.visible=!isDragon&&!isBattle&&(energy+charge>0);aura.position.x=art.position.x;aura.material.uniforms.time.value=time;aura.material.uniforms.strength.value=energy+charge;aura.material.uniforms.tint.value.set(characters[selected].color);
  backdrop.visible=isBattle;dragonArt.visible=isDragon&&summoned;ballGroup.visible=isDragon;
  const sAge=time-summonAt;if(dragonArt.visible){dragonArt.material.uniforms.reveal.value=T.MathUtils.clamp(sAge/3.8,0,1)+.06;dragonArt.position.y=.2-(1-T.MathUtils.smoothstep(sAge,0,5))*1.8;dragonArt.rotation.y=dragX*.09;dragonArt.material.uniforms.bend.value=.28;dragonArt.material.uniforms.clock.value=time;$('.dragonballs').classList.toggle('summoned',sAge>3);}
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2+(summoned?time*.12:0);balls[i].position.set(Math.sin(a)*(summoned?2:2.65),summoned?-2.9:.1+Math.cos(a)*1.8,Math.cos(a)*.4+1);balls[i].scale.setScalar(summoned?.6:collected.has(i)?1.12:1);balls[i].material.uniforms.bend.value=.16;balls[i].rotation.z=reduced?0:Math.sin(time*.25+i)*.06;balls[i].position.y+=reduced?0:Math.sin(time+i)*.06;}
  const battleAge=time-battleAt;backdrop.rotation.y=dragX*.035;backdrop.rotation.x=-dragY*.025;backdrop.scale.setScalar(Math.min(.93,camera.aspect*9.5/18)*(1+Math.sin(time*.3)*.008));light.color.set(isDragon?0x39bc76:isBattle?battles[battleIndex].color:0x6699ff);
  if(isBattle){core.visible=corona.visible=battleAge>1.5&&battleAge<3.3;core.position.set(0,.15,2);corona.position.copy(core.position);core.scale.setScalar(5*Math.max(.1,Math.sin((battleAge-1.5)/1.8*Math.PI)));corona.scale.copy(core.scale);}
  rings.forEach((r,i)=>{const burst=isDragon?sAge-1.8:isBattle?battleAge-1.5:transition?time-transition.start-1.4:99;const p=burst-i*.18;r.visible=p>0&&p<2;r.material.opacity=Math.max(0,.8-p*.4);r.scale.setScalar(1+p*3);r.position.x=isBattle||isDragon?0:art.position.x;r.position.y=isBattle?.15:-2.65;});
  particleMaterial.color.set(isDragon?0xf9da76:isBattle?battles[battleIndex].color:characters[selected].color);for(let i=0;i<n;i++){positions[i*3+1]+=dt*rates[i]*(1+charge*4);if(positions[i*3+1]>5)positions[i*3+1]=-5;}geo.attributes.position.needsUpdate=true;
  debris.visible=isBattle||charge>.3;if(debris.visible){for(let i=0;i<50;i++){const a=i*2.399+time*.06,r=2+(i%7)*.3;dummy.position.set(Math.cos(a)*r,((time*.7+i*.4)%7)-3.5,Math.sin(a)*2+1);dummy.rotation.set(time*.2,a,time*.3);dummy.scale.setScalar(.5+i%4*.4);dummy.updateMatrix();debris.setMatrixAt(i,dummy.matrix);}debris.instanceMatrix.needsUpdate=true;}
  bolts.material.opacity=((isDragon&&summoned&&sAge<5)||charge>.65||(!isDragon&&!isBattle&&form>=2))?.7:0;
  if(time-boltAt>.1&&bolts.material.opacity){boltAt=time;let k=0;for(let b=0;b<6;b++)for(let j=0;j<20;j++)for(let e=0;e<2;e++){const a=b/6*Math.PI*2,h=(j+e)/20*7-3.5;boltArray[k++]=(isDragon?0:art.position.x)+Math.cos(a)*(isDragon?3.3:1.4)+(Math.random()-.5)*.3;boltArray[k++]=h;boltArray[k++]=Math.sin(a)*.5+1;}boltGeo.attributes.position.needsUpdate=true;}
  const narrow=camera.aspect<.85,dist=isDragon?(narrow?17:15):isBattle?(narrow?20:12.4):(narrow?14.6:12.6);
  // Fit the entire pose plus the beam inside the cinematic safe area, not just the torso.
  const attackDistance=Math.max(16.4,10.6/(2*Math.tan(35*Math.PI/360)*camera.aspect));
  const targetX=attacking?1.25:mode==='roster'?(narrow?.6:.2):0;
  const targetZ=attacking?attackDistance:dist-(reduced?0:charge*.25);
  if(!liveAction){camera.position.lerp(new T.Vector3(targetX+dragX*.1,dragY*-.08,targetZ),1-Math.exp(-dt*(attacking?6.3:2.1)));camera.lookAt(targetX,0,0);}if(firing&&!reduced)camera.position.x+=Math.sin(time*35)*.008;
  if(liveAction&&!isDragon&&!isBattle){
    if(liveAction.kind==='attack'){
      const a=liveAction,p=Math.min(1,(time-a.start)/a.duration),timeline=p*5;
      const frame=Math.min(5,Math.floor(timeline)),mix=T.MathUtils.smoothstep(timeline-frame,selected===0?.84:.7,1);
      art.material=attackMaterial;
      for(const mesh of [art]){
        const u=mesh.material.uniforms;u.map.value=a.texture;u.columns.value=3;u.rows.value=2;u.reveal.value=1.06;u.bend.value=reduced?0:.04;
        mesh.scale.set(a.texture.image.width/a.texture.image.height/3*2*6.8/3,1,1);
      }
      art.material.uniforms.frame.value=frame;art.material.uniforms.alpha.value=1;
      art.material.uniforms.nextFrame.value=Math.min(5,frame+1);art.material.uniforms.frameMix.value=mix;previous.visible=false;
      art.position.set(mode==='roster'?1.1:0,.15,0);art.rotation.y=0;
      previous.position.copy(art.position);previous.rotation.copy(art.rotation);
      // The illustrated hands, charge and beam stay together; no floating procedural orb.
      aura.visible=core.visible=corona.visible=beam.visible=beamTip.visible=beamHalo.visible=energyFlow.visible=debris.visible=false;
      bolts.material.opacity=0;rings.forEach(r=>r.visible=false);
      caption(characters[selected].move+' / '+(p<.2?'FOCUS':p<.52?'CHARGING':p<.84?'RELEASE':'RECOVERY'));
      const fit=Math.max(15.8,8.2/(2*Math.tan(35*Math.PI/360)*camera.aspect));
      camera.position.lerp(new T.Vector3(art.position.x,0,fit),1-Math.exp(-dt*7));camera.lookAt(art.position.x,0,0);
      if(p>.52&&!a.released){a.released=true;sound.noise(0,1.25,1900,.55);sound.tone(0,.6,160,35,.3,'sine');}
      if(p>=1){liveAction=null;filmBusy=false;controlsBusy(false);previous.visible=false;art.material=standingMaterial;showArt(selected,form);labels();}
      renderer.render(scene,camera);return;
    }
    const a=liveAction,p=Math.min(1,(time-a.start)/a.duration),step=a.steps[a.index],c=characters[selected],isAttack=a.kind==='attack';
    const smooth=T.MathUtils.smoothstep,envelope=smooth(p,0,.3)*(1-smooth(p,.72,1)),reveal=smooth(p,.43,.64);
    for(const mesh of [art,previous]){const u=mesh.material.uniforms;u.map.value=a.texture;u.columns.value=c.forms.length;u.rows.value=1;u.reveal.value=1.06;u.bend.value=reduced?0:.06;mesh.scale.set(a.texture.image.width/a.texture.image.height/c.forms.length*6.8/3,1,1);}
    art.material.uniforms.frame.value=isAttack?a.from:step.result;art.material.uniforms.alpha.value=isAttack?1:reveal;
    previous.material.uniforms.frame.value=a.from;previous.material.uniforms.alpha.value=1-reveal;previous.visible=!isAttack&&reveal<1;
    const originX=mode==='roster'?1.4:0;
    art.position.set(originX,.2+(reduced?0:Math.sin(p*Math.PI)*.09),0);art.rotation.y=reduced?0:dragX*.05;previous.position.copy(art.position);previous.rotation.copy(art.rotation);
    const energyTint=isAttack?tint:c.color;
    aura.visible=!reduced;aura.position.set(originX,.2,-.1);aura.scale.set(1.6+envelope*.4,3.5+envelope*.4,.65);aura.material.uniforms.strength.value=envelope*(isAttack?.65:2);aura.material.uniforms.tint.value.set(energyTint);
    debris.visible=false;bolts.material.opacity=0;
    rings.forEach((r,i)=>{const burst=(p-.43)*4-i*.13;r.visible=!reduced&&burst>0&&burst<1.4;r.rotation.x=i===2?0:Math.PI/2;r.position.set(originX,i===2?.2:-2.7,.1);r.scale.setScalar(1+burst*2.4);r.material.color.set(energyTint);r.material.opacity=Math.max(0,1-burst/1.4)*.55;});
    const release=smooth(p,.34,.49),tail=1-smooth(p,.72,.95),power=envelope*(reduced?.4:1);
    const sourceX=originX+.75,sourceY=.4,reach=3.8*release;
    core.visible=corona.visible=isAttack&&power>.001;core.position.set(sourceX,sourceY,.7);corona.position.copy(core.position);core.scale.setScalar(power*(.8+release*.4));corona.scale.setScalar(power*(1.4+release*.5));corona.material.color.set(energyTint);
    beam.visible=isAttack&&p>.34&&p<.95;beam.position.set(sourceX+reach/2,sourceY,.7);beam.scale.set(reach/16,(selected===3?.25:1)*tail,1);
    beam.children.forEach((b,i)=>{b.material.color.set(i?energyTint:0xffffff);b.material.opacity=(i===0?.95:.16)*tail;b.scale.x=1+(reduced?0:Math.sin(time*12+i*2)*.08);});
    beamTip.visible=beamHalo.visible=beam.visible;beamTip.position.set(sourceX+reach,sourceY,.7);beamTip.scale.set(1.5*tail,tail,tail);beamHalo.position.copy(beamTip.position);beamHalo.scale.setScalar(1.5*tail);beamHalo.material.color.set(energyTint);
    // Traveling pulses provide continuous motion rather than swapping illustration frames.
    energyFlow.visible=beam.visible&&!reduced;energyFlow.material.uniforms.clock.value=time;energyFlow.material.uniforms.tint.value.set(energyTint);energyFlow.material.uniforms.strength.value=tail;energyFlow.position.set(sourceX+reach/2,sourceY,.75);energyFlow.scale.set(reach,selected===3?.28:.85,1);
    caption((isAttack?c.move:c.forms[step.result])+' / '+(p<.34?'CHARGING':p<.72?(isAttack?'RELEASE':'AWAKENING'):'STABILIZING'));
    const center=originX+(isAttack?1.35:0),fit=Math.max(isAttack?16:12.6,(isAttack?10:6.5)/(2*Math.tan(35*Math.PI/360)*camera.aspect));
    camera.position.lerp(new T.Vector3(center,0,fit-(reduced?0:envelope*.2)),1-Math.exp(-dt*7));camera.lookAt(center,0,0);
    if(p>.34&&!a.released){a.released=true;if(isAttack){sound.noise(0,1.25,1900,.55);sound.tone(0,.6,160,35,.3,'sine');}}
    if(p>=1){if(step.result!==undefined){form=step.result;states.set(c.id,form);}if(a.index<a.steps.length-1){a.index++;a.from=form;a.start=time;a.released=false;sound.powerUp(a.duration);}else{sound.stopTransform();liveAction=null;filmBusy=false;controlsBusy(false);previous.visible=false;energyFlow.visible=false;showArt(selected,form);labels();}}
  }
  renderer.render(scene,camera);
}
tick();
