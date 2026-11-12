export type LinkageClassification = 'REQUIRED'|'RELATED'|'INDEPENDENT'|'UNKNOWN';
export type NativeWriteAssessment = Readonly<{
 schema:'HKIA.LinkageNativeWritePathDelta.1';kind:string;classification:LinkageClassification;
 storageTarget:string|null;observedNativeRoute:readonly string[];targetIds:readonly string[];
 warnings:readonly string[];blockers:readonly string[];requiredWrites:readonly never[];
 autoApply:false;applyAuthorized:false;writerEnabled:false;pagesEnabled:false;saveBytes:null;
}>;
export const NATIVE_WRITEPATH_SCHEMA:'HKIA.LinkageNativeWritePathDelta.1';
export const NATIVE_WRITEPATH_SOURCE_SHA:'83580cee3e2effaee14780d921ba5621b1505774b6e0a349e8f08a61ec1c1a1a';
export const FROZEN_GRAPH: Readonly<{edges:17284;sha256:string;rebuild:false}>;
export const FORBIDDEN_AUTOWRITES:readonly string[];
export function classifyNativeSavePath(arg:{kind:'ACHIEVEMENT'|'COUNTER';storage:'Meta'|'InGame'|'UNKNOWN';version?:string;guidVerified?:boolean;documentIdVerified?:boolean}):NativeWriteAssessment;
export function assessLoadedAchievementRecount(arg:{version?:string;isComplete:boolean;currentValue:number;computedValue:number;sourceCounterVerified?:boolean}):NativeWriteAssessment & Readonly<{candidate:string}>;
export function inspectAchievementRewardClaim(arg:{achievementDataKeys?:readonly string[];completionCallbackObserved?:boolean;hasVerifiedClaimLedger?:boolean}):NativeWriteAssessment;
export function inspectMissionCounterLink(arg:{version?:string;achievementKey:string;sourceAchievementGuid:string;sourceCounterGuid:string;sourceCounterKind:string;missionAssetGuid?:string|null;missionDocumentId?:string|null}):NativeWriteAssessment;
export function inspectCollectionInventoryDirection(arg:{historyAdded:boolean;inventoryNewId:boolean;quantityChangedForSameId:boolean}):NativeWriteAssessment;

export type MissionSourceCrosswalk = Readonly<{
 schema:'HKIA.LinkageMissionDefinitionToCounterDelta.1';
 source:Readonly<{definitionsSHA256:string;version:string}>;
 counts:Readonly<{sourceMissionCounterLinks:171;distinctSourceMissionAssets:170;
  backupSampleMatchedLinksAggregate?:number;activeSampleMatchedLinksAggregate?:number}>;
 bindings:readonly Readonly<{counterSourceGuid:string;missionSourceGuid:string;missionAssetKey:string;
  sourceCounterKind:'GameCounterMissionDefinition';achievementKey:string|null;accountKey:string|null;
  classification:'RELATED';persistentLinkageRequired:false;requiredWrites:readonly never[]}>[];
}>;
export function resolveMissionSourceBinding(crosswalk:MissionSourceCrosswalk, arg:{
 counterSourceGuid:string;missionSourceGuid?:string|null;version?:string;
}):NativeWriteAssessment;
