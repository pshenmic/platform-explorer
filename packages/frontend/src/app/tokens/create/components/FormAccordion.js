'use client'

import { useState } from 'react'
import {
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box
} from '@chakra-ui/react'
import Essentials from './Essentials'
import Features from './Features'
import Distribution from './Distribution'
import Advanced from './Advanced'
import './FormAccordion.scss'

// Section names follow Dash Evo Tool. Groups / Document Schemas are Phase 2.
const SECTIONS = [
  { id: 'basic', label: 'Basic Info', Comp: Essentials },
  { id: 'rules', label: 'Action Rules', Comp: Features },
  { id: 'distribution', label: 'Distribution', Comp: Distribution },
  { id: 'advanced', label: 'Advanced', Comp: Advanced }
]

function FormAccordion () {
  // Controlled so "expand all" can drive every panel; Basic Info open by default.
  const [index, setIndex] = useState([0])
  const allOpen = index.length === SECTIONS.length

  const toggleAll = () => setIndex(allOpen ? [] : SECTIONS.map((_, i) => i))

  return (
    <div className='FormAccordion'>
      <div className='FormAccordion__Toolbar'>
        <button type='button' className='FormAccordion__ToggleAll' onClick={toggleAll}>
          {allOpen ? 'Collapse all' : 'Expand all'}
        </button>
      </div>
      <Accordion allowMultiple index={index} onChange={setIndex}>
        {SECTIONS.map(({ id, label, Comp }) => (
          <AccordionItem key={id} className='FormAccordion__Item'>
            <AccordionButton className='FormAccordion__Header'>
              <Box as='span' flex='1' textAlign='left' className='FormAccordion__Title'>
                {label}
              </Box>
              <AccordionIcon/>
            </AccordionButton>
            <AccordionPanel className='FormAccordion__Panel'>
              <Comp/>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}

export default FormAccordion
