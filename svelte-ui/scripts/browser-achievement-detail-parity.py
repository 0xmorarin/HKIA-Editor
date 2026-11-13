"""Built Vite read-only inspector, synthetic records only."""
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
   assert page.goto(origin+'/').ok;panel=page.locator('#editorPanel');expect(panel).to_contain_text('一覧から実績を選択してください。')
   row=page.locator('[data-achievement-guid="fixture-002"]');row.click();expect(row).to_be_focused();expect(panel).to_contain_text('fixture-002');expect(panel).to_contain_text('未保存（状態UNKNOWN）');expect(panel).to_contain_text('UNKNOWN（保存値なし）');expect(panel).to_contain_text('新規レコード生成と保存出力は禁止です。');expect(panel).to_contain_text('UNKNOWN（変更禁止）');expect(panel.locator('input,button,form')).to_have_count(0)
   page.locator('#achievementSearch').fill('not found');expect(panel).to_contain_text('fixture-002');page.locator('#achievementSearch').fill('');page.locator('[data-achievement-guid="fixture-000"]').click();expect(panel).to_contain_text('2026-01-01T00:00:00.1234567Z');expect(panel).to_contain_text('Document ID');page.locator('[data-achievement-guid="fixture-003"]').click();expect(panel).to_contain_text('UNKNOWN（名称未照合）');expect(panel).to_contain_text('未設定');page.locator('#colTab').click();page.locator('#achTab').click();expect(panel).to_contain_text('fixture-003');expect(panel.locator('input,button,form')).to_have_count(0)
   assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth');assert not errors and not external,(errors,external);records.append({'width':width,'missingDistinct':True,'selectionRetained':True,'precision7digits':True,'unknownIdentity':True,'noWriterControls':True,'overflow':False,'external':0,'errors':0});page.close()
  browser.close()
finally:server.shutdown();server.server_close();thread.join()
print(json.dumps(records))
