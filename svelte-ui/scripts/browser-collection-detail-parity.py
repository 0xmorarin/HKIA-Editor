"""Actual built Vite fixture. No Save, no live product, no external requests."""
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
   assert page.goto(origin+'/').ok;page.locator('#colTab').click();b=page.locator('[data-category-key="fixture-b"]');b.click();detail=page.locator('#collectionDetail');expect(detail).to_be_visible();expect(detail.locator('.definition-button')).to_have_count(3);d=detail.locator('[data-definition-key="fixture-b-definition"]');d.click();expect(d).to_be_focused();expect(d).to_have_attribute('aria-pressed','true');expect(detail.get_by_label('収集履歴の状態')).to_be_disabled();rows=detail.locator('.collection-item-row');expect(rows).to_have_count(100);expect(rows.first).to_contain_text('未照合');expect(rows.first).to_contain_text('親ID 9999（他カテゴリ）');expect(rows.first.locator('[data-image-kind="item"]')).to_have_attribute('data-image-status','NOT_IN_SOURCE_MAP');more=detail.locator('.show-more');more.click();expect(rows).to_have_count(200);more.click();expect(rows).to_have_count(201);expect(more).to_have_count(0)
   rows.first.get_by_role('button',name='詳細・変更案').click();inspector=detail.locator('.item-inspector');expect(inspector).to_contain_text('10200');expect(inspector).to_contain_text('保存履歴は未照合');q=detail.get_by_label('コレクションアイテムの検索');q.fill('12345');expect(rows).to_have_count(1);q.fill('not found');expect(rows).to_have_count(0);expect(inspector).to_contain_text('10200');q.fill('');expect(rows).to_have_count(100);detail.get_by_label('収集アイテムの並び順').select_option('id');expect(rows.first).to_have_attribute('data-item-id','10000');page.locator('#achTab').click();page.locator('#colTab').click();expect(inspector).to_contain_text('10200');b.click();expect(detail.locator('.collection-item-row')).to_have_count(0);expect(d).to_have_attribute('aria-pressed','false');expect(b).to_be_focused();d.click();expect(rows).to_have_count(100);expect(inspector).not_to_contain_text('10200');assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth');assert not errors and not external,(errors,external);records.append({'width':width,'paging':[100,200,201],'searchSortReset':True,'unknownFilterDisabled':True,'selectionRetention':True,'categoryReset':True,'overflow':False,'errors':0,'external':0});page.close()
  browser.close()
finally:server.shutdown();server.server_close();thread.join()
print(json.dumps(records))
