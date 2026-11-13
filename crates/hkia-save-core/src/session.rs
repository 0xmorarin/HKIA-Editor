//! Sole state owner. Default and HKS1 remain read-only; explicit native private Writer. A Worker must own exactly one instance.
use crate::{Error,ReadSlot,read_slot_reuse,account::{self,AccountIndex,AccountAchievement,AccountCounter},archive::{self,ZipIndex},digest::sha256,native::{Model,CollectionEntry,CelebrationSpan,InventoryRow,DeprecatedEntry,CollectionVersion},projection::{DetailKind,DetailPage,detail_page},envelope::Version};
use std::ops::Range;
pub const PAGE_LIMIT:u16=128;
/// HKS1 is bound to this exact generated Native schema. Schema changes require a protocol revision.
pub const SCHEMA_SHA256:[u8;32]=[0xa6,0x4e,0xdc,0xf1,0xda,0x55,0x8a,0xb7,0x2d,0xab,0x63,0xd9,0xac,0x27,0xee,0x9e,0x55,0x58,0x12,0xaf,0x77,0x75,0x81,0x25,0x1a,0xb5,0xd4,0x32,0x3d,0x2c,0x1a,0x73];
#[derive(Debug,Clone,Copy,PartialEq,Eq)]pub enum InputKind{Zip,Slot,Account}
#[derive(Debug,Clone,Copy,PartialEq,Eq)]pub enum Domain{SlotAchievement,SlotCounter,CollectionHistory,Celebration,AccountAchievement,AccountCounter,Inventory,DeprecatedCollection}
#[derive(Debug,Clone,Copy,PartialEq,Eq)]pub struct Stamp{pub runtime:[u8;16],pub generation:u64,pub revision:u64,pub source:Option<[u8;32]>}
#[derive(Debug,Clone,Copy,PartialEq,Eq)]pub enum SessionError{Foreign,Replay,Stale,NoOpen,NoDomain,Range,Unsupported,Overflow,Input(Error),Protocol}
#[derive(Debug)]pub enum Command{Open{kind:InputKind,bytes:Vec<u8>},Close,Summary,IndexPage{domain:Domain,offset:u32,limit:u16},DetailPage{kind:DetailKind,parent:u32,offset:u32,limit:u16},Plan,Preview,Apply,Verify,Export,Undo,Redo,Reset}
#[derive(Debug)]pub struct Request{pub id:u64,pub expected:Stamp,pub command:Command}
#[derive(Debug,Clone,PartialEq)]pub enum Row{Slot(Model),Collection(CollectionEntry),Celebration(CelebrationSpan),AccountAchievement(AccountAchievement),AccountCounter(AccountCounter),Inventory(InventoryRow),Deprecated(DeprecatedEntry)}
#[derive(Debug,Clone,PartialEq)]pub struct Page{pub domain:Domain,pub total:u32,pub offset:u32,pub rows:Vec<Row>}
#[derive(Debug,Clone,PartialEq,Eq)]pub struct Summary{pub kind:InputKind,pub version:Option<Version>,pub source_bytes:u32,pub archive_entries:u32,pub documents:u32,pub logical_nodes:u32,pub counts:[u32;8],pub collection_deprecated:u32,pub collection_version:Option<CollectionVersion>,pub schema_sha256:[u8;32],pub writer_enabled:bool}
#[derive(Debug,Clone,PartialEq)]pub enum Payload{Opened(Summary),Closed,Summary(Summary),Page(Page),Detail(DetailPage)}
#[derive(Debug,Clone,PartialEq)]pub struct Reply{pub id:u64,pub stamp:Stamp,pub result:Result<Payload,SessionError>}
struct Source{kind:InputKind,original:Vec<u8>,zip:Option<ZipIndex>,slot_raw:Option<Vec<u8>>,slot:Option<ReadSlot>,account_raw:Option<Vec<u8>>,account:Option<AccountIndex>}
impl Source{
 fn open(kind:InputKind,bytes:Vec<u8>)->Result<Self,Error>{Self::open_reuse(kind,bytes,Vec::new())}
 fn open_reuse(kind:InputKind,bytes:Vec<u8>,scratch:Vec<u8>)->Result<Self,Error>{let (zip,slot_raw,account_raw)=match kind{InputKind::Zip=>{let z=ZipIndex::parse(&bytes)?;let (s,a)=z.targets(&bytes)?;(Some(z),s,a)},InputKind::Slot=>(None,None,None),InputKind::Account=>(None,None,None)};let slot=match kind{InputKind::Slot=>Some(read_slot_reuse(&bytes,scratch)?),_=>slot_raw.as_deref().map(|raw|read_slot_reuse(raw,scratch)).transpose()?};let account=match kind{InputKind::Account=>Some(account::read_account(&bytes)?),_=>account_raw.as_deref().map(account::read_account).transpose()?};Ok(Self{kind,original:bytes,zip,slot_raw,slot,account_raw,account})}
 // Only detached, fully validated slots can donate their buffer. No index survives.
 fn recycle_slot(&mut self)->Vec<u8>{let mut scratch=self.slot.take().map_or_else(Vec::new,|s|s.envelope.decoded);scratch.clear();scratch}
 fn counts(&self)->[u32;8]{let mut c=[0;8];if let Some(s)=&self.slot{let i=&s.index;c[..4].copy_from_slice(&[i.achievements.len()as u32,i.counters.len()as u32,i.collections.len()as u32,i.celebrations.len()as u32]);c[6]=i.inventory.len()as u32;c[7]=i.deprecated.len()as u32;}if let Some(a)=&self.account{c[4]=a.achievements.len()as u32;c[5]=a.counters.len()as u32;}c}
 fn summary(&self)->Summary{Summary{kind:self.kind,version:self.slot.as_ref().map(|s|s.envelope.version),source_bytes:self.original.len()as u32,archive_entries:self.zip.as_ref().map_or(0,|z|z.entries.len()as u32),documents:self.slot.as_ref().map_or(0,|s|s.index.documents as u32),logical_nodes:self.slot.as_ref().map_or(0,|s|s.index.logical_nodes as u32),counts:self.counts(),collection_deprecated:self.slot.as_ref().map_or(0,|s|s.index.deprecated_count as u32),collection_version:self.slot.as_ref().and_then(|s|s.index.collection_version.clone()),schema_sha256:SCHEMA_SHA256,writer_enabled:false}}
 fn page(&self,d:Domain,offset:u32,limit:u16)->Result<Page,SessionError>{if limit==0||limit>PAGE_LIMIT{return Err(SessionError::Range)}let a=offset as usize;let l=limit as usize;fn slice<T>(s:&[T],a:usize,l:usize)->Result<&[T],SessionError>{if a>s.len(){return Err(SessionError::Range)}Ok(&s[a..s.len().min(a.saturating_add(l))])}let (total,rows):(usize,Vec<Row>)=match d{Domain::SlotAchievement|Domain::SlotCounter|Domain::CollectionHistory|Domain::Celebration|Domain::Inventory|Domain::DeprecatedCollection=>{let i=&self.slot.as_ref().ok_or(SessionError::NoDomain)?.index;match d{Domain::SlotAchievement=>{let s=&i.achievements;(s.len(),slice(s,a,l)?.iter().cloned().map(Row::Slot).collect())},Domain::SlotCounter=>{let s=&i.counters;(s.len(),slice(s,a,l)?.iter().cloned().map(Row::Slot).collect())},Domain::CollectionHistory=>{let s=&i.collections;(s.len(),slice(s,a,l)?.iter().cloned().map(Row::Collection).collect())},Domain::Inventory=>{let s=&i.inventory;(s.len(),slice(s,a,l)?.iter().cloned().map(Row::Inventory).collect())},Domain::DeprecatedCollection=>{let s=&i.deprecated;(s.len(),slice(s,a,l)?.iter().cloned().map(Row::Deprecated).collect())},_=>{let s=&i.celebrations;(s.len(),slice(s,a,l)?.iter().cloned().map(Row::Celebration).collect())}}},Domain::AccountAchievement|Domain::AccountCounter=>{let i=self.account.as_ref().ok_or(SessionError::NoDomain)?;if d==Domain::AccountAchievement{let s=&i.achievements;(s.len(),slice(s,a,l)?.iter().cloned().map(Row::AccountAchievement).collect())}else{let s=&i.counters;(s.len(),slice(s,a,l)?.iter().cloned().map(Row::AccountCounter).collect())}}};Ok(Page{domain:d,total:total as u32,offset,rows})}
}
/// Worker lifetime identity MUST be unique; caller supplies a nonzero cryptographic nonce. No second state owner.
pub struct ProductSession{stamp:Stamp,last_id:u64,state:Option<Source>,writer:Option<WriterState>}
impl ProductSession{
 pub fn new(runtime:[u8;16])->Result<Self,SessionError>{if runtime==[0;16]{return Err(SessionError::Protocol)}Ok(Self{stamp:Stamp{runtime,generation:0,revision:0,source:None},last_id:0,state:None,writer:None})}
 pub fn stamp(&self)->Stamp{self.stamp}
 pub fn dispatch(&mut self,r:Request)->Reply{let id=r.id;let result=self.execute(r);Reply{id,stamp:self.stamp,result}}
 fn execute(&mut self,r:Request)->Result<Payload,SessionError>{if r.expected.runtime!=self.stamp.runtime{return Err(SessionError::Foreign)}if r.id==0||r.id<=self.last_id{return Err(SessionError::Replay)}self.last_id=r.id;if r.expected!=self.stamp{return Err(SessionError::Stale)}match r.command{Command::Open{kind,bytes}=>{let generation=self.stamp.generation.checked_add(1).ok_or(SessionError::Overflow)?;let max=match kind{InputKind::Zip=>archive::MAX_ARCHIVE,InputKind::Slot=>crate::MAX_INPUT,InputKind::Account=>account::MAX_ACCOUNT};if bytes.len()>max{return Err(SessionError::Input(Error::Budget))}let hash=sha256(&bytes);if let Some(w)=&mut self.writer{w.scratch=Vec::new()}let source=Source::open(kind,bytes).map_err(SessionError::Input)?;let result=source.summary();self.state=Some(source);if let Some(w)=&mut self.writer{*w=WriterState::default()}self.stamp.generation=generation;self.stamp.revision=0;self.stamp.source=Some(hash);Ok(Payload::Opened(result))},Command::Close=>{if self.state.is_none(){return Err(SessionError::NoOpen)}let generation=self.stamp.generation.checked_add(1).ok_or(SessionError::Overflow)?;self.state=None;if let Some(w)=&mut self.writer{*w=WriterState::default()}self.stamp.generation=generation;self.stamp.revision=0;self.stamp.source=None;Ok(Payload::Closed)},Command::Summary=>Ok(Payload::Summary(self.state.as_ref().ok_or(SessionError::NoOpen)?.summary())),Command::IndexPage{domain,offset,limit}=>Ok(Payload::Page(self.state.as_ref().ok_or(SessionError::NoOpen)?.page(domain,offset,limit)?)),Command::DetailPage{kind,parent,offset,limit}=>Ok(Payload::Detail(detail_page(self.state.as_ref().ok_or(SessionError::NoOpen)?.slot.as_ref().ok_or(SessionError::NoDomain)?,kind,parent,offset,limit)?)),_=>Err(SessionError::Unsupported)}}
 /// Writer prerequisite: immutable original and exact source-relative token ranges; not exposed by ABI.
 pub(crate) fn source_for_writer(&self,expected:Stamp)->Result<WriterInput<'_>,SessionError>{if expected!=self.stamp{return Err(SessionError::Stale)}let s=self.state.as_ref().ok_or(SessionError::NoOpen)?;Ok(WriterInput{original:&s.original,zip:s.zip.as_ref(),slot_raw:if s.kind==InputKind::Slot{Some(&s.original)}else{s.slot_raw.as_deref()},slot:s.slot.as_ref(),account_raw:if s.kind==InputKind::Account{Some(&s.original)}else{s.account_raw.as_deref()},account:s.account.as_ref()})}
}
#[allow(dead_code)]pub(crate) struct WriterInput<'a>{pub original:&'a[u8],pub zip:Option<&'a ZipIndex>,pub slot_raw:Option<&'a[u8]>,pub slot:Option<&'a ReadSlot>,pub account_raw:Option<&'a[u8]>,pub account:Option<&'a AccountIndex>}
/// Raw span is never returned as bytes. Its coordinate space is determined by the domain.
pub fn span_bounds(r:&Range<usize>)->(u32,u32){(r.start as u32,r.end as u32)}

/// Existing-field CAS witnesses for future Writer. No capability grant or mutation is implied.
#[allow(dead_code)]
#[derive(Debug,Clone,Copy)]pub(crate) enum ExistingField{CollectionTicks{id:i32,old:i64},SlotAchievementProgress{id:u32,guid:[u32;4],old_bits:u32},AccountAchievementProgress{guid:[u8;16],old_bits:u64}}
#[allow(dead_code)]
#[derive(Debug,Clone,PartialEq,Eq)]pub(crate) struct FieldWitness{pub stamp:Stamp,pub schema:[u8;32],pub version:Option<Version>,pub raw_span:Range<usize>,pub raw_sha256:[u8;32]}
impl ProductSession{
 #[allow(dead_code)]pub(crate) fn witness(&self,expected:Stamp,target:ExistingField)->Result<FieldWitness,SessionError>{let s=self.source_for_writer(expected)?;let version=s.slot.map(|s|s.envelope.version);let (bytes,span)=match target{ExistingField::CollectionTicks{id,old}=>{let s=s.slot.ok_or(SessionError::NoDomain)?;let r=s.index.collections.iter().find(|r|r.id==id).ok_or(SessionError::NoDomain)?;if r.ticks!=old{return Err(SessionError::Stale)}(s.envelope.decoded.as_slice(),r.value.clone())},ExistingField::SlotAchievementProgress{id,guid,old_bits}=>{let s=s.slot.ok_or(SessionError::NoDomain)?;let r=s.index.achievements.iter().find(|r|r.id==id&&r.guid==guid).ok_or(SessionError::NoDomain)?;if !matches!(&r.state,crate::native::ModelState::Achievement{current,..}if current.to_bits()==old_bits){return Err(SessionError::Stale)}(s.envelope.decoded.as_slice(),r.fields[1].bytes.clone())},ExistingField::AccountAchievementProgress{guid,old_bits}=>{let a=s.account.ok_or(SessionError::NoDomain)?;let r=a.achievements.iter().find(|r|r.guid==guid).ok_or(SessionError::NoDomain)?;if r.current.to_bits()!=old_bits{return Err(SessionError::Stale)}(s.account_raw.ok_or(SessionError::NoDomain)?,r.fields[1].clone())}};let token=bytes.get(span.clone()).ok_or(SessionError::Input(Error::Schema))?;Ok(FieldWitness{stamp:expected,schema:SCHEMA_SHA256,version,raw_span:span,raw_sha256:sha256(token)})}
}
#[cfg(test)]mod tests{use super::*;#[test]fn writer_witness_exact_old_and_original(){let raw=include_bytes!("../tests/fixtures/exact-ticks-multiblock.bin");let mut s=ProductSession::new([1;16]).unwrap();let expected=s.stamp();let r=s.dispatch(Request{id:1,expected,command:Command::Open{kind:InputKind::Slot,bytes:raw.to_vec()}});assert!(r.result.is_ok());let st=s.stamp();let w=s.witness(st,ExistingField::CollectionTicks{id:1,old:i64::MIN}).unwrap();let v=s.source_for_writer(st).unwrap();assert_eq!(v.original,raw);assert_eq!(sha256(&v.slot.unwrap().envelope.decoded[w.raw_span.clone()]),w.raw_sha256);assert_eq!(s.witness(st,ExistingField::CollectionTicks{id:1,old:0}),Err(SessionError::Stale));assert_eq!(s.witness(expected,ExistingField::CollectionTicks{id:1,old:i64::MIN}),Err(SessionError::Stale));}}

// Private development Writer uses the same ProductSession, request high-water and source stamp.
// Existing HKS1 commands and default Session remain read-only. A future WASM ABI is a separate gate.
use crate::writer::{self,Edit,PlanInfo,Proof,Prepared};
#[derive(Debug)]pub enum WriterCommand{Plan{edits:Vec<Edit>},Preview{plan:u64},Apply{plan:u64},Verify,Export,Backup,Undo,Redo,Reset}
#[derive(Debug)]pub struct WriterRequest{pub id:u64,pub expected:Stamp,pub command:WriterCommand}
#[derive(Debug,Clone,PartialEq,Eq)]pub enum WriterPayload{Plan(PlanInfo),Preview{plan:PlanInfo,proof:Proof},Applied(Proof),Verified(Proof),Exported{digest:[u8;32],bytes:u32},Backup{digest:[u8;32],bytes:u32},Restored{digest:[u8;32],edited:bool}}
#[derive(Debug)]pub struct WriterReply{pub id:u64,pub stamp:Stamp,pub result:Result<WriterPayload,SessionError>,pub output:Option<Vec<u8>>}
struct Snapshot{raw:Vec<u8>,proof:Option<Proof>}
#[derive(Default)]struct WriterState{baseline:Option<Vec<u8>>,undo:Option<Snapshot>,redo:Option<Snapshot>,proof:Option<Proof>,pending:Option<Prepared>,verified:bool,
 // At most one empty decoded buffer, only within this source generation.
 scratch:Vec<u8>}
impl ProductSession{
 /// Explicit native private-development entry point. Does not change any existing ABI or public capability flag.
 pub fn new_private_writer(runtime:[u8;16])->Result<Self,SessionError>{let mut s=Self::new(runtime)?;s.writer=Some(WriterState::default());Ok(s)}
 pub fn dispatch_writer(&mut self,r:WriterRequest)->WriterReply{let id=r.id;let result=self.writer_execute(r);let (result,output)=match result{Ok((p,o))=>(Ok(p),o),Err(e)=>(Err(e),None)};WriterReply{id,stamp:self.stamp,result,output}}
 fn writer_execute(&mut self,r:WriterRequest)->Result<(WriterPayload,Option<Vec<u8>>),SessionError>{
  if r.expected.runtime!=self.stamp.runtime{return Err(SessionError::Foreign)}if r.id==0||r.id<=self.last_id{return Err(SessionError::Replay)}self.last_id=r.id;if r.expected!=self.stamp{return Err(SessionError::Stale)}if self.writer.is_none(){return Err(SessionError::Unsupported)}let state=self.state.as_ref().ok_or(SessionError::NoOpen)?;if state.kind!=InputKind::Zip||state.slot.is_none()||state.account.is_none(){return Err(SessionError::NoDomain)}
  let payload=match r.command{
   WriterCommand::Plan{edits}=>{let x=self.source_for_writer(r.expected)?;let p=writer::prepare(r.id,x.original,x.slot.ok_or(SessionError::NoDomain)?,x.account_raw.ok_or(SessionError::NoDomain)?,&edits).map_err(SessionError::Input)?;let info=p.info.clone();self.writer.as_mut().unwrap().pending=Some(p);WriterPayload::Plan(info)},
   WriterCommand::Preview{plan}=>{let w=self.writer.as_mut().unwrap();let p=w.pending.as_ref().filter(|p|p.info.id==plan).ok_or(SessionError::Stale)?;let scratch=std::mem::take(&mut w.scratch);let (_,proof,scratch)=writer::build(&state.original,state.zip.as_ref().ok_or(SessionError::NoDomain)?,state.slot_raw.as_deref().ok_or(SessionError::NoDomain)?,state.slot.as_ref().ok_or(SessionError::NoDomain)?,state.account_raw.as_deref().ok_or(SessionError::NoDomain)?,p,scratch).map_err(SessionError::Input)?;let plan=p.info.clone();w.scratch=scratch;WriterPayload::Preview{plan,proof}},
   WriterCommand::Apply{plan}=>{let revision=self.stamp.revision.checked_add(1).ok_or(SessionError::Overflow)?;let w=self.writer.as_mut().unwrap();let p=w.pending.as_ref().filter(|p|p.info.id==plan).ok_or(SessionError::Stale)?;let scratch=std::mem::take(&mut w.scratch);let (raw,proof,scratch)=writer::build(&state.original,state.zip.as_ref().ok_or(SessionError::NoDomain)?,state.slot_raw.as_deref().ok_or(SessionError::NoDomain)?,state.slot.as_ref().ok_or(SessionError::NoDomain)?,state.account_raw.as_deref().ok_or(SessionError::NoDomain)?,p,scratch).map_err(SessionError::Input)?;let candidate=Source::open_reuse(InputKind::Zip,raw,scratch).map_err(SessionError::Input)?;if sha256(&candidate.original)!=proof.digest{return Err(SessionError::Input(Error::Schema))}
    // Commit boundary: all fallible validation precedes this point. One-step undo/redo, immutable baseline.
    let mut old=self.state.replace(candidate).unwrap();w.scratch=old.recycle_slot();if w.baseline.is_none(){w.baseline=Some(old.original.clone())}w.undo=Some(Snapshot{raw:old.original,proof:w.proof.take()});w.redo=None;w.proof=Some(proof.clone());w.pending=None;w.verified=false;self.stamp.revision=revision;WriterPayload::Applied(proof)},
   WriterCommand::Verify=>{let w=self.writer.as_mut().unwrap();let proof=w.proof.as_ref().ok_or(SessionError::Unsupported)?;if sha256(&state.original)!=proof.digest{return Err(SessionError::Input(Error::Schema))}let scratch=std::mem::take(&mut w.scratch);let mut reopened=Source::open_reuse(InputKind::Zip,state.original.clone(),scratch).map_err(SessionError::Input)?;if sha256(&reopened.original)!=proof.digest{return Err(SessionError::Input(Error::Schema))}w.scratch=reopened.recycle_slot();w.verified=true;WriterPayload::Verified(proof.clone())},
   WriterCommand::Export=>{let w=self.writer.as_mut().unwrap();let p=w.proof.as_ref().filter(|_|w.verified).ok_or(SessionError::Unsupported)?;if sha256(&state.original)!=p.digest{return Err(SessionError::Input(Error::Schema))}let raw=state.original.clone();let info=WriterPayload::Exported{digest:p.digest,bytes:p.bytes};w.verified=false;return Ok((info,Some(raw)))},
   WriterCommand::Backup=>{let raw=self.writer.as_ref().unwrap().baseline.as_ref().unwrap_or(&state.original);let digest=sha256(raw);if Some(digest)!=self.stamp.source{return Err(SessionError::Input(Error::Schema))}return Ok((WriterPayload::Backup{digest,bytes:raw.len()as u32},Some(raw.clone())))},
   WriterCommand::Undo=>return self.restore_writer(0),WriterCommand::Redo=>return self.restore_writer(1),WriterCommand::Reset=>return self.restore_writer(2),
  };Ok((payload,None))
 }
 fn restore_writer(&mut self,mode:u8)->Result<(WriterPayload,Option<Vec<u8>>),SessionError>{let revision=self.stamp.revision.checked_add(1).ok_or(SessionError::Overflow)?;let w=self.writer.as_ref().ok_or(SessionError::Unsupported)?;let (bytes,proof)=match mode{0=>{let s=w.undo.as_ref().ok_or(SessionError::Unsupported)?;(&s.raw,s.proof.clone())},1=>{let s=w.redo.as_ref().ok_or(SessionError::Unsupported)?;(&s.raw,s.proof.clone())},2=>(w.baseline.as_ref().ok_or(SessionError::Unsupported)?,None),_=>return Err(SessionError::Protocol)};let hash=sha256(bytes);if self.state.as_ref().is_some_and(|s|sha256(&s.original)==hash){return Err(SessionError::Unsupported)}if match &proof{Some(p)=>p.digest!=hash,None=>Some(hash)!=self.stamp.source}{return Err(SessionError::Input(Error::Schema))}let raw=bytes.clone();let w=self.writer.as_mut().unwrap();let scratch=std::mem::take(&mut w.scratch);let candidate=Source::open_reuse(InputKind::Zip,raw,scratch).map_err(SessionError::Input)?;let mut old=self.state.replace(candidate).ok_or(SessionError::NoOpen)?;w.scratch=old.recycle_slot();let prev=Snapshot{raw:old.original,proof:w.proof.take()};match mode{0=>{w.undo=None;w.redo=Some(prev)},1=>{w.redo=None;w.undo=Some(prev)},2=>{w.undo=Some(prev);w.redo=None},_=>unreachable!()}w.proof=proof;w.pending=None;w.verified=false;self.stamp.revision=revision;Ok((WriterPayload::Restored{digest:hash,edited:w.proof.is_some()},None))}
}

#[cfg(test)]
mod r61_scratch_tests {
    use super::*;
    const A:&[u8]=include_bytes!("../tests/fixtures/writer-3.0.0-good.zip");
    const B:&[u8]=include_bytes!("../tests/fixtures/writer-3.0.1-good.zip");
    fn open(s:&mut ProductSession,id:u64,raw:&[u8])->Reply{let expected=s.stamp();s.dispatch(Request{id,expected,command:Command::Open{kind:InputKind::Zip,bytes:raw.to_vec()}})}
    fn call(s:&mut ProductSession,id:u64,command:WriterCommand)->WriterReply{let expected=s.stamp();s.dispatch_writer(WriterRequest{id,expected,command})}
    fn good(s:&mut ProductSession,id:u64,command:WriterCommand)->WriterPayload{let r=call(s,id,command);assert!(r.output.is_none());r.result.unwrap()}
    fn active(s:&ProductSession)->*const u8{s.state.as_ref().unwrap().slot.as_ref().unwrap().envelope.decoded.as_ptr()}
    fn scratch(s:&ProductSession)->*const u8{let v=&s.writer.as_ref().unwrap().scratch;assert!(v.is_empty());assert!(v.capacity()<=crate::MAX_DECODED);v.as_ptr()}
    fn edit(old:i64,next:i64)->WriterCommand{WriterCommand::Plan{edits:vec![Edit::History{item:2,old,next}]}}
    #[test]
    fn two_buffers_reused_across_reparse_and_repeated_transactions() {
        for raw in [A,B] {
            let mut s=ProductSession::new_private_writer([7;16]).unwrap();
            assert!(open(&mut s,1,raw).result.is_ok());let original=active(&s);
            good(&mut s,2,edit(638000000000000001,638000000010000001));
            let preview=good(&mut s,3,WriterCommand::Preview{plan:2});let work=scratch(&s);assert_ne!(original,work);assert_eq!(active(&s),original);
            let applied=good(&mut s,4,WriterCommand::Apply{plan:2});
            assert!(matches!((preview,applied),(WriterPayload::Preview{proof:a,..},WriterPayload::Applied(b)) if a==b));
            assert_eq!(active(&s),work);assert_eq!(scratch(&s),original);
            good(&mut s,5,WriterCommand::Verify);good(&mut s,6,WriterCommand::Verify);assert_eq!(scratch(&s),original);
            let first=call(&mut s,7,WriterCommand::Export).output.unwrap();assert_ne!(first,raw);
            good(&mut s,8,edit(638000000010000001,638000000020000001));good(&mut s,9,WriterCommand::Preview{plan:8});assert_eq!(scratch(&s),original);
            good(&mut s,10,WriterCommand::Apply{plan:8});assert_eq!(active(&s),original);assert_eq!(scratch(&s),work);
            good(&mut s,11,WriterCommand::Verify);let second=call(&mut s,12,WriterCommand::Export).output.unwrap();assert_ne!(second,first);
            good(&mut s,13,WriterCommand::Undo);assert_eq!(active(&s),work);good(&mut s,14,WriterCommand::Verify);assert_eq!(call(&mut s,15,WriterCommand::Export).output.unwrap(),first);
            good(&mut s,16,WriterCommand::Redo);assert_eq!(active(&s),original);good(&mut s,17,WriterCommand::Verify);assert_eq!(call(&mut s,18,WriterCommand::Export).output.unwrap(),second);
            good(&mut s,19,WriterCommand::Reset);assert_eq!(active(&s),work);assert_eq!(call(&mut s,20,WriterCommand::Backup).output.unwrap(),raw);
            let expected=s.stamp();assert!(s.dispatch(Request{id:21,expected,command:Command::Close}).result.is_ok());assert_eq!(s.writer.as_ref().unwrap().scratch.capacity(),0);
        }
    }
    #[test]
    fn scratch_dropped_on_new_source_even_if_open_fails_without_state_change() {
        let mut s=ProductSession::new_private_writer([7;16]).unwrap();assert!(open(&mut s,1,A).result.is_ok());
        good(&mut s,2,edit(638000000000000001,638000000010000001));good(&mut s,3,WriterCommand::Preview{plan:2});assert!(s.writer.as_ref().unwrap().scratch.capacity()>0);
        let old=s.stamp();let ptr=active(&s);assert!(open(&mut s,4,b"bad").result.is_err());assert_eq!(s.stamp(),old);assert_eq!(active(&s),ptr);assert_eq!(s.writer.as_ref().unwrap().scratch.capacity(),0);
        good(&mut s,5,WriterCommand::Apply{plan:2});good(&mut s,6,WriterCommand::Verify);assert!(s.writer.as_ref().unwrap().scratch.capacity()>0);
        assert!(open(&mut s,7,B).result.is_ok());assert_eq!(s.writer.as_ref().unwrap().scratch.capacity(),0);assert_eq!(call(&mut s,8,WriterCommand::Backup).output.unwrap(),B);assert_eq!(s.dispatch_writer(WriterRequest{id:9,expected:old,command:WriterCommand::Verify}).result,Err(SessionError::Stale));
    }
}
