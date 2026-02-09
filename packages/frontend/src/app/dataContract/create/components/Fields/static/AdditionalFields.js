import { Checkbox, Wrap, WrapItem } from '@chakra-ui/react'

const fieldList = [
  {
    label: 'Mutable',
    name: 'mutable'
  },

  {
    label: 'Keep History',
    name: 'history'
  },
  {
    label: 'Can Be Delted',
    name: 'isDeletable'
  },
  {
    label: 'Transferablee',
    name: 'transferablee'
  },
  {
    label: 'Document Creation Restricted',
    name: 'restricted'
  }]

const CheckboxField = ({ label, name }) => (
    <Checkbox.Root>
        <Checkbox.Label>{label}</Checkbox.Label>
        <Checkbox.Control />
        <Checkbox.HiddenInput />
    </Checkbox.Root>
)

export const AdditionalFields = () => (
    <Wrap>
        {
            fieldList.map(({ name, label }) => (
                <WrapItem key={name}>
                    <CheckboxField name={name} label={label} />
                </WrapItem>
            ))
        }
    </Wrap>
)
