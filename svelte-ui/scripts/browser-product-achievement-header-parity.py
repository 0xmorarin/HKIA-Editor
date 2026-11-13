"""Actual fixed V33 header parity; public synthetic Account only, no Apply/export."""
import argparse,json,threading,hashlib
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright,expect
p=argparse.ArgumentParser();p.add_argument('base');p.add_argument('candidate');p.add_argument('--chrome');a=p.parse_args()
base,candidate=map(lambda x:Path(x).resolve(strict=True),(a.base,a.candidate));servers=[]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def end_headers(self):self.send_header('Cache-Control','no-store');super().end_headers()
def serve(root):
 s=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)));t=threading.Thread(target=s.serve_forever,daemon=True);t.start();servers.append((s,t));return f'http://127.0.0.1:{s.server_port}/'
roots=[serve(base),serve(candidate)]
images=json.loads((base/'media/image-map.json').read_text())['accountAchievements'];known=[x['guid'] for x in images if x['icon']['status']=='EXACT'][:2];assert len(known)==2
unknown='0000000000000000000000000000ffff';assert unknown not in {r['guid'] for r in json.loads((base/'data/achievement-definitions.json').read_text())}
fixture={'Achievements':{g:{'IsComplete':i==0,'CurrentValue':i,'CompletedTime':'2026-01-01T00:00:00.1234567Z' if i==0 else None} for i,g in enumerate(known+[unknown])},'Counters':{}}
mark='[data-hkia-svelte-achievement-header="1"]'
def probe(browser,url,width,mounted,abort=False):
 page=browser.new_page(viewport={'width':width,'height':900});errors=[];external=[];bad=[];downloads=[]
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:external.append(r.url) if not r.url.startswith(url) else None);page.on('response',lambda r:bad.append(r.status) if r.status>=400 and not r.url.endswith('/favicon.ico') else None);page.on('download',lambda d:downloads.append(d.suggested_filename))
 if abort:page.route('**/src/product-achievement-header.mjs',lambda r:r.abort())
 try:
  assert page.goto(url,wait_until='domcontentloaded',timeout=30000).ok;expect(page.locator('#collectionGrid .collection-card')).to_have_count(25,timeout=30000)
  panel=page.locator('#editorPanel');ref=panel.element_handle();expect(page.locator(mark)).to_have_count(1 if mounted else 0)
  def projection():
   return panel.evaluate("""e=>Array.from(e.children).map(n=>[n.tagName,n.className,n.innerText,Array.from(n.querySelectorAll('input')).map(i=>[i.type,i.value,i.checked])])""")
  out=[projection()]
  page.locator('#saveInput').set_input_files({'name':'synthetic-settings.json','mimeType':'application/json','buffer':json.dumps(fixture).encode()});expect(page.locator('#fileStatus')).to_have_text('Account JSON',timeout=30000)
  rows=page.locator('#achievementsList .achievement-row');expect(rows).to_have_count(3)
  for g in known+[unknown]:
   page.locator('#achievementSearch').fill(g);expect(rows).to_have_count(1);rows.first.click();expect(panel).to_contain_text(g);expect(page.locator(mark)).to_have_count(1 if mounted else 0)
   assert ref.evaluate("(e)=>e===document.getElementById('editorPanel')")
   if g in known:
    image=panel.locator('.media-detail-strip img').first;image.scroll_into_view_if_needed();page.wait_for_function('(e)=>e.complete&&e.naturalWidth>0',arg=image.element_handle(),timeout=12000)
   out.append(projection())
   number=panel.locator('form input[type=number]');expect(number).to_have_count(1);number.fill('5');panel.locator('form button[type=submit]').click();expect(panel.locator('.review-panel')).to_contain_text('適用前の差分：1件');expect(panel.locator('.review-list')).to_contain_text('→ 5');out.append(projection());panel.get_by_role('button',name='入力を取り消す').click();expect(panel).to_contain_text(g);expect(page.locator(mark)).to_have_count(1 if mounted else 0);expect(panel.locator('.review-panel')).to_have_count(0);out.append(projection())
   page.locator('#achievementSearch').fill('no-such-record');expect(rows).to_have_count(0);expect(panel).to_contain_text(g);out.append(projection())
  assert page.locator('#downloadEdited').is_disabled() and page.locator('#nativeDownload').is_disabled();assert page.evaluate("document.documentElement.dataset.nativePreview==='off'&&document.documentElement.scrollWidth<=innerWidth");assert not errors and not external and not bad and not downloads,(errors,external,bad,downloads)
  return out
 finally:page.close()
try:
 with sync_playwright() as p:
  opts={'headless':True}
  if a.chrome:opts['executable_path']=a.chrome
  b=p.chromium.launch(**opts);reports=[]
  for w in (320,375,1280):
   x=probe(b,roots[0],w,False);y=probe(b,roots[1],w,True);assert x==y,'header and legacy form parity';reports.append({'width':w,'sha256':hashlib.sha256(json.dumps(x,ensure_ascii=False).encode()).hexdigest(),'samePanelAndProjection':True})
  assert probe(b,roots[1],375,False,True)==probe(b,roots[0],375,False);b.close();print(json.dumps({'reports':reports,'moduleAbortFallback':True,'writerOff':True,'noApplyOrDownload':True}))
finally:
 for s,t in servers:s.shutdown();s.server_close();t.join()
