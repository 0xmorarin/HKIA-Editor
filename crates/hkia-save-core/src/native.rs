//! Schema-directed, bounded Native DbRoot walk. Never serializes game objects.
use crate::{Error,MAX_DECODED,envelope::Version,schema::{self,Spec,Shape},wire::{Cursor,Token}};
use std::{collections::HashSet,ops::Range};
const MAX_NODES:usize=2_000_000;
const MAX_DEPTH:usize=80;
const DOC:&str="Sunblink.UserData.IDocument";
const ROOT:&str="MessagePackCollectionProvider.DbRoot";
const TRAIT:&str="Sunblink.UserData.TraitModel";
const SHOP:&str="ShopManagerTraitModel.ShopItemKey";
const CELEBRATION:&str="Sunblink.UserData.CelebratedItemList";
#[derive(Debug,Clone,PartialEq)]
pub struct FieldSpan {pub bytes:Range<usize>}
#[derive(Debug,Clone,PartialEq)]
pub struct Model {pub id:u32,pub guid:[u32;4],pub fields:[FieldSpan;3],pub state:ModelState}
#[derive(Debug,Clone,PartialEq)]
pub enum ModelState { Achievement {complete:bool,current:f32,completed:Option<(i64,u32)>}, Counter {current:f32,counted_values:Option<usize>,counted_guids:usize} }
#[derive(Debug,Clone,PartialEq)]
pub struct CollectionEntry {pub id:i32,pub ticks:i64,pub value:Range<usize>,pub pair:Range<usize>}
#[derive(Debug,Clone,PartialEq,Eq)]
pub struct CelebrationSpan {pub id:u32,pub bytes:Range<usize>,pub guid_count:usize}
#[derive(Debug,Clone,PartialEq,Eq)]
pub struct DeprecatedEntry {pub guid:[u32;4],pub ticks:i64,pub value:Range<usize>,pub pair:Range<usize>}
#[derive(Debug,Clone,PartialEq,Eq)]
pub struct InventoryRow {pub id:u32,pub item_id:Option<i32>,pub unique_id:Option<i32>,pub quantity:Option<i32>,pub fields:[Option<Range<usize>>;4],pub unique_is_nil:Option<bool>}
#[derive(Debug,Clone,PartialEq,Eq)]
pub struct CollectionVersion {pub id:u32,pub number:i32,pub span:Range<usize>}
#[derive(Debug,Default)]
pub struct NativeIndex {pub documents:usize,pub logical_nodes:usize,pub achievements:Vec<Model>,pub counters:Vec<Model>,pub collections:Vec<CollectionEntry>,pub deprecated_count:usize,pub dictionary_entries:usize,pub collection_map:Option<Range<usize>>,pub celebrations:Vec<CelebrationSpan>,pub inventory:Vec<InventoryRow>,pub deprecated:Vec<DeprecatedEntry>,pub deprecated_map:Option<Range<usize>>,pub collection_version:Option<CollectionVersion>}
#[derive(Clone,Debug,PartialEq,Eq,Hash)]
enum Key<'a>{Int(i128),Str(&'a str),Guid([u32;4]),Shop([u32;4],[u32;4],i128)}
#[derive(Clone,Debug)]
enum Value<'a>{Other,Nil,Bool(bool),Float(f32),Time(i64,u32),Int(i128),Str(&'a str),Guid([u32;4]),Count(usize),Fields(Vec<(Value<'a>,Range<usize>)>),Key(Key<'a>)}
impl<'a> Value<'a>{
 fn int(&self)->Result<i128,Error>{if let Self::Int(v)=self{Ok(*v)}else{Err(Error::Schema)}}
 fn guid(&self)->Result<[u32;4],Error>{if let Self::Guid(v)=self{Ok(*v)}else{Err(Error::Schema)}}
 fn key(self)->Result<Key<'a>,Error>{match self{Self::Int(v)=>Ok(Key::Int(v)),Self::Str(v)=>Ok(Key::Str(v)),Self::Guid(v)=>Ok(Key::Guid(v)),Self::Key(v)=>Ok(v),_=>Err(Error::Schema)}}
 fn fields(self)->Result<Vec<(Self,Range<usize>)>,Error>{if let Self::Fields(v)=self{Ok(v)}else{Err(Error::Schema)}}
}
struct Walk<'a>{c:Cursor<'a>,index:NativeIndex,version:Version,version_seen:bool,collection_seen:bool,ids:HashSet<(i32,u32)>,guids:HashSet<(i32,[u32;4])>}
impl<'a> Walk<'a>{
 fn budget(&mut self,depth:usize)->Result<(),Error>{self.index.logical_nodes+=1;if depth>MAX_DEPTH||self.index.logical_nodes>MAX_NODES{Err(Error::Budget)}else{Ok(())}}
 fn primitive(&mut self,s:&str,depth:usize)->Result<Value<'a>,Error>{
  let lim=match s{"int"=>Some((i32::MIN as i128,i32::MAX as i128)),"uint"=>Some((0,u32::MAX as i128)),"long"=>Some((i64::MIN as i128,i64::MAX as i128)),"ulong"=>Some((0,u64::MAX as i128)),"short"=>Some((i16::MIN as i128,i16::MAX as i128)),"ushort"=>Some((0,u16::MAX as i128)),"byte"=>Some((0,255)),"sbyte"=>Some((-128,127)),_=>None};
  if let Some((lo,hi))=lim{return Ok(Value::Int(self.c.int(lo,hi)?))}
  match s{
   "Hash128"|"SaveGameGuid"=>{let mut w=[0;4];for v in &mut w{*v=self.c.int(0,u32::MAX as i128)? as u32;}Ok(Value::Guid(w))},
   "string"|"FixedString128Bytes"=>match self.c.token()?{Token::Str(v)=>Ok(Value::Str(v)),Token::Nil if s=="string"=>Ok(Value::Nil),_=>Err(Error::Schema)},
   "byte[]"=>match self.c.token()?{Token::Nil=>Ok(Value::Nil),Token::Bin(_)=>Ok(Value::Other),_=>Err(Error::Schema)},
   "float"=>match self.c.token()?{Token::F32(v) if v.is_finite()=>Ok(Value::Float(v)),_=>Err(Error::Schema)},
   "bool"=>match self.c.token()?{Token::Bool(v)=>Ok(Value::Bool(v)),_=>Err(Error::Schema)},
   "DateTime"=>{if !matches!(self.c.peek()?,0xd6|0xd7|0xc7){return Err(Error::Schema)}let (sec,nano)=self.c.timestamp()?;if nano%100!=0||!(-8640000000000..=8640000000000).contains(&sec){return Err(Error::Schema)}Ok(Value::Time(sec,nano))},
   "Vector3"|"Quaternion"|"Color"=>{let n=if s=="Vector3"{3}else{4};if self.c.array()?!=n{return Err(Error::Schema)}for _ in 0..n{self.budget(depth+1)?;self.primitive("float",depth+1)?;}Ok(Value::Other)},
   _=>Err(Error::Schema)
  }
 }
 fn read(&mut self,s:Spec,depth:usize,ctx:Option<(&'static str,i32)>,collection:bool)->Result<Value<'a>,Error>{
  self.budget(depth)?;
  match s{
   Spec::Primitive(s)=>self.primitive(s,depth),
   Spec::Nullable(inner)=>{if self.c.peek()?==0xc0{self.c.token()?;Ok(Value::Nil)}else{self.read(*inner,depth+1,ctx,collection)}},
   Spec::Seq(inner)=>{if self.c.peek()?==0xc0{self.c.token()?;return Ok(Value::Nil)}let n=self.c.array()?;for _ in 0..n{self.read(*inner,depth+1,None,false)?;}Ok(Value::Count(n))},
   Spec::Dict(k,v)=>{
    if self.c.peek()?==0xc0{self.c.token()?;return Ok(Value::Nil)}let start=self.c.pos;let n=self.c.map()?;self.index.dictionary_entries=self.index.dictionary_entries.checked_add(n).ok_or(Error::Overflow)?;
    let deprecated=ctx==Some(("collection-key0",0));let mut seen=HashSet::new();for _ in 0..n{let p=self.c.pos;let key=self.read(*k,depth+1,None,false)?.key()?;if !seen.insert(key.clone()){return Err(Error::Duplicate)}let at=self.c.pos;let value=self.read(*v,depth+1,None,false)?;
     if collection{let id=match key{Key::Int(i)=>i32::try_from(i).map_err(|_|Error::Schema)?,_=>return Err(Error::Schema)};let ticks=i64::try_from(value.int()?).map_err(|_|Error::Schema)?;self.index.collections.push(CollectionEntry{id,ticks,value:at..self.c.pos,pair:p..self.c.pos});}
     else if deprecated{let guid=match key{Key::Guid(g)=>g,_=>return Err(Error::Schema)};let ticks=i64::try_from(value.int()?).map_err(|_|Error::Schema)?;self.index.deprecated.push(DeprecatedEntry{guid,ticks,value:at..self.c.pos,pair:p..self.c.pos});}
    }
    if collection{if self.index.collection_map.replace(start..self.c.pos).is_some(){return Err(Error::Duplicate)}}if deprecated{if self.index.deprecated_map.replace(start..self.c.pos).is_some(){return Err(Error::Duplicate)}}Ok(Value::Count(n))
   },
   Spec::Type(name)=>{
    let shape=schema::shape(name).ok_or(Error::Schema)?;
    if let Shape::Enum(inner)=shape{return self.read(inner,depth+1,ctx,collection)}
    if self.c.peek()?==0xc0{if name==DOC||name==ROOT{return Err(Error::Schema)}self.c.token()?;return Ok(Value::Nil)}
    match shape{
     Shape::Enum(_)=>unreachable!(),
     Shape::Union(branches)=>{let union_start=self.c.pos;if self.c.array()?!=2{return Err(Error::Schema)}self.budget(depth+1)?;let tag=self.c.int(i32::MIN as i128,i32::MAX as i128)? as i32;let branch=branches.iter().find(|(t,_)|*t==tag).ok_or(Error::Schema)?.1;
      let value=self.read(branch,depth+1,Some((name,tag)),false)?;
      if name==DOC{let a=value.fields()?;let id=u32::try_from(a.first().ok_or(Error::Schema)?.0.int()?).map_err(|_|Error::Schema)?;
       // V33 requires a two-field Celebration document with a non-null Hash128 list.
       // Record the full union token range, not a reconstructed value or a deduplicated list.
       if tag==1{let int=|k:usize|->Result<Option<i32>,Error>{a.get(k).map(|v|i32::try_from(v.0.int()?).map_err(|_|Error::Schema)).transpose()};let fields=std::array::from_fn(|i|a.get(i+1).map(|v|v.1.clone()));let unique_is_nil=a.get(4).map(|v|matches!(&v.0,Value::Nil));self.index.inventory.push(InventoryRow{id,item_id:int(1)?,unique_id:int(2)?,quantity:int(3)?,fields,unique_is_nil});}
       if tag==8{if a.len()!=2{return Err(Error::Schema)}let guid_count=match &a[1].0{Value::Count(n)=>*n,_=>return Err(Error::Schema)};self.index.celebrations.push(CelebrationSpan{id,bytes:union_start..self.c.pos,guid_count});}
       if !self.ids.insert((tag,id)){return Err(Error::Duplicate)}self.index.documents+=1;}
      Ok(Value::Other)
     },
     Shape::Fields(specs)=>{
      let n=self.c.array()?;if n>specs.len(){return Err(Error::Schema)}
      let short=name.rsplit('.').next().unwrap_or(name);let is_doc=matches!(ctx,Some((DOC,_)));let capture_all=matches!(short,"AchievementData"|"GameCounterData"|"GameCollectionsTraitModel"|"CollectionVersion"|"AchievementModel"|"GameCounterModel")||name==ROOT||name==SHOP||name==CELEBRATION||(short=="InventoryItem"&&ctx==Some((DOC,1)));
      let mut fields=Vec::new();
      for (i,spec) in specs.iter().take(n).enumerate(){let at=self.c.pos;let value=match spec{Some(_) if short=="GameCounterData"&&i==1=>{self.budget(depth+1)?;if self.c.peek()?==0xc0{self.c.token()?;Value::Nil}else{let n=self.c.array()?;for _ in 0..n{self.budget(depth+2)?;if !matches!(self.c.token()?,Token::Str(_)){return Err(Error::Schema)}}Value::Count(n)}},Some(s)=>self.read(*s,depth+1,if short=="GameCollectionsTraitModel"&&i==0{Some(("collection-key0",0))}else{None},short=="GameCollectionsTraitModel"&&i==1)?,None=>{if self.c.token()?!=Token::Nil{return Err(Error::Schema)}Value::Nil}};
       if capture_all||(is_doc&&i==0){fields.push((value,at..self.c.pos));}
      }
      if name==ROOT{if n!=3||!matches!(&fields[2].0,Value::Count(x) if *x>0 && *x==self.index.documents){return Err(Error::Schema)}}
      if name==SHOP{if n!=3{return Err(Error::Schema)}return Ok(Value::Key(Key::Shop(fields[0].0.guid()?,fields[1].0.guid()?,fields[2].0.int()?)))}
      if short=="CollectionVersion"{if ctx!=Some((DOC,18))||n!=3||self.version_seen{return Err(Error::Schema)}if !matches!(&fields[2].0,Value::Str(v) if *v==self.version.as_str()){return Err(Error::Version)}self.version_seen=true;self.index.collection_version=Some(CollectionVersion{id:u32::try_from(fields[0].0.int()?).map_err(|_|Error::Schema)?,number:i32::try_from(fields[1].0.int()?).map_err(|_|Error::Schema)?,span:fields[1].1.clone()});}
      if short=="GameCollectionsTraitModel"{if ctx!=Some((TRAIT,39))||n!=2||self.collection_seen{return Err(Error::Schema)}self.collection_seen=true;self.index.deprecated_count=match &fields[0].0{Value::Count(x)=>*x,_=>return Err(Error::Schema)};if !matches!(&fields[1].0,Value::Count(_)){return Err(Error::Schema)}}
      if matches!(short,"AchievementData"|"GameCounterData")&&n!=3{return Err(Error::Schema)}
      if matches!(short,"AchievementModel"|"GameCounterModel"){
       let tag=if short=="AchievementModel"{16}else{17};if ctx!=Some((DOC,tag))||n!=3{return Err(Error::Schema)}let id=u32::try_from(fields[0].0.int()?).map_err(|_|Error::Schema)?;let guid=fields[1].0.guid()?;if !self.guids.insert((tag,guid)){return Err(Error::Duplicate)}
       let data=match &fields[2].0{Value::Fields(v) if v.len()==3=>v,_=>return Err(Error::Schema)};
       if tag==17&&(!matches!(&data[2].0,Value::Count(_))||!matches!(&data[1].0,Value::Count(_)|Value::Nil)){return Err(Error::Schema)}
       let state=if tag==16{let complete=match &data[0].0{Value::Bool(v)=>*v,_=>return Err(Error::Schema)};let current=match &data[1].0{Value::Float(v)=>*v,_=>return Err(Error::Schema)};let completed=match &data[2].0{Value::Nil=>None,Value::Time(s,n)=>Some((*s,*n)),_=>return Err(Error::Schema)};ModelState::Achievement{complete,current,completed}}else{let current=match &data[0].0{Value::Float(v)=>*v,_=>return Err(Error::Schema)};let counted_values=match &data[1].0{Value::Nil=>None,Value::Count(n)=>Some(*n),_=>return Err(Error::Schema)};let counted_guids=match &data[2].0{Value::Count(n)=>*n,_=>return Err(Error::Schema)};ModelState::Counter{current,counted_values,counted_guids}};
       let model=Model{id,guid,fields:std::array::from_fn(|i|FieldSpan{bytes:data[i].1.clone()}),state};if tag==16{self.index.achievements.push(model)}else{self.index.counters.push(model)}
      }
      if capture_all||is_doc{Ok(Value::Fields(fields))}else{Ok(Value::Other)}
     }
    }
   }
  }
 }
}
/// Strict schema walk over decompressed bytes; only target spans and identities are retained.
pub fn index_native(bytes:&[u8],version:Version)->Result<NativeIndex,Error>{
 if bytes.is_empty()||bytes.len()>MAX_DECODED{return Err(Error::Budget)}
 let mut w=Walk{c:Cursor::new(bytes),index:NativeIndex::default(),version,version_seen:false,collection_seen:false,ids:HashSet::new(),guids:HashSet::new()};
 w.read(schema::ROOT,0,None,false)?;
 if w.c.pos!=bytes.len(){return Err(Error::Trailing)}
 if !w.version_seen||!w.collection_seen||w.index.achievements.is_empty()||w.index.counters.is_empty(){return Err(Error::Schema)}
 Ok(w.index)
}
