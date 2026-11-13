//! HKIA SaveGameV2 slot envelope. Signature bytes are opaque, never authenticated here.
use crate::{check_block_budget,decode_block,Error,MAX_INPUT,MAX_BLOCKS,MAX_BLOCK};
use crate::wire::{Cursor,Token};
use std::{collections::HashSet,ops::Range};
const PREFIX:[u8;32]=[0x13,0x5b,0x4a,0xa4,0xf7,0x02,0xa4,0x5d,0x1c,0xc5,0x62,0xae,0xb5,0xa3,0x86,0xed,0x5d,0x17,0xe1,0xfd,0x58,0x8f,0x42,0x4d,0xcf,0xc5,0x9d,0x2e,0x14,0x0c,0xf5,0x97];
const MAGIC:[u8;32]=[0xa1,0xa2,0xf8,0x33,0x3c,0x66,0xec,0x45,0x5b,0xaa,0x2d,0xfc,0x63,0x25,0xc2,0x43,0x7a,0x77,0x9c,0x99,0x06,0xee,0xcf,0xf0,0xc0,0x22,0xe5,0xf6,0xb6,0xca,0x73,0xb8];
#[derive(Debug,Clone,Copy,PartialEq,Eq)]
pub enum Version { V300,V301 }
impl Version {pub fn as_str(self)->&'static str{match self{Self::V300=>"3.0.0",Self::V301=>"3.0.1"}}}
#[derive(Debug,Clone,PartialEq,Eq)]
pub struct BlockSpan {pub compressed:Range<usize>,pub decoded:Range<usize>}
#[derive(Debug)]
pub struct Envelope {pub version:Version,pub marker:usize,pub blocks:Vec<BlockSpan>,pub decoded:Vec<u8>}
fn header(raw:&[u8])->Result<Version,Error>{
    let mut c=Cursor::new(raw);
    if c.array()?!=8{return Err(Error::Schema)}
    for _ in 0..4{c.int(0,u32::MAX as i128)?;}
    let version=match c.token()?{Token::Str("3.0.0")=>Version::V300,Token::Str("3.0.1")=>Version::V301,_=>return Err(Error::Version)};
    let expected=if version==Version::V300{30000}else{30001};
    if c.int(0,999999)?!=expected{return Err(Error::Version)}
    if c.array()?!=2{return Err(Error::Schema)} c.timestamp()?;c.int(-840,840)?;c.int(0,u64::MAX as i128)?;
    let n=c.map()?;if n>256{return Err(Error::Budget)}
    let mut keys=HashSet::new();
    for _ in 0..n{
        let k=match c.token()?{Token::Str(s) if s.encode_utf16().count()<=128=>s,_=>return Err(Error::Schema)};
        if !keys.insert(k){return Err(Error::Duplicate)}
        if c.array()?!=2{return Err(Error::Schema)} let tag=c.int(0,3)?;
        if c.array()?!=1{return Err(Error::Schema)}
        let t=c.token()?;let valid=match (tag,t){(0,Token::Int(_))=>true,(1,Token::Int(v))=>v>=-9007199254740991&&v<=9007199254740991,(1,Token::F32(v))=>v.is_finite(),(1,Token::F64(v))=>v.is_finite(),(2,Token::Str(_))|(3,Token::Bool(_))=>true,_=>false};
        if !valid{return Err(Error::Schema)}
    }
    let n=c.array()?;if n>1000{return Err(Error::Budget)}
    for _ in 0..n*4{c.int(0,u32::MAX as i128)?;}
    if c.array()?!=1||c.int(9,9)?!=9||c.pos!=raw.len(){return Err(Error::Schema)}
    Ok(version)
}
pub fn decode_envelope(raw:&[u8])->Result<Envelope,Error>{
    if raw.len()>MAX_INPUT{return Err(Error::Budget)}
    let tail=raw.get(32..).ok_or(Error::Truncated)?;
    if raw.get(..32)!=Some(PREFIX.as_slice()){return Err(Error::Marker)}
    let mut matches=tail.windows(MAGIC.len()).enumerate().filter(|(_,b)|*b==MAGIC.as_slice());
    let marker=matches.next().ok_or(Error::Marker)?.0+32;
    if matches.next().is_some(){return Err(Error::Marker)}
    if marker<40{return Err(Error::Schema)}
    let version=header(&raw[32..marker])?;
    let body_start=marker+MAGIC.len();let mut c=Cursor::new(&raw[body_start..]);
    let n=c.array()?;if n<2||n>MAX_BLOCKS+1{return Err(Error::Budget)}
    let lengths=match c.token()?{Token::Ext(98,b)=>b,_=>return Err(Error::Schema)};
    let mut l=Cursor::new(lengths);let mut sizes=Vec::with_capacity(n-1);
    for _ in 1..n{sizes.push(l.int(1,MAX_BLOCK as i128)? as usize);}
    if l.pos!=lengths.len(){return Err(Error::Trailing)}
    let total=check_block_budget(&sizes)?;
    let mut blocks=Vec::with_capacity(n-1);let mut decoded=Vec::with_capacity(total);
    for size in sizes{
        let b=match c.token()?{Token::Bin(b)=>b,_=>return Err(Error::Schema)};
        let end=body_start+c.pos;let start=end-b.len();let d=decoded.len();
        decoded.extend_from_slice(&decode_block(b,size)?);
        blocks.push(BlockSpan{compressed:start..end,decoded:d..decoded.len()});
    }
    if c.pos!=c.bytes.len(){return Err(Error::Trailing)}
    Ok(Envelope{version,marker,blocks,decoded})
}
