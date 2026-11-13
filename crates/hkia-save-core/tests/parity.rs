//! Independent V18 JS oracle fixtures. All data synthetic; compile and run required.
use hkia_save_core::{read_slot, envelope::Version, native::ModelState, MAX_INPUT,MAX_DECODED};

fn check(name:&str, raw:&[u8], decoded:&[u8], version:Version, blocks:usize,
         expected:&[(i32,i64,usize,usize)], achievement_spans:[(usize,usize);3], counter_spans:[(usize,usize);3],
         completed:Option<(i64,u32)>, counted_values:Option<usize>,counted_guids:usize){
    let before=raw.to_vec();let slot=read_slot(raw).unwrap_or_else(|e|panic!("{name}: {e:?}"));
    assert_eq!(slot.envelope.version,version);assert_eq!(slot.envelope.decoded.as_slice(),decoded);assert_eq!(slot.envelope.blocks.len(),blocks);
    let mut at=0;for b in &slot.envelope.blocks{assert_eq!(b.decoded.start,at);assert!(b.decoded.end<=decoded.len());assert!(b.compressed.start<b.compressed.end&&b.compressed.end<=raw.len());at=b.decoded.end;}assert_eq!(at,decoded.len());
    let i=slot.index;assert_eq!(i.documents,4);assert_eq!(i.achievements.len(),1);assert_eq!(i.counters.len(),1);assert_eq!(i.deprecated_count,2);assert_eq!(i.dictionary_entries,4+expected.len());
    let a=&i.achievements[0];let c=&i.counters[0];assert_eq!(a.id,1);assert_eq!(c.id,1);assert_eq!(a.guid,[1,0,0,1]);assert_eq!(c.guid,[1,0,0,2]);
    assert_eq!(a.state,ModelState::Achievement{complete:false,current:1.0,completed});
    assert_eq!(c.state,ModelState::Counter{current:2.0,counted_values,counted_guids});
    for k in 0..3{assert_eq!(a.fields[k].bytes,achievement_spans[k].0..achievement_spans[k].1);assert_eq!(c.fields[k].bytes,counter_spans[k].0..counter_spans[k].1);}
    assert_eq!(i.collections.iter().map(|x|(x.id,x.ticks,x.value.start,x.value.end)).collect::<Vec<_>>().as_slice(),expected);
    let map=i.collection_map.unwrap();for x in &i.collections{assert!(map.start<x.pair.start&&x.pair.start<x.value.start&&x.pair.end==x.value.end&&x.pair.end<=map.end)}
    assert_eq!(raw,before.as_slice());
}

#[test] fn valid_3_0_0() {check("valid-3.0.0",include_bytes!("fixtures/valid-3.0.0.bin"),include_bytes!("fixtures/valid-3.0.0.decoded"),Version::V300,1,&[(2,638000000000000001i64,173,182),(3,9i64,183,192)],[(44,45),(45,50),(50,51)],[(76,81),(81,82),(82,83)],None,None,0);}
#[test] fn valid_3_0_1() {check("valid-3.0.1",include_bytes!("fixtures/valid-3.0.1.bin"),include_bytes!("fixtures/valid-3.0.1.decoded"),Version::V301,1,&[(2,638000000000000001i64,173,182),(3,9i64,183,192)],[(44,45),(45,50),(50,51)],[(76,81),(81,82),(82,83)],None,None,0);}
#[test] fn exact_ticks_multiblock() {check("exact-ticks-multiblock",include_bytes!("fixtures/exact-ticks-multiblock.bin"),include_bytes!("fixtures/exact-ticks-multiblock.decoded"),Version::V301,14,&[(1,i64::MIN,177,186),(2,9007199254740993i64,191,200),(3,9223372036854775807i64,205,214)],[(44,45),(45,50),(50,51)],[(76,81),(81,82),(82,83)],None,None,0);}
#[test] fn match_compression() {check("match-compression",include_bytes!("fixtures/match-compression.bin"),include_bytes!("fixtures/match-compression.decoded"),Version::V301,1,&[(1,i64::MIN,177,186),(2,9007199254740993i64,191,200),(3,9223372036854775807i64,205,214)],[(44,45),(45,50),(50,51)],[(76,81),(81,82),(82,83)],None,None,0);}
#[test] fn counted_guid_duplicates_and_time() {check("counted-guid-duplicates-and-time",include_bytes!("fixtures/counted-guid-duplicates-and-time.bin"),include_bytes!("fixtures/counted-guid-duplicates-and-time.decoded"),Version::V301,1,&[(2,638000000000000001i64,253,262),(3,9i64,263,272)],[(44,45),(45,50),(50,65)],[(90,95),(95,102),(102,163)],Some((1750000000,123456700)),Some(3),3);}
#[test] fn reject_nil_counter_string() {assert!(read_slot(include_bytes!("fixtures/nil-counter-string.bin")).is_err());}
#[test] fn reject_invalid_native_timestamp() {assert!(read_slot(include_bytes!("fixtures/invalid-native-timestamp.bin")).is_err());}
#[test] fn reject_duplicate_hash() {assert!(read_slot(include_bytes!("fixtures/duplicateHash.bin")).is_err());}
#[test] fn reject_duplicate_compound() {assert!(read_slot(include_bytes!("fixtures/duplicateCompound.bin")).is_err());}
#[test] fn reject_duplicate_int() {assert!(read_slot(include_bytes!("fixtures/duplicateInt.bin")).is_err());}
#[test] fn reject_duplicate_doc() {assert!(read_slot(include_bytes!("fixtures/duplicateDoc.bin")).is_err());}
#[test] fn reject_unknown() {assert!(read_slot(include_bytes!("fixtures/unknown.bin")).is_err());}
#[test] fn reject_appended() {assert!(read_slot(include_bytes!("fixtures/appended.bin")).is_err());}
#[test] fn reject_float_key() {assert!(read_slot(include_bytes!("fixtures/floatKey.bin")).is_err());}
#[test] fn reject_payload_tail() {assert!(read_slot(include_bytes!("fixtures/payload-tail.bin")).is_err());}
#[test] fn reject_payload_version_mismatch() {assert!(read_slot(include_bytes!("fixtures/payload-version-mismatch.bin")).is_err());}
#[test] fn reject_envelope_tail() {assert!(read_slot(include_bytes!("fixtures/envelope-tail.bin")).is_err());}
#[test] fn reject_truncated() {assert!(read_slot(include_bytes!("fixtures/truncated.bin")).is_err());}
#[test] fn reject_duplicate_marker() {assert!(read_slot(include_bytes!("fixtures/duplicate-marker.bin")).is_err());}
#[test] fn reject_prefix_mismatch() {assert!(read_slot(include_bytes!("fixtures/prefix-mismatch.bin")).is_err());}
#[test] fn reject_invalid_array() {assert!(read_slot(include_bytes!("fixtures/invalid-array.bin")).is_err());}
#[test] fn reject_invalid_ext_type() {assert!(read_slot(include_bytes!("fixtures/invalid-ext-type.bin")).is_err());}
#[test] fn reject_invalid_size_zero() {assert!(read_slot(include_bytes!("fixtures/invalid-size-zero.bin")).is_err());}
#[test] fn reject_invalid_marker() {assert!(read_slot(include_bytes!("fixtures/invalid-marker.bin")).is_err());}
#[test] fn reject_invalid_header_width() {assert!(read_slot(include_bytes!("fixtures/invalid-header-width.bin")).is_err());}
#[test] fn safety_caps_unchanged(){assert_eq!(MAX_INPUT,25*1024*1024);assert_eq!(MAX_DECODED,45*1024*1024);assert!(hkia_save_core::check_block_budget(&[65536;721]).is_err());}
