"""Actual V30/V33 baseline vs fixed compiled Svelte filter module. Synthetic Account only."""
import argparse,hashlib,json,threading
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from playwright.sync_api import sync_playwright,expect
p=argparse.ArgumentParser();p.add_argument('base');p.add_argument('candidate');p.add_argument('--chrome');args=p.parse_args()
base,candidate=map(lambda x:Path(x).resolve(strict=True),(args.base,args.candidate));servers=[]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
 def end_headers(self):self.send_header('Cache-Control','no-store');super().end_headers()
def serve(root):
 s=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)));t=threading.Thread(target=s.serve_forever,daemon=True);t.start();servers.append((s,t));return f'http://127.0.0.1:{s.server_port}/'
roots=[serve(base),serve(candidate)];catalog=json.loads((base/'data/collections.json').read_text());assert len(catalog)==25
ids=['achievementSearch','achievementFilter','achievementImageFilter','achievementSort','collectionSearch','collectionStatusFilter','collectionSort'];marker='[data-hkia-svelte-filters="1"]'
# Deliberately synthetic GUIDs, not a real save or game-derived account.
g1='00000000000000000000000000000001';g2='00000000000000000000000000000002';fixture={'Achievements':{g1:{'IsComplete':True,'CurrentValue':9,'CompletedTime':'2026-01-01T00:00:00Z'},g2:{'IsComplete':False,'CurrentValue':2,'CompletedTime':None}},'Counters':{}}
def probe(browser,url,width,mounted,abort=False):
 page=browser.new_page(viewport={'width':width,'height':900});errors=[];external=[];bad=[];downloads=[]
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:external.append(r.url) if not r.url.startswith(url) else None);page.on('response',lambda r:bad.append(r.status) if r.status>=400 and not r.url.endswith('/favicon.ico') else None);page.on('download',lambda d:downloads.append(d.suggested_filename))
 page.add_init_script("""const capture=()=>{const a=document.getElementById('achPanel'),c=document.getElementById('colPanel'),g=document.getElementById('collectionGrid'),l=document.getElementById('achievementsList');if(a&&c&&g&&l&&!window.__hkiaRefs)window.__hkiaRefs=[a,c,g,l];};new MutationObserver(capture).observe(document,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',capture);""")
 if abort:page.route('**/src/product-filters.mjs',lambda r:r.abort())
 try:
  assert page.goto(url,wait_until='domcontentloaded',timeout=30000).ok;cards=page.locator('#collectionGrid .collection-card');rows=page.locator('#achievementsList .achievement-row');expect(cards).to_have_count(25,timeout=30000)
  expect(page.locator(marker)).to_have_count(3 if mounted else 0,timeout=20000)
  def ctrl(id):return page.locator('#'+id)
  def snap():return page.evaluate("""ids=>Object.fromEntries(ids.map(id=>{const e=document.getElementById(id);return [id,[e.value,e.hidden,e.getAttribute('aria-label')]]}))""",ids)
  def rowtext():return rows.evaluate_all("xs=>xs.map(x=>[x.getAttribute('aria-label'),x.innerText])")
  assert page.evaluate("window.__hkiaRefs?.every((e,i)=>e===document.getElementById(['achPanel','colPanel','collectionGrid','achievementsList'][i]))")
  for id in ids:assert ctrl(id).count()==1
  expect(ctrl('achievementImageFilter')).to_be_visible(timeout=20000);ctrl('achievementSearch').fill('preload');ctrl('achievementFilter').select_option('missing');ctrl('achievementImageFilter').select_option('unknown');ctrl('achievementSort').select_option('progress-asc');ctrl('colTab').click();ctrl('collectionSearch').fill(catalog[0]['key']);ctrl('collectionStatusFilter').select_option('unknown');ctrl('collectionSort').select_option('name');ctrl('achTab').click();pre=snap()
  ctrl('saveInput').set_input_files({'name':'synthetic-settings.json','mimeType':'application/json','buffer':json.dumps(fixture).encode()});expect(ctrl('fileStatus')).to_have_text('Account JSON',timeout=30000);expect(rows).to_have_count(2);post=snap();assert all(post[i][0]==v for i,v in [('achievementSearch',''),('collectionSearch',''),('achievementFilter','all'),('achievementImageFilter','all'),('collectionStatusFilter','all'),('achievementSort','progress-asc'),('collectionSort','name')]);assert g2 in rows.first.inner_text()
  # Every event must invoke the actual legacy render once. Mutation count is compared to baseline.
  page.evaluate("""()=>{window.__counts=[0,0];for(const [i,id] of ['achievementsList','collectionGrid'].entries())new MutationObserver(rs=>window.__counts[i]+=rs.filter(r=>r.type==='childList').length).observe(document.getElementById(id),{childList:true});}""")
  ctrl('achievementFilter').select_option('complete');expect(rows).to_have_count(1);assert g1 in rows.first.inner_text();complete=rowtext();ctrl('achievementFilter').select_option('all');ctrl('achievementSearch').fill(g2);expect(rows).to_have_count(1);assert g2 in rows.first.inner_text();ctrl('achievementSearch').fill('');ctrl('achievementSort').select_option('progress-desc');expect(rows).to_have_count(2);assert g1 in rows.first.inner_text();ctrl('achievementImageFilter').select_option('exact');expect(rows).to_have_count(0);ctrl('achievementImageFilter').select_option('all');expect(rows).to_have_count(2);rows.first.click();expect(ctrl('editorPanel')).to_contain_text(g1);detail=ctrl('editorPanel').inner_text();ctrl('achievementSearch').fill('not found');expect(rows).to_have_count(0);ctrl('achievementSearch').fill('');expect(rows).to_have_count(2);assert ctrl('editorPanel').inner_text()==detail
  ctrl('colTab').click();ctrl('collectionStatusFilter').select_option('has-record');expect(cards).to_have_count(0);ctrl('collectionStatusFilter').select_option('unknown');expect(cards).to_have_count(25);ctrl('collectionStatusFilter').select_option('all');ctrl('collectionSort').select_option('source');ctrl('collectionSearch').fill(catalog[0]['key']);expect(cards).not_to_have_count(0);filtered=cards.locator('.collection-title').all_text_contents();ctrl('collectionSearch').fill('');expect(cards).to_have_count(25)
  for i in range(25):
   c=cards.nth(i);c.scroll_into_view_if_needed();img=c.locator('img');page.wait_for_function('(e)=>e.complete&&e.naturalWidth>0',arg=img.element_handle(),timeout=12000)
  images=cards.evaluate_all("xs=>xs.map(x=>[x.querySelector('img').getAttribute('src'),x.querySelector('img').naturalWidth,x.querySelector('img').naturalHeight])");assert [x[0] for x in images]==[c['icon'] if c['icon'].startswith('./') else './'+c['icon'] for c in catalog]
  ctrl('achTab').click();expect(ctrl('achievementSort')).to_have_value('progress-desc');assert ctrl('editorPanel').inner_text()==detail;assert ctrl('fileStatus').inner_text()=='Account JSON';assert ctrl('downloadEdited').is_disabled() and ctrl('nativeDownload').is_disabled() and ctrl('nativeDiscard').is_disabled();assert page.evaluate("document.documentElement.dataset.nativePreview==='off' && document.documentElement.scrollWidth<=innerWidth");assert not errors and not external and not bad and not downloads,(errors,external,bad,downloads)
  return {'width':width,'pre':pre,'post':post,'complete':complete,'detail':detail,'filtered':filtered,'images':images,'counts':page.evaluate('window.__counts'),'end':snap(),'syntheticAccountUnchanged':True}
 finally:page.close()
try:
 with sync_playwright() as p:
  opts={'headless':True};
  if args.chrome:opts['executable_path']=args.chrome
  browser=p.chromium.launch(**opts);reports=[]
  for width in (320,375,1280):
   a=probe(browser,roots[0],width,False);b=probe(browser,roots[1],width,True);assert a==b,'product filter parity mismatch';reports.append({'width':width,'actualCategoryImages':25,'syntheticAccount':2,'allSevenControls':True,'resetAndSortRetention':True,'sameProjection':True,'exactRenderCounts':a['counts'],'sha256':hashlib.sha256(json.dumps(a,ensure_ascii=False,sort_keys=True).encode()).hexdigest()})
  assert probe(browser,roots[1],375,False,True)==probe(browser,roots[0],375,False),'fallback mismatch';browser.close();print(json.dumps({'reports':reports,'moduleAbortFallback':True,'writerOff':True,'noExternalOrDownload':True}))
finally:
 for s,t in servers:s.shutdown();s.server_close();t.join()
