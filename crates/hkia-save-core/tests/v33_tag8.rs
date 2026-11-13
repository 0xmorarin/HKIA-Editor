//! V33 JS-oracle-derived synthetic Celebration document checks. Not a writer test.
use hkia_save_core::{envelope::Version,native::index_native,Error};
const BASE: &[u8] = include_bytes!("fixtures/valid-3.0.1.decoded");
fn with_docs(docs: &[&[u8]]) -> Vec<u8> {
    let mut b = BASE.to_vec();
    assert_eq!(b[3], 0x94); // fixed synthetic DbRoot contains four documents
    assert!(docs.len() <= 11);
    b[3] += docs.len() as u8;
    for doc in docs { b.extend_from_slice(doc); }
    b
}
const EMPTY: &[u8] = &[0x92, 8, 0x92, 4, 0x90];
const DUP_GUID: &[u8] = &[0x92, 8, 0x92, 4, 0x92, 1, 2, 3, 4, 1, 2, 3, 4];
#[test] fn tag8_empty_list_exact_union_span() {
    let b = with_docs(&[EMPTY]); let i = index_native(&b, Version::V301).unwrap();
    assert_eq!(i.documents, 5); assert_eq!(i.celebrations.len(), 1);
    let c = &i.celebrations[0]; assert_eq!(c.id, 4); assert_eq!(c.guid_count, 0);
    assert_eq!(c.bytes, BASE.len()..b.len()); assert_eq!(&b[c.bytes.clone()], EMPTY);
}
#[test] fn tag8_duplicate_guids_keep_raw_tokens_and_count() {
    let b = with_docs(&[DUP_GUID]); let i = index_native(&b, Version::V301).unwrap();
    let c = &i.celebrations[0]; assert_eq!(c.guid_count, 2); assert_eq!(&b[c.bytes.clone()], DUP_GUID);
}
#[test] fn tag8_missing_list_rejected() {
    let b = with_docs(&[&[0x92, 8, 0x91, 4]]);
    assert_eq!(index_native(&b, Version::V301).unwrap_err(), Error::Schema);
}
#[test] fn tag8_nil_list_rejected() {
    let b = with_docs(&[&[0x92, 8, 0x92, 4, 0xc0]]);
    assert_eq!(index_native(&b, Version::V301).unwrap_err(), Error::Schema);
}
#[test] fn tag8_extra_field_rejected() {
    let b = with_docs(&[&[0x92, 8, 0x93, 4, 0x90, 0]]);
    assert_eq!(index_native(&b, Version::V301).unwrap_err(), Error::Schema);
}
#[test] fn tag8_distinct_documents_keep_order_and_ranges() {
    let second = [0x92, 8, 0x92, 5, 0x90]; let b = with_docs(&[DUP_GUID, &second]);
    let i = index_native(&b, Version::V301).unwrap(); assert_eq!(i.documents, 6);
    assert_eq!(i.celebrations.len(), 2); assert_eq!(i.celebrations[0].id, 4); assert_eq!(i.celebrations[1].id, 5);
    let a = &i.celebrations[0]; let c = &i.celebrations[1];
    assert_eq!(a.bytes.end, c.bytes.start); assert_eq!(&b[a.bytes.clone()], DUP_GUID); assert_eq!(&b[c.bytes.clone()], &second);
}
#[test] fn tag8_duplicate_document_identity_rejected() {
    let b = with_docs(&[EMPTY, DUP_GUID]);
    assert_eq!(index_native(&b, Version::V301).unwrap_err(), Error::Duplicate);
}
