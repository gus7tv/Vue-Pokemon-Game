import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PokemonOptions from '@/components/PokemonOptions.vue'

const pokemons = [
  { id: 1, name: 'bulbasaur' },
  { id: 4, name: 'charmander' },
  { id: 7, name: 'squirtle' },
  { id: 25, name: 'pikachu' }
]

describe('PokemonOptions.vue', () => {
  it('renderiza un <li> por cada pokémon mostrando su nombre', () => {
    const wrapper = mount(PokemonOptions, { props: { pokemons } })
    const items = wrapper.findAll('li')

    expect(items).toHaveLength(pokemons.length)
    const names = wrapper.findAll('.option__name').map((w) => w.text())
    expect(names).toEqual(pokemons.map((p) => p.name))
  })

  it('emite "selection" con el id al hacer click en una opción', async () => {
    const wrapper = mount(PokemonOptions, { props: { pokemons } })

    await wrapper.findAll('li')[2].trigger('click')

    const emitted = wrapper.emitted('selection')
    expect(emitted).toBeTruthy()
    expect(emitted[0]).toEqual([pokemons[2].id])
  })
})
