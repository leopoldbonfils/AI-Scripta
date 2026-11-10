/**
 * FilmForge AI — Phase D: Story Bible & Continuity TypeScript Interfaces (Frontend)
 */

export type BibleEvidenceLevel = 'SOURCE_FACT' | 'INFERENCE' | 'SUGGESTION';

export type CharacterStatus =
	| 'ALIVE'
	| 'DEAD'
	| 'MISSING'
	| 'UNKNOWN'
	| 'IMPRISONED'
	| 'INJURED';

export type EntityCategory =
	| 'WEAPON'
	| 'DOCUMENT'
	| 'EVIDENCE'
	| 'VEHICLE'
	| 'BELONGING'
	| 'ORGANIZATION'
	| 'TECHNOLOGY'
	| 'OTHER';

export type TimelineEventType =
	| 'PLOT_EVENT'
	| 'BACKSTORY'
	| 'FLASHBACK'
	| 'REVELATION'
	| 'CONFRONTATION'
	| 'DECISION'
	| 'TRANSFER'
	| 'DEATH'
	| 'RELATIONSHIP_SHIFT';

export type TimingCertainty =
	| 'EXPLICIT'
	| 'APPROXIMATE'
	| 'UNKNOWN'
	| 'RETROACTIVE_REVEAL';

export type ContinuityCategory =
	| 'CHARACTER_CONTINUITY'
	| 'TIMELINE_CONTINUITY'
	| 'RELATIONSHIP_CONTINUITY'
	| 'LOCATION_CONTINUITY'
	| 'OBJECT_CONTINUITY'
	| 'STORY_LOGIC_CONTINUITY';

export type ContinuityClassification =
	| 'CONFIRMED_CONTRADICTION'
	| 'POSSIBLE_INCONSISTENCY'
	| 'INTENTIONAL_MYSTERY'
	| 'UNEXPLAINED_CHOICE';

export type ContinuitySeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type ContinuityStatus =
	| 'PENDING'
	| 'ACCEPTED'
	| 'REJECTED'
	| 'RESOLVED'
	| 'FALSE_POSITIVE';

export type MemoryTargetType =
	| 'STORY_IDENTITY'
	| 'CHARACTER'
	| 'RELATIONSHIP'
	| 'LOCATION'
	| 'ENTITY'
	| 'TIMELINE_EVENT'
	| 'SCENE_CONNECTION';

export type ProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface WorldRuleItem {
	id: string;
	rule: string;
	category: string;
	sourceEvidence?: string;
	evidenceLevel: BibleEvidenceLevel;
}

export interface NarrativeFactItem {
	id: string;
	fact: string;
	category: string;
	sourceReference?: string;
	evidenceLevel: BibleEvidenceLevel;
}

export interface StoryBibleCharacter {
	id: string;
	storyBibleId: string;
	characterId?: string | null;
	name: string;
	role?: string | null;
	age?: string | null;
	personality?: string | null;
	background?: string | null;
	physicalDescription?: string | null;
	goals?: string | null;
	motivations?: string | null;
	fears?: string | null;
	weaknesses?: string | null;
	internalConflict?: string | null;
	externalConflict?: string | null;
	importantDecisions: string[];
	characterArc?: string | null;
	status: CharacterStatus | string;
	firstAppearance?: string | null;
	developments: string[];
	evidenceLevel: BibleEvidenceLevel;
	sourceEvidence?: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface StoryBibleRelationship {
	id: string;
	storyBibleId: string;
	characterAId?: string | null;
	characterBId?: string | null;
	characterAName: string;
	characterBName: string;
	relationshipType: string;
	currentStatus: string;
	trustLevel: number;
	tensionLevel: number;
	powerDynamics?: string | null;
	importantEvents: string[];
	historyOfChanges: Array<{ event: string; change: string; sceneRef?: string }>;
	evidenceLevel: BibleEvidenceLevel;
	sourceEvidence?: string | null;
}

export interface StoryBibleLocation {
	id: string;
	storyBibleId: string;
	name: string;
	description?: string | null;
	geographicContext?: string | null;
	importantEvents: string[];
	associatedCharacters: string[];
	changesOverTime: string[];
	evidenceLevel: BibleEvidenceLevel;
	sourceEvidence?: string | null;
}

export interface StoryBibleEntity {
	id: string;
	storyBibleId: string;
	name: string;
	category: EntityCategory | string;
	description?: string | null;
	currentOwner?: string | null;
	currentLocation?: string | null;
	condition: string;
	transferHistory: Array<{ from?: string; to?: string; sceneRef?: string; description: string }>;
	evidenceLevel: BibleEvidenceLevel;
	sourceEvidence?: string | null;
}

export interface NarrativeTimelineEvent {
	id: string;
	storyBibleId: string;
	title: string;
	description?: string | null;
	eventType: TimelineEventType | string;
	chronologicalOrder: number;
	screenplayOrder?: number | null;
	isFlashback: boolean;
	isParallel: boolean;
	timingCertainty: TimingCertainty | string;
	narrativeTimeLabel?: string | null;
	timeJumpBefore?: string | null;
	relatedCharacters: string[];
	relatedLocations: string[];
	relatedObjects: string[];
	sourceActNumber?: number | null;
	sourceSceneId?: string | null;
	causalImpact?: string | null;
	storyImpact?: string | null;
	evidenceLevel: BibleEvidenceLevel;
	sourceEvidence?: string | null;
}

export interface StoryBibleSceneConnection {
	id: string;
	storyBibleId: string;
	sceneId?: string | null;
	sceneNumber: number;
	sceneTitle: string;
	locationName?: string | null;
	narrativeTime?: string | null;
	charactersPresent: string[];
	importantEvents: string[];
	characterDecisions: string[];
	consequences: string[];
	relationshipDevelopments: string[];
	arcDevelopments: string[];
	objectsIntroduced: string[];
	objectsUsed: string[];
	objectsTransferred: string[];
	objectsLost: string[];
	setupPayoffLinks: Array<{ type: 'SETUP' | 'PAYOFF'; targetSceneNumber?: number | null; description: string }>;
	previousDependencies: string[];
	subsequentDependencies: string[];
	narrativeImpactSummary?: string | null;
	evidenceLevel: BibleEvidenceLevel;
}

export interface ContinuityFinding {
	id: string;
	storyBibleId: string;
	category: ContinuityCategory | string;
	classification: ContinuityClassification | string;
	severity: ContinuitySeverity | string;
	title: string;
	description: string;
	affectedSceneIds: string[];
	relatedEntityIds: string[];
	conflictingEntries: string[];
	supportingEvidence?: string | null;
	whyItMatters?: string | null;
	suggestedResolution?: string | null;
	confidenceScore: number;
	status: ContinuityStatus;
	resolutionNote?: string | null;
	resolvedByUserId?: string | null;
	resolvedAt?: string | null;
	createdAt: string;
}

export interface MemoryUpdateProposal {
	id: string;
	storyBibleId: string;
	targetType: MemoryTargetType | string;
	targetId?: string | null;
	targetLabel: string;
	proposedAction: 'CREATE' | 'UPDATE' | 'FLAG_REVIEW' | string;
	previousValue?: Record<string, any> | null;
	proposedValue: Record<string, any>;
	changeReason: string;
	sourceType: string;
	sourceReference?: string | null;
	evidenceLevel: BibleEvidenceLevel;
	affectedSceneIds: string[];
	potentialConflicts: string[];
	status: ProposalStatus;
	reviewedByUserId?: string | null;
	reviewedAt?: string | null;
	createdAt: string;
}

export interface StoryBibleVersion {
	id: string;
	storyBibleId: string;
	versionNumber: number;
	targetType: string;
	targetId?: string | null;
	previousValue?: any;
	proposedValue?: any;
	approvedValue?: any;
	changeReason: string;
	source: string;
	relatedEntity?: string | null;
	approvedByUserId?: string | null;
	approvedByUser?: { id: string; name: string; email: string } | null;
	createdAt: string;
}

export interface StoryBible {
	id: string;
	movieId: string;
	title: string;
	premise?: string | null;
	logline?: string | null;
	synopsis?: string | null;
	genre?: string | null;
	themes: string[];
	settingSummary?: string | null;
	worldRules: WorldRuleItem[];
	historicalBackground?: string | null;
	narrativeFacts: NarrativeFactItem[];
	currentVersion: number;
	analysisStatus: 'INITIALIZED' | 'COMPLETE' | 'PARTIAL' | 'STALE' | string;
	isPartialAnalysis: boolean;
	chunksProcessed: number;
	totalChunks: number;
	lastAnalyzedAt?: string | null;
	createdAt: string;
	updatedAt: string;
	characters: StoryBibleCharacter[];
	relationships: StoryBibleRelationship[];
	locations: StoryBibleLocation[];
	entities: StoryBibleEntity[];
	timelineEvents: NarrativeTimelineEvent[];
	sceneConnections: StoryBibleSceneConnection[];
	continuityFindings: ContinuityFinding[];
	proposals: MemoryUpdateProposal[];
	versions: StoryBibleVersion[];
}

export interface BuildStoryBibleRequest {
	analysisId?: string;
	intelligenceId?: string;
	sourceText?: string;
	mode?: 'INITIALIZE' | 'MERGE_PROPOSALS';
}

export interface NarrativeContextBundle {
	movieId: string;
	storyBibleId: string;
	estimatedTokens: number;
	tokenBudget: number;
	truncated: boolean;
	storyIdentity: {
		title: string;
		premise?: string | null;
		logline?: string | null;
		genre?: string | null;
		themes: string[];
		settingSummary?: string | null;
		worldRules: WorldRuleItem[];
		keyFacts: NarrativeFactItem[];
	};
	relevantCharacters: any[];
	relevantRelationships: any[];
	relevantLocations: any[];
	relevantEntities: any[];
	timelineConstraints: any[];
	relatedSceneConnections: any[];
	unresolvedContinuityWarnings: any[];
}

