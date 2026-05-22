export const DIFFICULTIES = {
  easy: {
    key: 'easy',
    label: 'Fácil',
    description: 'Gen 1 · 4 opciones · 15s',
    options: 4,
    maxPokemonId: 151,
    durationMs: 15000,
    pointsBase: 50,
    timeBonus: 2
  },
  normal: {
    key: 'normal',
    label: 'Normal',
    description: 'Gen 1-3 · 4 opciones · 10s',
    options: 4,
    maxPokemonId: 386,
    durationMs: 10000,
    pointsBase: 100,
    timeBonus: 5
  },
  hard: {
    key: 'hard',
    label: 'Difícil',
    description: 'Hasta Gen 5 · 6 opciones · 7s',
    options: 6,
    maxPokemonId: 649,
    durationMs: 7000,
    pointsBase: 200,
    timeBonus: 10
  }
}

export const calcPoints = (config, remainingMs, streak) => {
  const timeSeconds = Math.max(0, remainingMs / 1000)
  const streakMultiplier = 1 + Math.min(streak, 10) * 0.1
  const raw = config.pointsBase + timeSeconds * config.timeBonus
  return Math.round(raw * streakMultiplier)
}
