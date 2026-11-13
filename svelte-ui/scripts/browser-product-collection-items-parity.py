"""Exact fixed V33 and compiled collection list; public catalog, no actual Save."""
import argparse,json,threading,hashlib
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from collections import Counter
from playwright.sync_api import sync_playwright,expect
p=argparse.ArgumentParser();p.add_argument('base');p.add_argument('candidate');p.add_argument('--chrome');a=p.parse_args()
base,candidate=map(lambda x:Path(x).resolve(strict=True),(a.base,a.candidate));servers=[]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def end_headers(self):self.send_header('Cache-Control','no-store');super().end_headers()
def serve(root):
 s=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(root)));t=threading.Thread(target=s.serve_forever,daemon=True);t.start();servers.append((s,t));return f'http://127.0.0.1:{s.server_port}/'
roots=[serve(base),serve(candidate)]
cats=json.loads((base/'data/collections.json').read_text());defs=json.loads((base/'data/collection-definitions.json').read_text());items=json.loads((base/'data/item-collection-crosswalk.json').read_text())['items'];media=json.loads((base/'media/image-map.json').read_text())['collectionItemIds']
counts=Counter((x.get('collection_key'),x.get('collection_guid')) for x in items)
icons={x['itemId']:x['icon'] for x in media if x['icon']['status'] in ('EXACT','EXISTING_VERIFIED')}
choices=[d for d in defs if 100<counts[d['key'],d['guid']]<=1200 and any(x['id'] in icons for x in items if x.get('collection_key')==d['key'] and x.get('collection_guid')==d['guid'])]
assert choices,'actual catalog needs a paged mapped definition'
d=choices[0];members=[x for x in items if x.get('collection_key')==d['key'] and x.get('collection_guid')==d['guid']];catindex=next(i for i,c in enumerate(cats) if c['key']==d['group']);assert len({x['id'] for x in members})==len(members)
chosen=next(x for x in members if x['id'] in icons);mark='[data-hkia-svelte-collection-items="1"]'
def probe(browser,url,width,mounted,abort=False,fail_image=False):
 page=browser.new_page(viewport={'width':width,'height':900});errors=[];external=[];bad=[];downloads=[]
 page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:external.append(r.url) if not r.url.startswith(url) else None);page.on('response',lambda r:bad.append(r.status) if r.status>=400 and not r.url.endswith('/favicon.ico') else None);page.on('download',lambda d:downloads.append(d.suggested_filename))
 if abort:page.route('**/src/product-collection-items.mjs',lambda r:r.abort())
 if fail_image:page.route('**/'+icons[chosen['id']]['image'],lambda r:r.abort())
 try:
  assert page.goto(url,wait_until='domcontentloaded',timeout=30000).ok;expect(page.locator('#collectionGrid .collection-card')).to_have_count(25,timeout=30000)
  page.locator('#colTab').click();page.locator('#collectionGrid .collection-card').nth(catindex).click()
  panel=page.locator('#collectionDetail');ref=panel.element_handle();panel.locator('.definition-button').filter(has=page.get_by_text(d['key'],exact=True)).click()
  expect(panel.locator('.collection-items-list')).to_have_count(1);expect(page.locator(mark)).to_have_count(1 if mounted else 0,timeout=12000)
  rows=panel.locator('.collection-item-row');expect(rows).to_have_count(100);expect(panel.locator('select[aria-label="収集履歴の状態"]')).to_be_disabled()
  q=panel.get_by_role('searchbox',name='コレクションアイテムの検索');sort=panel.get_by_role('combobox',name='収集アイテムの並び順')
  def project():
   assert ref.evaluate("(e)=>e===document.getElementById('collectionDetail')");assert panel.locator('.collection-items-list').count()==1
   return {'caption':panel.locator('.collection-list-caption').inner_text(),'rows':rows.evaluate_all("""rs=>rs.map(r=>[r.querySelector('.item-source-name').textContent,r.querySelector('.item-source-id').textContent,r.querySelector('.collection-status').textContent,r.querySelector('.item-source-parent')?.textContent??null,r.querySelector('.media-thumb')?.dataset.imageStatus??null,r.querySelector('img')?.getAttribute('src')??null])""")}
  if fail_image:
   q.fill(str(chosen['id']));target=rows.filter(has=page.get_by_text('ID '+str(chosen['id']),exact=True));expect(target).to_have_count(1);target.scroll_into_view_if_needed();expect(target.locator('.media-thumb')).to_have_attribute('data-image-status','LOAD_FAILED',timeout=12000);expect(target.locator('.media-null-mark')).to_have_count(1);expect(target.locator('img')).to_have_count(0);assert not errors;return True
  out=[project()];old=panel.locator('.collection-items-list').element_handle();panel.locator('.show-more').click();expect(rows).to_have_count(min(200,len(members)));expect(page.locator(mark)).to_have_count(1 if mounted else 0);out.append(project())
  if mounted:assert not old.evaluate('(e)=>e.isConnected')
  q.fill(str(chosen['id']));target=rows.filter(has=page.get_by_text('ID '+str(chosen['id']),exact=True));expect(target).to_have_count(1);target.scroll_into_view_if_needed();img=target.locator('img');expect(img).to_have_count(1);page.wait_for_function('(e)=>e.complete&&e.naturalWidth>0',arg=img.element_handle(),timeout=12000);assert img.get_attribute('src')=='./'+icons[chosen['id']]['image']
  target.locator('.item-inspect-button').click();expect(panel.locator('.item-inspector')).to_contain_text(str(chosen['id']));out.append(project());out.append(panel.locator('.item-inspector').inner_text())
  q.fill('no-such-fixture-match-9999');expect(rows).to_have_count(0);expect(panel.locator('.collection-items-list .placeholder')).to_have_count(1);out.append(project())
  q.fill('');expect(rows).to_have_count(100);sort.select_option('id');out.append(project());sort.select_option('name');out.append(project());sort.select_option('source')
  panel.locator('.definition-button').filter(has=page.get_by_text(d['key'],exact=True)).click();expect(rows).to_have_count(100);out.append(project())
  assert page.locator('#downloadEdited').is_disabled() and page.locator('#nativeDownload').is_disabled();assert page.evaluate("document.documentElement.dataset.nativePreview==='off'&&document.documentElement.scrollWidth<=innerWidth");assert not errors and not external and not bad and not downloads,(errors,external,bad,downloads)
  return out
 finally:page.close()
try:
 with sync_playwright() as p:
  opts={'headless':True}
  if a.chrome:opts['executable_path']=a.chrome
  b=p.chromium.launch(**opts);reports=[]
  for w in (320,375,1280):
   x=probe(b,roots[0],w,False);y=probe(b,roots[1],w,True);assert x==y,'collection item parity';reports.append({'width':w,'sha256':hashlib.sha256(json.dumps(x,ensure_ascii=False).encode()).hexdigest(),'sameProjection':True,'actualImage':True})
  assert probe(b,roots[1],375,False,True)==probe(b,roots[0],375,False);assert probe(b,roots[0],375,False,fail_image=True) and probe(b,roots[1],375,True,fail_image=True);b.close();print(json.dumps({'reports':reports,'moduleAbortFallback':True,'mappedImageFailure':True,'writerOff':True,'noSave':True}))
finally:
 for s,t in servers:s.shutdown();s.server_close();t.join()
