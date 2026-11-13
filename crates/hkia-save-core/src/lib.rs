//! HKIA bounded slot core and explicit private minimum Writer. No authentication or live activation.
#![forbid(unsafe_code)]
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Error { Budget, Truncated, InvalidDistance, LengthMismatch, Overflow, InvalidToken, Schema, Version, Marker, Duplicate, Trailing }

/// Current JS-compatible safety ceiling, not the future design target.
pub const MAX_INPUT: usize = 25 * 1024 * 1024;
pub const MAX_DECODED: usize = 45 * 1024 * 1024;
pub const MAX_BLOCK: usize = 65_536;
pub const MAX_BLOCKS: usize = 4096;

fn byte(src: &[u8], at: &mut usize) -> Result<u8, Error> {
    let b = *src.get(*at).ok_or(Error::Truncated)?;
    *at += 1;
    Ok(b)
}
fn length(src: &[u8], at: &mut usize, initial: usize) -> Result<usize, Error> {
    let mut n = initial;
    if initial == 15 {
        loop {
            let b = byte(src, at)?;
            n = n.checked_add(b as usize).ok_or(Error::Overflow)?;
            if b != 255 { break; }
        }
    }
    Ok(n)
}
/// Decode a single bounded raw LZ4 block, with overlap-safe match expansion.
/// The caller must separately validate the SaveGameV2 envelope, schema and total budget.
pub fn decode_block(src: &[u8], expected: usize) -> Result<Vec<u8>, Error> {
    if src.len() > MAX_INPUT || expected == 0 || expected > MAX_BLOCK { return Err(Error::Budget); }
    let mut out = Vec::with_capacity(expected);
    let mut at = 0;
    while at < src.len() {
        let token = byte(src, &mut at)?;
        let literals = length(src, &mut at, (token >> 4) as usize)?;
        let end = at.checked_add(literals).ok_or(Error::Overflow)?;
        let next = out.len().checked_add(literals).ok_or(Error::Overflow)?;
        if next > expected { return Err(Error::LengthMismatch); }
        out.extend_from_slice(src.get(at..end).ok_or(Error::Truncated)?);
        at = end;
        if at == src.len() { break; }
        let lo = byte(src, &mut at)? as usize;
        let hi = byte(src, &mut at)? as usize;
        let distance = lo | (hi << 8);
        if distance == 0 || distance > out.len() { return Err(Error::InvalidDistance); }
        let count = length(src, &mut at, (token & 15) as usize)?.checked_add(4).ok_or(Error::Overflow)?;
        let next = out.len().checked_add(count).ok_or(Error::Overflow)?;
        if next > expected { return Err(Error::LengthMismatch); }
        for _ in 0..count { let b = out[out.len() - distance]; out.push(b); }
    }
    if out.len() != expected { return Err(Error::LengthMismatch); }
    Ok(out)
}
/// Reject an oversized aggregate before allocation, while keeping block spans external.
pub fn check_block_budget(lengths: &[usize]) -> Result<usize, Error> {
    if lengths.is_empty() || lengths.len() > MAX_BLOCKS { return Err(Error::Budget); }
    let mut total: usize = 0;
    for &n in lengths {
        if n == 0 || n > MAX_BLOCK { return Err(Error::Budget); }
        total = total.checked_add(n).ok_or(Error::Overflow)?;
        if total > MAX_DECODED { return Err(Error::Budget); }
    }
    Ok(total)
}
#[cfg(test)]
mod tests {
    use super::*;
    #[test] fn literals() { assert_eq!(decode_block(&[0x30, 97, 98, 99], 3), Ok(b"abc".to_vec())); }
    #[test] fn overlapping_match() { assert_eq!(decode_block(&[0x12, 97, 1, 0], 7), Ok(vec![97;7])); }
    #[test] fn extended_literal() { let mut b=vec![0xf0,1]; b.extend_from_slice(&[42;16]); assert_eq!(decode_block(&b,16),Ok(vec![42;16])); }
    #[test] fn extended_match() { assert_eq!(decode_block(&[0x1f,97,1,0,2],22),Ok(vec![97;22])); }
    #[test] fn invalid() { assert_eq!(decode_block(&[0x10,97,0,0],5),Err(Error::InvalidDistance)); assert_eq!(decode_block(&[0xf0],16),Err(Error::Truncated)); assert_eq!(decode_block(&[0x10],1),Err(Error::Truncated)); assert_eq!(decode_block(&[0x30,97,98,99],2),Err(Error::LengthMismatch)); assert_eq!(decode_block(&[0x10,97],2),Err(Error::LengthMismatch)); }
    #[test] fn bounded() { assert_eq!(check_block_budget(&[32768,32768]),Ok(65536)); assert_eq!(check_block_budget(&[0]),Err(Error::Budget)); assert_eq!(check_block_budget(&vec![65536;721]),Err(Error::Budget)); assert_eq!(decode_block(&[],65537),Err(Error::Budget)); }
}

mod wire;
pub mod envelope;
pub mod native;
mod schema;

/// Fully consume a known-version slot; no export capability or authentication claim.
#[derive(Debug)]
pub struct ReadSlot { pub envelope: envelope::Envelope, pub index: native::NativeIndex }
pub fn read_slot(raw: &[u8]) -> Result<ReadSlot, Error> {
    let envelope = envelope::decode_envelope(raw)?;
    let index = native::index_native(&envelope.decoded, envelope.version)?;
    Ok(ReadSlot { envelope, index })
}

pub mod digest;
mod deflate;
pub mod archive;
pub mod account;
pub mod session;
pub mod abi;
pub mod projection;
pub mod writer;
mod writer_catalog;
