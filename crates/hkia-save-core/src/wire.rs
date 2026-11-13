//! Byte-preserving MessagePack token cursor. Native containers are consumed by schema.
use crate::Error;

pub(crate) const MAX_CONTAINER: usize = 1_000_000;
#[derive(Clone, Copy, Debug, PartialEq)]
pub(crate) enum Token<'a> {
    Nil, Bool(bool), Int(i128), F32(f32), F64(f64), Str(&'a str), Bin(&'a [u8]),
    Array(usize), Map(usize), Ext(i8, &'a [u8]),
}
pub(crate) struct Cursor<'a> { pub bytes: &'a [u8], pub pos: usize }
impl<'a> Cursor<'a> {
    pub fn new(bytes: &'a [u8]) -> Self { Self { bytes, pos: 0 } }
    pub fn take(&mut self, n: usize) -> Result<&'a [u8], Error> {
        let end = self.pos.checked_add(n).ok_or(Error::Overflow)?;
        let b = self.bytes.get(self.pos..end).ok_or(Error::Truncated)?; self.pos = end; Ok(b)
    }
    pub fn peek(&self) -> Result<u8, Error> { self.bytes.get(self.pos).copied().ok_or(Error::Truncated) }
    fn u8(&mut self) -> Result<u8, Error> { Ok(self.take(1)?[0]) }
    fn u16(&mut self) -> Result<u16, Error> { Ok(u16::from_be_bytes(self.take(2)?.try_into().unwrap())) }
    fn u32(&mut self) -> Result<u32, Error> { Ok(u32::from_be_bytes(self.take(4)?.try_into().unwrap())) }
    fn u64(&mut self) -> Result<u64, Error> { Ok(u64::from_be_bytes(self.take(8)?.try_into().unwrap())) }
    fn str(&mut self, n: usize) -> Result<Token<'a>, Error> { let s=std::str::from_utf8(self.take(n)?).map_err(|_| Error::InvalidToken)?;
        // V18 JS TextDecoder strips a leading BOM. Reject this ambiguous Native identity rather than silently normalize.
        if s.starts_with('\u{feff}'){return Err(Error::Schema)}
        Ok(Token::Str(s)) }
    fn ext(&mut self, n: usize) -> Result<Token<'a>, Error> { let ty=self.u8()? as i8; Ok(Token::Ext(ty,self.take(n)?)) }
    pub fn token(&mut self) -> Result<Token<'a>, Error> {
        use Token::*;
        let t=self.u8()?;
        Ok(match t {
            0x00..=0x7f => Int(t as i128), 0xe0..=0xff => Int((t as i8) as i128),
            0x80..=0x8f => Map((t&15) as usize), 0x90..=0x9f => Array((t&15) as usize),
            0xa0..=0xbf => return self.str((t&31) as usize),
            0xc0=>Nil, 0xc2=>Bool(false),0xc3=>Bool(true),
            0xc4=>{let n=self.u8()? as usize; Bin(self.take(n)?)},
            0xc5=>{let n=self.u16()? as usize; Bin(self.take(n)?)},
            0xc6=>{let n=self.u32()? as usize; Bin(self.take(n)?)},
            0xc7=>{let n=self.u8()? as usize;return self.ext(n)},
            0xc8=>{let n=self.u16()? as usize;return self.ext(n)},
            0xc9=>{let n=self.u32()? as usize;return self.ext(n)},
            0xca=>F32(f32::from_bits(self.u32()?)),0xcb=>F64(f64::from_bits(self.u64()?)),
            0xcc=>Int(self.u8()? as i128),0xcd=>Int(self.u16()? as i128),0xce=>Int(self.u32()? as i128),0xcf=>Int(self.u64()? as i128),
            0xd0=>Int((self.u8()? as i8) as i128),0xd1=>Int((self.u16()? as i16) as i128),0xd2=>Int((self.u32()? as i32) as i128),0xd3=>Int((self.u64()? as i64) as i128),
            0xd4=>return self.ext(1),0xd5=>return self.ext(2),0xd6=>return self.ext(4),0xd7=>return self.ext(8),0xd8=>return self.ext(16),
            0xd9=>{let n=self.u8()? as usize;return self.str(n)},0xda=>{let n=self.u16()? as usize;return self.str(n)},0xdb=>{let n=self.u32()? as usize;return self.str(n)},
            0xdc=>Array(self.u16()? as usize),0xdd=>Array(self.u32()? as usize),0xde=>Map(self.u16()? as usize),0xdf=>Map(self.u32()? as usize),
            _=>return Err(Error::InvalidToken)
        })
    }
    pub fn int(&mut self, lo:i128, hi:i128)->Result<i128,Error>{match self.token()?{Token::Int(v) if (lo..=hi).contains(&v)=>Ok(v),_=>Err(Error::Schema)}}
    pub fn array(&mut self)->Result<usize,Error>{match self.token()?{Token::Array(n) if n<=MAX_CONTAINER=>Ok(n),_=>Err(Error::Schema)}}
    pub fn map(&mut self)->Result<usize,Error>{match self.token()?{Token::Map(n) if n<=MAX_CONTAINER=>Ok(n),_=>Err(Error::Schema)}}
    pub fn timestamp(&mut self)->Result<(i64,u32),Error>{
        match self.token()? {
            Token::Ext(-1,b) => {
                let (s,n)=match b.len(){4=>(u32::from_be_bytes(b.try_into().unwrap()) as i64,0),8=>{let x=u64::from_be_bytes(b.try_into().unwrap());((x&0x3ffffffff) as i64,(x>>34) as u32)},12=>(i64::from_be_bytes(b[4..].try_into().unwrap()),u32::from_be_bytes(b[..4].try_into().unwrap())),_=>return Err(Error::Schema)};
                if n>=1_000_000_000 {return Err(Error::Schema)} Ok((s,n))
            },_=>Err(Error::Schema)
        }
    }
}
