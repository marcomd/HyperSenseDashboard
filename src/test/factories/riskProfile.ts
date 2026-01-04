import type { RiskProfile, RiskProfileName, RiskProfileParameters } from '@/types'

// Preset parameters for each profile (matches backend settings.yml)
const PROFILE_PARAMS: Record<RiskProfileName, RiskProfileParameters> = {
  cautious: {
    rsi_oversold: 35,
    rsi_overbought: 65,
    rsi_pullback_threshold: 60,
    rsi_bounce_threshold: 40,
    min_risk_reward_ratio: 2.0,
    min_confidence: 0.7,
    max_position_size: 0.03,
    default_leverage: 2,
    max_open_positions: 3,
  },
  moderate: {
    rsi_oversold: 30,
    rsi_overbought: 70,
    rsi_pullback_threshold: 65,
    rsi_bounce_threshold: 35,
    min_risk_reward_ratio: 1.5,
    min_confidence: 0.6,
    max_position_size: 0.05,
    default_leverage: 3,
    max_open_positions: 5,
  },
  fearless: {
    rsi_oversold: 25,
    rsi_overbought: 75,
    rsi_pullback_threshold: 68,
    rsi_bounce_threshold: 32,
    min_risk_reward_ratio: 1.2,
    min_confidence: 0.5,
    max_position_size: 0.08,
    default_leverage: 5,
    max_open_positions: 7,
  },
}

interface RiskProfileOverrides {
  name?: RiskProfileName
  parameters?: Partial<RiskProfileParameters>
  updated_at?: string
}

/**
 * Creates a mock RiskProfile object for testing.
 * Parameters are automatically derived from the profile name.
 */
export function createRiskProfile(overrides: RiskProfileOverrides = {}): RiskProfile {
  const name = overrides.name ?? 'moderate'
  const baseParams = PROFILE_PARAMS[name]

  return {
    name,
    parameters: {
      ...baseParams,
      ...overrides.parameters,
    },
    updated_at: overrides.updated_at ?? new Date().toISOString(),
  }
}

/**
 * Returns the default parameters for a given profile name.
 */
export function getProfileParams(name: RiskProfileName): RiskProfileParameters {
  return { ...PROFILE_PARAMS[name] }
}
