export function offerFile(bytes,name,type='application/octet-stream'){
  const data=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
  const blob=new Blob([data],{type});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),5000);
}
