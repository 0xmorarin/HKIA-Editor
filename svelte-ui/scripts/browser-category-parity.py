"""Actual compiled isolated Vite view. Synthetic rows only, no Save/Writer."""
import json,sys
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright,expect
root=Path(sys.argv[1]).resolve(strict=True);assert (root/'index.html').is_file()
server=ThreadingHTTPServer(('127.0.0.1',0),partial(SimpleHTTPRequestHandler,directory=str(root)));thread=Thread(target=server.serve_forever,daemon=True);thread.start();origin=f'http://127.0.0.1:{server.server_port}'
records=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(headless=True)
  for width in (320,375,1280):
   page=browser.new_page(viewport={'width':width,'height':900});errors=[];external=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('request',lambda r:external.append(r.url) if not r.url.startswith(origin+'/') else None)
   assert page.goto(origin+'/').ok;page.locator('#colTab').click();cards=page.locator('#collectionGrid .collection-card');expect(cards).to_have_count(3);expect(page.locator('#collectionGrid .collection-icon-fallback')).to_have_count(3);expect(page.locator('#collectionDetail')).not_to_be_visible()
   b=page.locator('[data-category-key="fixture-b"]');b.click();expect(b).to_have_class('collection-card selected');expect(b).to_be_focused();expect(page.locator('#collectionDetail')).to_be_visible();expect(page.locator('#collectionDetail')).to_contain_text('fixture-b');expect(page.locator('main')).to_have_attribute('data-category-renders','1');b.press('Enter');expect(page.locator('main')).to_have_attribute('data-category-renders','2');expect(b).to_be_focused()
   page.locator('#collectionSearch').fill('A');expect(cards).to_have_count(1);expect(page.locator('#collectionGrid .selected')).to_have_count(0);page.locator('#collectionSearch').fill('');expect(cards).to_have_count(3);expect(b).to_have_class('collection-card selected');page.locator('#collectionStatusFilter').select_option('no-record');expect(cards).to_have_count(0);expect(page.locator('#collectionGrid')).to_contain_text('該当するカテゴリがありません。');page.locator('#collectionStatusFilter').select_option('unknown');expect(cards).to_have_count(3)
   assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth');assert not errors and not external,(errors,external);records.append({'width':width,'selection':2,'filterRetention':True,'unknownDistinct':True,'overflow':False,'errors':0,'external':0});page.close()
  browser.close()
finally:server.shutdown();server.server_close();thread.join()
print(json.dumps(records))
