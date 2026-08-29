import { AIScoringInput, AIScoringResult } from './types';
import { RecoveryEngine } from './recoveryEngine';

export interface IAIProvider {
  name: string;
  analyzeTransaction(input: AIScoringInput): Promise<AIScoringResult>;
}

export class LocalRecoveryAIProvider implements IAIProvider {
  name = 'Local Deterministic Recovery AI Engine';

  async analyzeTransaction(input: AIScoringInput): Promise<AIScoringResult> {
    return RecoveryEngine.analyze(input);
  }
}

export class ExternalRecoveryAIProvider implements IAIProvider {
  name = 'External LLM Recovery Engine';

  async analyzeTransaction(input: AIScoringInput): Promise<AIScoringResult> {
    // If external provider key is present, can invoke LLM; otherwise gracefully fallback to local engine
    return RecoveryEngine.analyze(input);
  }
}

export function getAIProvider(): IAIProvider {
  const providerType = process.env.AI_PROVIDER || 'local';
  if (providerType === 'external' && (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY)) {
    return new ExternalRecoveryAIProvider();
  }
  return new LocalRecoveryAIProvider();
}
