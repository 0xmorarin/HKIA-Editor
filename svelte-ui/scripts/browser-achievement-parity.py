"""Actual built Vite fixture. No save, no live product, no external requests."""
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
   assert page.goto(origin+'/').ok;rows=page.locator('#achievementsList .achievement-row');more=page.locator('#achievementsList .show-more');expect(rows).to_have_count(120);expect(more).to_contain_text('121件');missing=page.locator('[data-achievement-guid="fixture-002"]');expect(missing).to_have_class('achievement-row missing-record');expect(missing).to_contain_text('未保存（状態UNKNOWN）');expect(page.locator('[data-achievement-guid="fixture-003"]')).to_contain_text('名称未照合・保存済みレコード')
   missing.click();expect(missing).to_be_focused();expect(page.locator('#editorPanel')).to_contain_text('fixture-002');missing.press('Enter');expect(page.locator('main')).to_have_attribute('data-ach-selects','2');more.click();expect(rows).to_have_count(240);expect(more).to_contain_text('1件');more.click();expect(rows).to_have_count(241);expect(more).to_have_count(0);expect(missing).to_have_class('achievement-row selected missing-record');expect(page.locator('main')).to_have_attribute('data-ach-more','2')
   page.locator('#achievementFilter').select_option('incomplete');expect(rows).to_have_count(120);expect(page.locator('#achievementsList .missing-record')).to_have_count(0);page.locator('#achievementFilter').select_option('missing');expect(rows).to_have_count(60);expect(missing).to_have_class('achievement-row selected missing-record');page.locator('#achievementSearch').fill('not found');expect(rows).to_have_count(0);expect(page.locator('#achievementsList')).to_contain_text('条件に一致する記録がありません。');page.locator('#achievementSearch').fill('');page.locator('#achievementFilter').select_option('all');expect(rows).to_have_count(120);page.locator('#colTab').click();page.locator('#achTab').click();expect(missing).to_have_class('achievement-row selected missing-record');expect(rows).to_have_count(120)
   assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth');assert not errors and not external,(errors,external);records.append({'width':width,'paging':[120,240,241],'selection':2,'filterReset':True,'missingDistinct':True,'overflow':False,'errors':0,'external':0});page.close()
  browser.close()
finally:server.shutdown();server.server_close();thread.join()
print(json.dumps(records))
