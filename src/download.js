export function offerFile(bytes,name,type='application/octet-stream'){
  const blob=bytes instanceof Blob?bytes:new Blob([bytes instanceof Uint8Array?bytes:new Uint8Array(bytes)],{type});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;a.style.display='none';document.body.appendChild(a);a.click();a.remove();
  window.setTimeout(()=>URL.revokeObjectURL(url),5000);
}
