#!/usr/bin/env python3
"""Real Chrome Module Worker witness. Only static code served; input paths use file chooser.
Private mode outputs are local-only and must never run in public CI. Synthetic mode compares
against the fixed native R4 CLI. No network exceptions beyond exact loopback code origin."""
import argparse,hashlib,json,os,pathlib,threading,tempfile,subprocess
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from playwright.sync_api import sync_playwright

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 p=argparse.ArgumentParser();p.add_argument('--bundle',type=Path,required=True);p.add_argument('--chrome',required=True);p.add_argument('--input300',type=Path,required=True);p.add_argument('--input301',type=Path,required=True);p.add_argument('--synthetic-native',type=Path);p.add_argument('--private-output',type=Path);p.add_argument('--result',type=Path,required=True);a=p.parse_args();root=a.bundle.resolve();assert (a.synthetic_native is None)!=(a.private_output is None)
 if a.private_output:a.private_output.mkdir(parents=True,exist_ok=False)
 inputs=[a.input300.resolve(),a.input301.resolve()];assert all(not x.is_relative_to(root) for x in inputs)
 allow={x.relative_to(root).as_posix() for x in root.rglob('*') if x.is_file() and x.suffix in ('.js','.wasm','.html')};assert allow and all(x.startswith(('rust-worker/','tests/rust/wasm-browser/')) for x in allow)
 served=[];violations=[]
 class Handler(SimpleHTTPRequestHandler):
  def __init__(self,*args,**kw):super().__init__(*args,directory=str(root),**kw)
  def log_message(self,*args):pass
  def do_GET(self):
   path=self.path.split('?',1)[0].lstrip('/')
   if path not in allow:violations.append('unexpected_get');self.send_error(404);return
   served.append(path);super().do_GET()
  def do_POST(self):violations.append('post');self.send_error(405)
  def end_headers(self):self.send_header('Cache-Control','no-store');self.send_header('Content-Security-Policy',"default-src 'none'; img-src data:; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'");super().end_headers()
 server=ThreadingHTTPServer(('127.0.0.1',0),Handler);threading.Thread(target=server.serve_forever,daemon=True).start();origin=f'http://127.0.0.1:{server.server_port}';results=[]
 try:
  with tempfile.TemporaryDirectory(prefix='hkia-r5-browser-') as td,sync_playwright() as pw:
   browser=pw.chromium.launch(executable_path=a.chrome,headless=True,args=['--no-sandbox','--disable-dev-shm-usage']);ctx=browser.new_context(accept_downloads=True);external=[]
   def route(r):
    if r.request.url.startswith(origin+'/') and r.request.method=='GET':r.continue_()
    else:external.append('denied');r.abort()
   ctx.route('**/*',route);page=ctx.new_page();page.set_default_timeout(180000);page.goto(origin+'/tests/rust/wasm-browser/index.html');page.wait_for_function('!!window.hkiaWitness');assert page.evaluate('isSecureContext && !!crypto.subtle && !!WebAssembly')
   for index,src in enumerate(inputs):
    before=sha(src);page.locator('#file').set_input_files(str(src));page.locator('#other').set_input_files(str(inputs[1-index]));version=['3.0.0','3.0.1'][index]
    for op in ('history','progress','batch'):
     row=page.evaluate('(op)=>window.hkiaWitness.run(op,true)',op)
     with page.expect_download() as info:page.locator('#download').click()
     out=(a.private_output or Path(td))/f'{version}-{op}.zip';info.value.save_as(str(out));assert sha(src)==before and sha(out)!=before
     if a.synthetic_native:
      q=subprocess.run([str(a.synthetic_native),'--private-writer',op],input=src.read_bytes(),capture_output=True,timeout=120);assert q.returncode==0 and not q.stderr and q.stdout==out.read_bytes()
     row.update(version=version,nativeExact=bool(a.synthetic_native),downloaded=True);results.append(row)
    raw=page.evaluate('window.hkiaWitness.rawLifecycle()');assert raw['replay'] and raw['stale'] and raw['foreign'] and raw['close'];results.append({'version':version,'rawLifecycle':raw})
   page.evaluate('window.hkiaWitness.close()');assert not external and not violations;report={'status':'PASS_REAL_CHROME_MODULE_WORKER','chrome':browser.version,'mode':'SYNTHETIC' if a.synthetic_native else 'PRIVATE_GENUINE_CANDIDATES_REQUIRE_INDEPENDENT_ORACLE','results':results,'servedCodeOnly':sorted(set(served)),'networkDenied':len(external),'serverViolations':len(violations),'secureContext':True};browser.close()
 finally:server.shutdown();server.server_close()
 a.result.write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
if __name__=='__main__':main()
