import pokemonApi from '@/api/pokemonApi.js'

const sample = (max, count, exclude = []) => {
  const excludeSet = new Set(exclude)
  let excludedInRange = 0
  excludeSet.forEach((id) => { if (id >= 1 && id <= max) excludedInRange += 1 })
  // if excluding would leave too few pokémon, ignore the exclusion
  const useExclude = (max - excludedInRange) >= count

  const ids = new Set()
  while (ids.size < count) {
    const id = 1 + Math.floor(Math.random() * max)
    if (useExclude && excludeSet.has(id)) continue
    ids.add(id)
  }
  return [...ids]
}

const cleanFlavor = (text) => text
  ?.replace(/[\f\n\r]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim() || ''

const fetchPokemon = async (id) => {
  const [pokemonRes, speciesRes] = await Promise.all([
    pokemonApi.get(`/pokemon/${id}`),
    pokemonApi.get(`/pokemon-species/${id}`)
  ])
  const data = pokemonRes.data
  const species = speciesRes.data
  const artwork = data.sprites.other['official-artwork']

  const flavorEs = species.flavor_text_entries.find((f) => f.language.name === 'es')
    || species.flavor_text_entries.find((f) => f.language.name === 'en')
  const generaEs = species.genera.find((g) => g.language.name === 'es')
    || species.genera.find((g) => g.language.name === 'en')

  const statMap = {}
  data.stats.forEach((s) => { statMap[s.stat.name] = s.base_stat })

  return {
    id: data.id,
    name: data.name,
    types: data.types.map((t) => t.type.name),
    sprite: artwork?.front_default
      || data.sprites.other.dream_world?.front_default
      || data.sprites.front_default,
    spriteShiny: artwork?.front_shiny
      || data.sprites.other.home?.front_shiny
      || data.sprites.front_shiny,
    cry: data.cries?.latest || data.cries?.legacy || null,
    height: data.height / 10,
    weight: data.weight / 10,
    stats: {
      hp: statMap.hp || 0,
      attack: statMap.attack || 0,
      defense: statMap.defense || 0,
      spAttack: statMap['special-attack'] || 0,
      spDefense: statMap['special-defense'] || 0,
      speed: statMap.speed || 0
    },
    isLegendary: !!species.is_legendary,
    isMythical: !!species.is_mythical,
    color: species.color?.name || null,
    habitat: species.habitat?.name || null,
    genera: (generaEs?.genus || '').replace(/^Pok[eé]mon\s+/i, ''),
    flavorText: cleanFlavor(flavorEs?.flavor_text)
  }
}

export const getPokemonOptions = async ({ count = 4, maxId = 386, exclude = [] } = {}) => {
  const ids = sample(maxId, count, exclude)
  const pokemons = await Promise.all(ids.map(fetchPokemon))
  return pokemons
}

export default getPokemonOptions
