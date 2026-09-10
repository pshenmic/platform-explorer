'use client'

import { useState } from 'react'
import type { ComponentType } from 'react'
import Essentials from './Essentials'
import Features from './Features'
import Distribution from './Distribution'
import Advanced from './Advanced'
import './FormAccordion.css'

const SECTIONS: Array<{ id: string; label: string; Comp: ComponentType }> = [
  { id: 'basic', label: 'Basic Info', Comp: Essentials },
  { id: 'rules', label: 'Action Rules', Comp: Features },
  { id: 'distribution', label: 'Distribution', Comp: Distribution },
  { id: 'advanced', label: 'Advanced', Comp: Advanced }
]

function FormAccordion() {
  const [index, setIndex] = useState<number[]>([0])
  const allOpen = index.length === SECTIONS.length

  const toggleAll = () => setIndex(allOpen ? [] : SECTIONS.map((_, i) => i))

  const toggle = (i: number) => {
    setIndex(prev => (prev.includes(i) ? prev.filter(n => n !== i) : [...prev, i]))
  }

  return (
    <div className="FormAccordion">
      <div className="FormAccordion__Toolbar">
        <button type="button" className="FormAccordion__ToggleAll" onClick={toggleAll}>
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>
      {SECTIONS.map(({ id, label, Comp }, i) => {
        const open = index.includes(i)
        return (
          <div key={id} className="FormAccordion__Item">
            <button
              type="button"
              className="FormAccordion__Header"
              aria-expanded={open}
              onClick={() => toggle(i)}
            >
              <span className="FormAccordion__Title">{label}</span>
              <span className={`FormAccordion__Icon${open ? ' FormAccordion__Icon--open' : ''}`}>
                ▾
              </span>
            </button>
            {open ? (
              <div className="FormAccordion__Panel">
                <Comp />
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export default FormAccordion
