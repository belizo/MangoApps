// Headless smoke test. Run: npm i jsdom && node tests/smoke.js
const {JSDOM}=require("jsdom"),fs=require("fs"),path=require("path");
const html=fs.readFileSync(path.join(__dirname,"../index.html"),"utf8");
let pass=0,fail=0;const ok=(c,m)=>{c?pass++:fail++;console.log((c?"PASS ":"FAIL ")+m)};
function boot(){const d=new JSDOM(html,{runScripts:"dangerously",url:"http://localhost/",pretendToBeVisual:true});return d.window}
const $=(w,s)=>w.document.querySelector(s),$$=(w,s)=>[...w.document.querySelectorAll(s)];
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const type=(w,el,v)=>{el.value=v;el.dispatchEvent(new w.Event("input",{bubbles:true}))};
const txt=(w,s)=>($(w,s)||{}).textContent||"";
const role=(w,r)=>click(w,$(w,`[data-role=${r}]`));

// 1 employee starts with a pending confirmation
let w=boot();
ok(/1 update needs a quick confirmation/.test(txt(w,"#app")),"Alex sees 1 pending confirmation");
ok($(w,".badge")&&$(w,".badge").textContent=="1","To do badge shows 1");

// 2 Read more on FYI must NOT make it vanish
const before=$$(w,"#app article").length;
const ro=$$(w,"[data-open]")[0];
if(ro){click(w,ro)}
ok($$(w,"#app article").length==before,"Opening an FYI keeps it in the list");

// 3 confirm: button changes, badge clears, undo works
click(w,$(w,"[data-ack]"));
ok(!!$(w,".btn.done")&&/Confirmed/.test(txt(w,".btn.done")),"Confirm button turns into Confirmed state");
ok(/All confirmed/.test(txt(w,"#app")),"Headline updates after confirming");
ok(!$(w,".badge"),"Badge clears after confirming");
click(w,$(w,"[data-undo]"));
ok(!!$(w,"[data-ack]"),"Undo restores the confirm button");
click(w,$(w,"[data-ack]"));

// 4 manager sees Alex confirmed
role(w,"store");
click(w,$(w,"[data-mf=all]"));
const card=$$(w,"#app article").find(a=>/ladder and forklift/.test(a.textContent));
click(w,card.querySelector("[data-toggle]"));
click(w,$$(w,"[data-wt]").find(b=>/:done/.test(b.dataset.wt)));
ok(/Alex Chen/.test(txt(w,"#app")),"Rachel sees Alex under Confirmed");

// 5 store manager is scoped to Downtown
click(w,$(w,"[data-mf=all]"));
const people=$$(w,".person .m").map(e=>e.textContent);
ok(people.every(p=>/^Downtown/.test(p)),"Store manager only sees Downtown people");

// 6 compose validation
click(w,$(w,"[data-post]"));
click(w,$(w,"[data-submit]"));
ok(/Add a title/.test(txt(w,"#err")),"Blank title is rejected");
type(w,$(w,"#ct"),"<b>Test</b>");click(w,$(w,"[data-submit]"));
ok(/Add a message/.test(txt(w,"#err")),"Blank message is rejected");
type(w,$(w,"#cb"),"Body <img src=x onerror=alert(1)>");
ok(!$(w,"#pv img")&&/Body/.test(txt(w,"#pv")),"HTML is escaped in the live preview");
// 7 ops: no store -> error; Harbor + important -> posts
role(w,"ops");click(w,$(w,"[data-post]"));
type(w,$(w,"#ct"),"Harbor dock closed");type(w,$(w,"#cb"),"Dock B closed Tuesday.");
click(w,$(w,"[data-submit]"));
ok(/at least one store/.test(txt(w,"#err")),"No store selected is rejected");
click(w,$(w,"[data-st=Harbor]"));
const ci=$(w,"#ci");ci.checked=true;ci.dispatchEvent(new w.Event("input",{bubbles:true}));
ok(/Post to 8 employees/.test(txt(w,"[data-submit]")),"Post button shows audience size (8)");
click(w,$(w,"[data-days='1']"));click(w,$(w,"[data-submit]"));
ok(/Harbor dock closed/.test(txt(w,"#app"))&&$(w,"#modal").hidden,"Update posted and sheet closes");
// 8 Harbor employee sees it, Downtown employee doesn't
role(w,"employee");
const sel=$(w,"#who");sel.value="e4";sel.dispatchEvent(new w.Event("change"));
ok(/Harbor dock closed/.test(txt(w,"#app")),"Harbor employee sees the new update");
sel.value="e0";sel.dispatchEvent(new w.Event("change"));
ok(!/Harbor dock closed/.test(txt(w,"#app")),"Downtown employee does not see it");
// 9 remind all
role(w,"ops");click(w,$(w,"[data-mf=all]"));
const c2=$$(w,"#app article").find(a=>/ladder and forklift/.test(a.textContent));
click(w,c2.querySelector("[data-toggle]"));
click(w,$$(w,"[data-wt]").find(b=>/:not/.test(b.dataset.wt)));
const ra=$(w,"[data-rall]");ok(!!ra,"Remind-all button available");
click(w,ra);
sel.value="e0";role(w,"employee");
// e0 already confirmed -> pick unconfirmed employee e3 (i%3==0)
sel.value="e3";sel.dispatchEvent(new w.Event("change"));
ok(/Reminder from your manager/.test(txt(w,"#app")),"Reminded employee sees banner on card");
// 10 empty state: confirm everything for e3
$$(w,"[data-ack]").forEach(b=>click(w,b));
ok(/caught up|All confirmed/.test(txt(w,"#app")),"All-caught-up state after confirming everything");
// 11 reset
click(w,$(w,"#reset"));
ok(/Alex|Good/.test(txt(w,"#app")),"Reset re-renders without error");
// 12 persistence
const w2=boot();ok(!!$(w2,".phone"),"Fresh boot renders the employee app");
console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0);
