import { Input } from '@chakra-ui/react'
import { useState } from 'react'

export const KeywordsScreen = () => {
  const [form, setForm] = useState({ name: '' })

  return (
        <form>
            <label>
                Data Contract Name:
                <Input value={form.name} onChange={(e) => setForm({ name: e.target.value })}/>
            </label>
        </form>
  )
}
