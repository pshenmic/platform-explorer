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

export const AdditionalFields = () => (
    <Wrap>
        {
            fieldList.map(({ name, label }) => (
                <WrapItem key={name}>
                    <Checkbox name={name} >{label}</Checkbox>
                </WrapItem>
            ))
        }
    </Wrap>
)
