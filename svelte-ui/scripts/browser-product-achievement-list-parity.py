"""Fixed V33 and compiled candidate, actual Chromium; synthetic Account only, no save export."""
import argparse,hashlib,json,threading
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from playwright.sync_api import sync_playwright,expect
p=argparse.ArgumentParser();p.add_argument('base');p.add_argument('candidate');p.add_argument('--chrome');a=p.parse_args();base,candidate=map(lambda x:Path(x).resolve(strict=True),(a.base,a.candidate));servers=[]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def end_headers(self):self.send_header('Cache-Control','no-store');super().end_headers()
def serve(root):
 s=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)));t=threading.Thread(target=s.serve_forever,daemon=True);t.start();servers.append((s,t));return f'http://127.0.0.1:{s.server_port}/'
roots=[serve(base),serve(candidate)];catalog=json.loads((base/'data/achievement-definitions.json').read_text());images=json.loads((base/'media/image-map.json').read_text())['accountAchievements'];assert len(catalog)==31
known=[r['guid'] for r in catalog];exact=[r for r in images if r['icon']['status']=='EXACT'];assert len(exact)==13;guid=exact[0]['guid'];unknown=[format(i+10000,'032x') for i in range(130)];assert not set(known)&set(unknown)
# Only public catalog identity and fabricated states; no actual user data.
fixture={'Achievements':{g:{'IsComplete':i%3==0,'CurrentValue':i%7,'CompletedTime':'2026-01-01T00:00:00Z' if i%3==0 else None} for i,g in enumerate(known+unknown)},'Counters':{}}
mark='[data-hkia-svelte-achievements="1"]'
def probe(browser,url,width,mounted,abort=False):
 page=browser.new_page(viewport={'width':width,'height':900});errors=[];external=[];bad=[];downloads=[]
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:external.append(r.url) if not r.url.startswith(url) else None);page.on('response',lambda r:bad.append(r.status) if r.status>=400 and not r.url.endswith('/favicon.ico') else None);page.on('download',lambda d:downloads.append(d.suggested_filename))
 page.add_init_script("""const capture=()=>{const p=document.getElementById('achPanel'),e=document.getElementById('editorPanel'),c=document.getElementById('colPanel');if(p&&e&&c&&!window.__refs)window.__refs=[p,e,c];};new MutationObserver(capture).observe(document,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',capture);""")
 if abort:page.route('**/src/product-achievement-list.mjs',lambda r:r.abort())
 try:
  assert page.goto(url,wait_until='domcontentloaded',timeout=30000).ok;expect(page.locator('#collectionGrid .collection-card')).to_have_count(25,timeout=30000);expect(page.locator(mark)).to_have_count(1 if mounted else 0,timeout=20000)
  rows=page.locator('#achievementsList .achievement-row');ctrl=lambda id:page.locator('#'+id)
  assert page.evaluate("window.__refs?.every((e,i)=>e===document.getElementById(['achPanel','editorPanel','colPanel'][i]))")
  def projection():return rows.evaluate_all("rs=>rs.map(r=>[r.className,r.getAttribute('aria-label'),r.querySelector('.ach-text').textContent.trim().replace(/\\s+/g,' '),r.querySelector('.status-dot').textContent,r.querySelector('[data-image-status]')?.dataset.imageStatus??null,r.querySelector('img')?.getAttribute('src')??null,r.querySelector('img')?.dataset.spritePathId??null])")
  ctrl('saveInput').set_input_files({'name':'synthetic-settings.json','mimeType':'application/json','buffer':json.dumps(fixture).encode()});expect(ctrl('fileStatus')).to_have_text('Account JSON',timeout=30000);expect(rows).to_have_count(120);expect(page.locator(mark)).to_have_count(1 if mounted else 0)
  initial=projection();assert len(initial)==120
  ctrl('achievementImageFilter').select_option('exact');expect(rows).to_have_count(13);art=[]
  for r in rows.all():
   r.scroll_into_view_if_needed();img=r.locator('img');expect(img).to_have_count(1);page.wait_for_function('(e)=>e.complete&&e.naturalWidth>0&&e.naturalHeight>0',arg=img.element_handle(),timeout=12000);art.append(img.get_attribute('src'))
  assert set(art)=={'./'+x['icon']['image'] for x in exact};ctrl('achievementImageFilter').select_option('all');expect(rows).to_have_count(120)
  ctrl('achievementSearch').fill(guid);expect(rows).to_have_count(1);rows.first.click();expect(rows.first).to_be_focused();expect(ctrl('editorPanel')).to_contain_text(guid);detail=ctrl('editorPanel').inner_text();ctrl('achievementSearch').fill('no-such-record');expect(rows).to_have_count(0);assert ctrl('editorPanel').inner_text()==detail;ctrl('achievementSearch').fill('');expect(rows).to_have_count(120);assert ctrl('editorPanel').inner_text()==detail
  old=ctrl('achievementsList').element_handle();page.locator('#achievementsList .show-more').click();expect(rows).to_have_count(161);assert ctrl('editorPanel').inner_text()==detail;assert ctrl('achievementsList').count()==1
  if mounted:assert not old.evaluate('(e)=>e.isConnected');expect(page.locator(mark)).to_have_count(1);assert len(set(rows.evaluate_all('xs=>xs.map(x=>x.dataset.achievementGuid)')))==161
  else:assert old.evaluate('(e)=>e.isConnected')
  expanded=projection();assert expanded[:120]==initial[:120] or [x[1:] for x in expanded[:120]]==[x[1:] for x in initial[:120]]
  ctrl('achievementFilter').select_option('complete');expect(rows).to_have_count(54);complete=projection();ctrl('achievementFilter').select_option('unknown-source');expect(rows).to_have_count(120);page.locator('#achievementsList .show-more').click();expect(rows).to_have_count(130);unknownrows=projection();assert all('unknown-identity' in r[0] for r in unknownrows)
  ctrl('achievementFilter').select_option('all');ctrl('achievementSort').select_option('progress-desc');expect(rows).to_have_count(120);sortedrows=projection();ctrl('achievementSort').select_option('source');ctrl('colTab').click();expect(page.locator('#collectionGrid .collection-card')).to_have_count(25);ctrl('achTab').click();assert ctrl('editorPanel').inner_text()==detail
  assert ctrl('downloadEdited').is_disabled() and ctrl('nativeDownload').is_disabled() and ctrl('nativeDiscard').is_disabled();assert page.evaluate("document.documentElement.dataset.nativePreview==='off'&&document.documentElement.scrollWidth<=innerWidth");assert not errors and not external and not bad and not downloads,(errors,external,bad,downloads)
  return {'width':width,'initial':initial,'expanded':expanded,'complete':complete,'unknown':unknownrows,'sorted':sortedrows,'art':art,'detail':detail}
 finally:page.close()
try:
 with sync_playwright() as p:
  opts={'headless':True};
  if a.chrome:opts['executable_path']=a.chrome
  browser=p.chromium.launch(**opts);reports=[]
  for w in (320,375,1280):
   x=probe(browser,roots[0],w,False);y=probe(browser,roots[1],w,True);assert x==y,'actual achievement list parity mismatch';reports.append({'width':w,'syntheticAccountRows':161,'actualImages':13,'pagination':True,'hiddenSelection':True,'sameProjection':True,'sha256':hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True).encode()).hexdigest()})
  assert probe(browser,roots[1],375,False,True)==probe(browser,roots[0],375,False),'fallback mismatch';browser.close();print(json.dumps({'reports':reports,'moduleAbortFallback':True,'writerOff':True,'noExternalOrDownload':True}))
finally:
 for s,t in servers:s.shutdown();s.server_close();t.join()
