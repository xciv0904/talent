export const PRODUCT_VERSIONS = {
  assessmentVersion: '1.1.0',
  talentModelVersion: '2.0.0',
  careerDatasetVersion: '1.0.0',
  matchingEngineVersion: '2.1.0',
  explanationVersion: '1.2.0',
  betaFeedbackSchemaVersion: 2,
  storageSchemaVersion: 5,
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
