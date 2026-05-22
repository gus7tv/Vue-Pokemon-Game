export const HOLO_STYLES = {
  SHINE: 'shine',
  RAINBOW: 'rainbow',
  GALAXY: 'galaxy'
}

const RAINBOW_TYPES = new Set(['dragon', 'psychic', 'fairy', 'ghost', 'steel'])

export const getHoloStyle = (pokemon) => {
  if (!pokemon) return HOLO_STYLES.SHINE
  if (pokemon.isLegendary || pokemon.isMythical) return HOLO_STYLES.GALAXY
  if (pokemon.types?.some((t) => RAINBOW_TYPES.has(t))) return HOLO_STYLES.RAINBOW
  return HOLO_STYLES.SHINE
}

export const HOLO_LABELS = {
  [HOLO_STYLES.SHINE]: 'Holo Shine',
  [HOLO_STYLES.RAINBOW]: 'Holo Rainbow',
  [HOLO_STYLES.GALAXY]: 'Galaxy Rare'
}
