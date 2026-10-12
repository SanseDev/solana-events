import { actionDockLayout } from '../eventDetailsActionBarLayout'

describe('actionDockLayout', () => {
  it('keeps all actions in one row at normal scale on a 360 dp screen', () => {
    expect(actionDockLayout(360, 1, 'Register')).toBe('row')
  })

  it('stacks actions below 360 dp', () => {
    expect(actionDockLayout(359, 1, 'Register')).toBe('stacked')
  })

  it('stacks actions above 115% text scale so labels remain readable', () => {
    expect(actionDockLayout(412, 1.16, 'Register')).toBe('stacked')
  })

  it('stacks a long primary label instead of squeezing any action label', () => {
    expect(actionDockLayout(412, 1, 'View official source')).toBe('stacked')
  })
})
