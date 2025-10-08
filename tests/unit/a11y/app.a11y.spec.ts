import { describe, it, expect } from 'vitest'
import { JSDOM } from 'jsdom'
import axeCore from 'axe-core'

describe('a11y smoke', () => {
  it('root page has no critical violations', async () => {
    const dom = new JSDOM('<main><h1>Material Planner</h1></main>', { pretendToBeVisual: true })
    ;(dom.window as any).axe = axeCore
    const results = await (dom.window as any).axe.run(dom.window.document)
    expect(results.violations.filter((v: any) => v.impact === 'critical')).toEqual([])
  })
})


