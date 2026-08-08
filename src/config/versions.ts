export const PRODUCT_VERSIONS = {
  assessmentVersion: '1.0.0',
  talentModelVersion: '1.0.0',
  careerDatasetVersion: '1.0.0',
  matchingEngineVersion: '1.0.0',
  explanationVersion: '1.1.0',
  betaFeedbackSchemaVersion: 1,
  storageSchemaVersion: 3,
} as const;

export interface ResultVersionInfo {
  assessmentVersion: string;
  talentModelVersion: string;
  careerDatasetVersion: string;
  matchingEngineVersion: string;
  explanationVersion: string;
  storageSchemaVersion: number;
}

export const CURRENT_RESULT_VERSIONS: ResultVersionInfo = {
  assessmentVersion: PRODUCT_VERSIONS.assessmentVersion,
  talentModelVersion: PRODUCT_VERSIONS.talentModelVersion,
  careerDatasetVersion: PRODUCT_VERSIONS.careerDatasetVersion,
  matchingEngineVersion: PRODUCT_VERSIONS.matchingEngineVersion,
  explanationVersion: PRODUCT_VERSIONS.explanationVersion,
  storageSchemaVersion: PRODUCT_VERSIONS.storageSchemaVersion,
};
