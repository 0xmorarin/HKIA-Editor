"""Actual built module plus exact retained V33; no real Save, deploy or external traffic."""
import argparse,hashlib,json,threading
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from playwright.sync_api import sync_playwright,expect

parser=argparse.ArgumentParser();parser.add_argument('base');parser.add_argument('candidate');parser.add_argument('--chrome');args=parser.parse_args()
base,candidate=map(lambda p:Path(p).resolve(strict=True),(args.base,args.candidate))
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def end_headers(self):
  self.send_header('Cache-Control','no-store');super().end_headers()
servers=[]
def serve(root):
 server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)));thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start();servers.append((server,thread));return f'http://127.0.0.1:{server.server_port}/'
roots=[serve(base),serve(candidate)];catalog=json.loads((base/'data/collections.json').read_text());defs=json.loads((base/'data/collection-definitions.json').read_text());assert len(catalog)==25 and len(defs)==181
MARK='[data-hkia-svelte-categories="1"]'
def tab(page,name):
 a=name=='achTab';expect(page.locator('#achTab')).to_have_attribute('aria-selected',str(a).lower());expect(page.locator('#colTab')).to_have_attribute('aria-selected',str(not a).lower());assert page.locator('#achTab').evaluate('(e)=>e.tabIndex')==(0 if a else -1);assert page.locator('#colTab').evaluate('(e)=>e.tabIndex')==(-1 if a else 0);assert page.locator('#achPanel').evaluate('(e)=>e.hidden')== (not a);assert page.locator('#colPanel').evaluate('(e)=>e.hidden')==a

def probe(browser,url,width,mounted,abort=False):
 page=browser.new_page(viewport={'width':width,'height':900});errors=[];external=[];bad=[]
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:external.append(r.url) if not r.url.startswith(url) else None)
 page.on('response',lambda r:bad.append(r.status) if r.status>=400 and not r.url.endswith('/favicon.ico') else None)
 page.add_init_script("""const capture=()=>{const a=document.getElementById('achPanel'),c=document.getElementById('colPanel');if(a&&c&&!window.__hkiaPanelRefs)window.__hkiaPanelRefs=[a,c];};new MutationObserver(capture).observe(document,{childList:true,subtree:true});document.addEventListener('DOMContentLoaded',capture);""")
 if abort:page.route('**/src/product-categories.mjs',lambda route:route.abort())
 try:
  assert page.goto(url,wait_until='domcontentloaded',timeout=30000).ok
  # Bootstrap has loaded the real data and registered original handlers before module import.
  expect(page.locator('#collectionGrid .collection-card')).to_have_count(25,timeout=30000)
  if mounted:expect(page.locator(MARK)).to_have_count(1,timeout=20000)
  else:expect(page.locator(MARK)).to_have_count(0)
  assert page.evaluate("document.documentElement.dataset.nativePreview==='off' && window.__hkiaPanelRefs?.[0]===document.getElementById('achPanel') && window.__hkiaPanelRefs?.[1]===document.getElementById('colPanel')")
  for id in ['achTab','colTab','achPanel','colPanel']:assert page.locator('#'+id).count()==1
  page.locator('#colTab').click();tab(page,'colTab');cards=page.locator('#collectionGrid .collection-card');expect(cards).to_have_count(25)
  # Exact actual category artwork, not only DOM src. Scroll each lazy image into view.
  for i in range(25):
   card=cards.nth(i);card.scroll_into_view_if_needed();img=card.locator('img');expect(img).to_have_count(1);page.wait_for_function('(e)=>e.complete&&e.naturalWidth>0&&e.naturalHeight>0',arg=img.element_handle(),timeout=12000)
  projection=cards.evaluate_all("rows=>rows.map(r=>({title:r.querySelector('.collection-title').textContent,meta:r.querySelector('.collection-meta').textContent,src:r.querySelector('img').getAttribute('src'),status:r.querySelector('[data-image-status]')?.dataset.imageStatus??null,width:r.querySelector('img').naturalWidth,height:r.querySelector('img').naturalHeight}))")
  assert all(x['status'] in ('EXACT','EXISTING_VERIFIED') for x in projection), 'verified resolver not active'
  assert [x['src'] for x in projection]==[c['icon'] if c['icon'].startswith('./') else './'+c['icon'] for c in catalog]
  # Rerender must replace only the current category host, never the panel/detail.
  old_grid=page.locator('#collectionGrid').element_handle();page.locator('#colTab').click();tab(page,'colTab');expect(cards).to_have_count(25)
  if mounted:
   assert not old_grid.evaluate('(e)=>e.isConnected');assert page.locator(MARK).count()==1
   assert cards.evaluate_all("r=>r.map(x=>x.dataset.categoryKey)")==[c['key'] for c in catalog]
  else:assert old_grid.evaluate('(e)=>e.isConnected')
  assert page.locator('#collectionGrid').count()==1
  page.locator('#colTab').press('Home');tab(page,'achTab');expect(page.locator('#achTab')).to_be_focused();page.locator('#achTab').press('End');tab(page,'colTab');expect(page.locator('#colTab')).to_be_focused();page.locator('#colTab').press('ArrowLeft');tab(page,'achTab');page.locator('#achTab').press('ArrowRight');tab(page,'colTab')
  page.locator('#collectionStatusFilter').select_option('has-record');expect(cards).to_have_count(0);page.locator('#collectionStatusFilter').select_option('unknown');expect(cards).to_have_count(25);page.locator('#collectionStatusFilter').select_option('all')
  page.locator('#collectionSort').select_option('name');sorted_titles=cards.locator('.collection-title').all_text_contents();page.locator('#collectionSort').select_option('source');page.locator('#collectionSearch').fill(catalog[0]['key']);expect(cards).not_to_have_count(0);filtered=cards.locator('.collection-title').all_text_contents();page.locator('#achTab').click();tab(page,'achTab');page.locator('#achievementSearch').fill('fixture-probe');page.locator('#achievementFilter').select_option('missing');page.locator('#colTab').click();tab(page,'colTab');expect(page.locator('#collectionSearch')).to_have_value(catalog[0]['key']);assert cards.locator('.collection-title').all_text_contents()==filtered;page.locator('#collectionSearch').fill('');expect(cards).to_have_count(25)
  cards.first.click();expect(cards.first).to_be_focused();expect(page.locator('#collectionDetail')).to_be_visible();cards.first.click();expect(cards.first).to_be_focused();definition=page.locator('#collectionDetail .definition-button');assert definition.count()==sum(d['group']==catalog[0]['key'] for d in defs);definition.first.click();detail=page.locator('#collectionDetail').inner_text();selected=page.locator('#collectionGrid .collection-card.selected').count();assert selected==1
  page.locator('#achTab').click();tab(page,'achTab');expect(page.locator('#achievementSearch')).to_have_value('fixture-probe');expect(page.locator('#achievementFilter')).to_have_value('missing');assert page.locator('#achievementsList .achievement-row').count()==0;page.locator('#colTab').click();tab(page,'colTab');assert page.locator('#collectionDetail').inner_text()==detail
  off=page.evaluate("""()=>Object.fromEntries(['nativeDownload','nativeDiscard','downloadEdited','downloadZip','openNativePreview','closeNativePreview'].map(id=>[id,[document.getElementById(id).disabled,document.getElementById(id).hidden]]))""");assert all(off[id][0] for id in ['nativeDownload','nativeDiscard','downloadEdited','downloadZip']);assert page.locator('#fileStatus').inner_text()=='未読み込み';assert page.locator('#attributionNotice').count()==1;assert page.evaluate('document.documentElement.scrollWidth<=innerWidth');assert not errors and not external and not bad,(errors,external,bad)
  return {'width':width,'projection':projection,'sorted':sorted_titles,'filtered':filtered,'detail':detail,'off':off,'attribution':page.locator('#attributionNotice').inner_text()}
 finally:page.close()
def failed_image(browser,url,mounted):
 page=browser.new_page(viewport={'width':375,'height':900});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 try:
  page.route('**/'+catalog[0]['icon'].removeprefix('./'),lambda route:route.abort())
  assert page.goto(url,wait_until='domcontentloaded',timeout=30000).ok
  expect(page.locator('#collectionGrid .collection-card')).to_have_count(25,timeout=30000)
  if mounted:expect(page.locator(MARK)).to_have_count(1,timeout=20000)
  page.locator('#colTab').click();card=page.locator('#collectionGrid .collection-card').first;card.scroll_into_view_if_needed();expect(card.locator('.media-thumb')).to_have_attribute('data-image-status','LOAD_FAILED',timeout=12000);expect(card.locator('.media-null-mark')).to_have_count(1);expect(card.locator('img')).to_have_count(0);assert not errors
 finally:page.close()
try:
 with sync_playwright() as p:
  opts={'headless':True};
  if args.chrome:opts['executable_path']=args.chrome
  browser=p.chromium.launch(**opts);reports=[]
  for w in (320,375,1280):
   a=probe(browser,roots[0],w,False);b=probe(browser,roots[1],w,True);assert a==b,'actual V33 product parity mismatch';reports.append({'width':w,'actualCategoryImages':25,'sameProductProjection':True,'singleGridHost':True,'legacyPanelsSameNodes':True,'categorySelectionFocus':True,'filtersSelectionRetained':True,'writerOff':True,'pageErrors':0,'externalRequests':0,'overflow':0,'projectionSha256':hashlib.sha256(json.dumps(a,ensure_ascii=False,sort_keys=True).encode()).hexdigest()})
  fallback=probe(browser,roots[1],375,False,abort=True);baseline=probe(browser,roots[0],375,False);assert fallback==baseline,'legacy fallback differs';failed_image(browser,roots[0],False);failed_image(browser,roots[1],True);browser.close();print(json.dumps({'widths':reports,'bundleAbortFallback':True,'mappedImageFailureFallback':True,'actualCompiledSvelteRequired':True}))
finally:
 for server,thread in servers:server.shutdown();server.server_close();thread.join()
