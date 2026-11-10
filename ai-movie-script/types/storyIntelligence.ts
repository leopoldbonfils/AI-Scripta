/**
 * FilmForge AI — Phase C: Story & Character Intelligence Types (Frontend)
 */

export type EvidenceLevel = 'SOURCE_FACT' | 'ANALYSIS' | 'SUGGESTION';

export type SuggestionCategory =
	| 'STORY_CONCEPT'
	| 'PLOT_DEVELOPMENT'
	| 'CHARACTER_PROFILE'
	| 'CHARACTER_MOTIVATION'
	| 'CHARACTER_RELATIONSHIP'
	| 'CHARACTER_ARC'
	| 'STORY_STRUCTURE'
	| 'NARRATIVE_CONSISTENCY';

export type SuggestionDecision = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface StoryIntelligenceSuggestion {
	id: string;
	category: SuggestionCategory;
	title: string;
	description: string;
	explanation: string;
	evidenceLevel: EvidenceLevel;
	sourceReference?: string;
	status: SuggestionDecision;
	potentialImpact: string;
	editedContent?: string;
	alternatives?: string[];
}

export interface StoryExpansionOption {
	id: string;
	name: string;
	directionType: 'CHARACTER_DRIVEN' | 'CONFLICT_DRIVEN' | 'MYSTERY_DRIVEN' | 'THEMATIC';
	summary: string;
	changes: string;
	rationale: string;
	opportunities: string[];
	risks: string[];
}

export interface CoreStoryDevelopment {
	refinedPremise: string;
	expandedConcept: string;
	centralDramaticQuestion: string;
	mainConflict: string;
	centralTheme: string;
	narrativeStakes: string;
	protagonistObjective: string;
	mainObstacles: string[];
	antagonisticForces: string;
	expansionOptions: StoryExpansionOption[];
}

export interface PlotMajorEvent {
	id: string;
	name: string;
	phase:
		| 'INCITING_INCIDENT'
		| 'RISING_ACTION'
		| 'FIRST_TURNING_POINT'
		| 'MIDPOINT'
		| 'CRISIS'
		| 'CLIMAX'
		| 'RESOLUTION';
	description: string;
	consequences: string;
}

export interface PlotDevelopment {
	mainPlot: string;
	secondaryPlots: string[];
	subplots: string[];
	majorEvents: PlotMajorEvent[];
}

export interface CharacterProfile {
	id: string;
	name: string;
	role: 'PROTAGONIST' | 'ANTAGONIST' | 'DEUTERAGONIST' | 'MENTOR' | 'ALLY' | 'FOIL' | 'SUPPORTING';
	characterType: string;
	age?: string;
	background: string;
	personality: string[];
	importantHistory: string;
	socialFamilyContext: string;
	psychology: {
		externalGoal: string;
		internalNeed: string;
		motivation: string;
		greatestFear: string;
		weaknesses: string[];
		strengths: string[];
		emotionalWounds: string;
		internalConflict: string;
		beliefsAndValues: string[];
		secrets?: string;
	};
	behavior: {
		reactionToPressure: string;
		decisionMakingStyle: string;
		avoidanceBehaviors: string;
		vulnerabilities: string;
		catalystsForChange: string;
		interpersonalImpact: string;
	};
	evolution: {
		startingWorldview: string;
		initialEmotionalState: string;
		majorChallenges: string[];
		criticalDecisions: string[];
		transformations: string;
		finalState: string;
	};
	evidenceClassification: {
		explicitSourceFacts: string[];
		interpretations: string[];
		proposedDevelopments: string[];
	};
}

export interface CharacterMotivationDetail {
	characterId: string;
	characterName: string;
	explicitGoal: string;
	underlyingNeed: string;
	rootReason: string;
	preventingObstacles: string[];
	fearOfLoss: string;
	sacrificeThreshold: string;
	moralEmotionalDilemma: string;
	goalBehaviorContradictions?: string;
	interCharacterClashes: Array<{
		opposingCharacterName: string;
		conflictReason: string;
	}>;
}

export type RelationshipType =
	| 'FAMILY'
	| 'FRIENDSHIP'
	| 'ROMANCE'
	| 'RIVALRY'
	| 'ENEMIES'
	| 'MENTORSHIP'
	| 'PROFESSIONAL'
	| 'POLITICAL'
	| 'BETRAYAL'
	| 'DEPENDENCY'
	| 'ALLIANCE';

export interface CharacterRelationshipDetail {
	id: string;
	characterA: string;
	characterB: string;
	relationshipType: RelationshipType;
	history: string;
	characterAWantsFromB: string;
	characterBWantsFromA: string;
	trustLevel: number;
	tensionLevel: number;
	sharedInterests: string[];
	conflictingInterests: string[];
	powerDynamics: string;
	sourcesOfTension: string[];
	evolutionTrajectory: string;
	keyEventsAffecting: string[];
	isProposedRelationship: boolean;
}

export type ArcType =
	| 'POSITIVE_TRANSFORMATION'
	| 'NEGATIVE_TRANSFORMATION'
	| 'FLAT'
	| 'TRAGIC'
	| 'REDEMPTION'
	| 'CORRUPTION'
	| 'COMING_OF_AGE';

export interface CharacterArcDetail {
	characterId: string;
	characterName: string;
	arcType: ArcType;
	startingState: string;
	initialBeliefLie: string;
	internalWeakness: string;
	externalChallenge: string;
	turningPoints: string[];
	majorDecisions: string[];
	momentOfCrisis: string;
	transformationResolution: string;
	finalState: string;
	thematicAlignment: string;
	alternativeArc?: {
		arcType: ArcType;
		description: string;
		rationale: string;
	};
}

export type StoryFrameworkType =
	| 'THREE_ACT'
	| 'FIVE_ACT'
	| 'HEROS_JOURNEY'
	| 'NONLINEAR'
	| 'MYSTERY'
	| 'TRAGEDY'
	| 'EPISODIC'
	| 'CHARACTER_DRIVEN';

export interface StoryBeatDetail {
	id: string;
	beatName: string;
	actOrPhase: string;
	summary: string;
	charactersInvolved: string[];
	dramaticSignificance: string;
	leadingFrom: string;
	influencing: string;
}

export interface StoryStructureDetail {
	framework: StoryFrameworkType;
	frameworkExplanation: string;
	beats: StoryBeatDetail[];
	pacingAssessment: string;
	missingTransitions: string[];
	structuralInconsistencies: string[];
	recommendedImprovements: string[];
}

export type ConsistencyCheckType =
	| 'OUT_OF_CHARACTER'
	| 'UNEARNED_RELATIONSHIP_SHIFT'
	| 'INSUFFICIENT_ARC_TURNING_POINTS'
	| 'CONSEQUENCE_FREE_EVENT'
	| 'CHARACTER_CONTRADICTION'
	| 'DROPPED_CONFLICT'
	| 'UNEXPLAINED_GOAL_CHANGE'
	| 'THEMATIC_MISALIGNMENT';

export interface NarrativeConsistencyCheck {
	id: string;
	checkType: ConsistencyCheckType;
	severity: 'HIGH' | 'MEDIUM' | 'LOW';
	title: string;
	description: string;
	charactersInvolved: string[];
	impactExplanation: string;
	suggestedCorrection: string;
}

export interface StoryIntelligenceResult {
	intelligenceId: string;
	analysisId?: string;
	movieId?: string;
	storyDevelopment: CoreStoryDevelopment;
	plotDevelopment: PlotDevelopment;
	characters: CharacterProfile[];
	motivations: CharacterMotivationDetail[];
	relationships: CharacterRelationshipDetail[];
	characterArcs: CharacterArcDetail[];
	storyStructure: StoryStructureDetail;
	consistencyChecks: NarrativeConsistencyCheck[];
	suggestions: StoryIntelligenceSuggestion[];
	createdAt: string;
	updatedAt: string;
}

export type IntelligenceSection =
	| 'STORY_EXPANSION'
	| 'PLOT_DEVELOPMENT'
	| 'CHARACTERS'
	| 'MOTIVATIONS'
	| 'RELATIONSHIPS'
	| 'ARCS'
	| 'STRUCTURE'
	| 'CONSISTENCY';

export interface GenerateStoryIntelligenceRequest {
	analysisId?: string;
	movieId?: string;
	preferredFramework?: StoryFrameworkType;
	focusDirections?: string[];
	additionalInstructions?: string;
}

export interface RegenerateSectionRequest {
	section: IntelligenceSection;
	characterName?: string;
	customInstructions?: string;
}

export interface UpdateSuggestionStatusRequest {
	status: SuggestionDecision;
	editedContent?: string;
}

export interface ApplyIntelligenceDecisionRequest {
	applyToStory?: boolean;
	applyCharacters?: boolean;
	selectedCharacterIds?: string[];
	selectedSuggestionIds?: string[];
}

export interface ApplyIntelligenceDecisionResponse {
	message: string;
	appliedEntities: {
		story: boolean;
		charactersCreated: number;
		charactersUpdated: number;
		appliedSuggestionIds?: string[];
	};
}
