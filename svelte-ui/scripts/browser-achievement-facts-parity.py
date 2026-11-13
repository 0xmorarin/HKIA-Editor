"""Built Vite R7 synthetic read-only facts. No Save, game asset or Writer."""
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
   assert page.goto(origin+'/').ok;panel=page.locator('#achievementFacts');expect(panel).to_have_count(0)
   page.locator('[data-achievement-guid="fixture-000"]').click();expect(panel).to_be_visible();expect(panel).to_contain_text('null（空配列と異なる）');expect(panel).to_contain_text('1/2件（未保存 1件）');expect(panel).to_contain_text('未保存（未達成と断定不可）');expect(panel).to_contain_text('未判定（受取記録・付与処理と照合できていません）');expect(panel).to_contain_text('Group CurrentValue単独編集は禁止');expect(panel.locator('input,button,form')).to_have_count(0)
   page.locator('#achievementSearch').fill('not found');expect(panel).to_contain_text('fixture-counter-guid');page.locator('#achievementSearch').fill('');page.locator('[data-achievement-guid="fixture-001"]').click();expect(panel).to_contain_text('未保存 / 未生成（0とは断定しません）');expect(panel).to_contain_text('なし（数量0）');expect(panel).not_to_contain_text('fixture-group-guid');page.locator('[data-achievement-guid="fixture-002"]').click();expect(panel).to_have_count(0);page.locator('[data-achievement-guid="fixture-003"]').click();expect(panel).to_contain_text('個別実績の定義は未確認です。');expect(panel).not_to_contain_text('fixture-counter-guid');page.locator('#colTab').click();page.locator('#achTab').click();expect(panel).to_contain_text('個別実績の定義は未確認です。')
   assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth');assert not errors and not external,(errors,external);records.append({'width':width,'nullDistinct':True,'rewardUnconfirmed':True,'groupSeparate':True,'selectionRetained':True,'noWriter':True,'overflow':False,'errors':0,'external':0});page.close()
  browser.close()
finally:server.shutdown();server.server_close();thread.join()
print(json.dumps(records))
