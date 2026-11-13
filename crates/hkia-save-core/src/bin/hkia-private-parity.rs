//! Local-only process bridge for parity tests. Do not run with real saves in CI.
//! stdin raw slot; stdout private comparison records plus decompressed bytes.
use hkia_save_core::{read_slot,native::ModelState,MAX_INPUT};
use std::io::{self,Read,Write};
fn guid(w:[u32;4])->String{format!("{:08x}:{:08x}:{:08x}:{:08x}",w[0],w[1],w[2],w[3])}
fn run()->Result<(),Box<dyn std::error::Error>>{
 if std::env::args().nth(1).as_deref()!=Some("--private-parity"){return Err("private parity invocation required".into())}
 let mut raw=Vec::new();io::stdin().take((MAX_INPUT+1) as u64).read_to_end(&mut raw)?;
 let s=read_slot(&raw).map_err(|e|format!("slot read failed: {e:?}"))?;
 let stdout=io::stdout();let mut out=io::BufWriter::new(stdout.lock());let i=&s.index;let e=&s.envelope;
 writeln!(out,"V|{}|{}|{}|{}",e.version.as_str(),e.marker,e.blocks.len(),e.decoded.len())?;
 writeln!(out,"D|{}|{}|{}|{}|{}|{}",i.documents,i.achievements.len(),i.counters.len(),i.collections.len(),i.deprecated_count,i.dictionary_entries)?;
 for b in &e.blocks{writeln!(out,"B|{}|{}|{}|{}",b.compressed.start,b.compressed.end,b.decoded.start,b.decoded.end)?;}
 for m in i.achievements.iter().chain(i.counters.iter()){
  match &m.state{
   ModelState::Achievement{complete,current,completed}=>{let date=completed.map(|(s,n)|format!("{s}:{n}")).unwrap_or_else(||"null".into());write!(out,"A|{}|{}|{}|{:08x}|{}",m.id,guid(m.guid),*complete as u8,current.to_bits(),date)?;},
   ModelState::Counter{current,counted_values,counted_guids}=>{let v=counted_values.map(|n|n.to_string()).unwrap_or_else(||"null".into());write!(out,"C|{}|{}|{:08x}|{}|{}",m.id,guid(m.guid),current.to_bits(),v,counted_guids)?;}
  }
  for f in &m.fields{write!(out,"|{}:{}",f.bytes.start,f.bytes.end)?;}writeln!(out)?;
 }
 for c in &i.collections{writeln!(out,"K|{}|{}|{}:{}|{}:{}",c.id,c.ticks,c.value.start,c.value.end,c.pair.start,c.pair.end)?;}
 for c in &i.celebrations{writeln!(out,"T|{}|{}|{}",c.id,c.bytes.start,c.bytes.end)?;}
 writeln!(out,"PAYLOAD")?;out.write_all(&e.decoded)?;out.flush()?;Ok(())
}
fn main(){if let Err(e)=run(){eprintln!("{e}");std::process::exit(1)}}
