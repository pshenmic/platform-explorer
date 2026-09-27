'use client'
import type { PublicKeyBounds } from './PublicKeyBoundCard'

export interface PublicKey {
  keyId?: number | string
  publicKeyHash?: string
  keyType?: string | number
  purpose?: string | number
  securityLevel?: string | number
  disabledAt?: string | number | null
  readOnly?: boolean
  data?: string
  contractBounds?: PublicKeyBounds | null
}
import { DataList } from '../ui/lists'
import { Identifier, NotActive } from '../data'
import { ValueContainer } from '../ui/containers'
import { Tooltip } from '../ui/Tooltips'
import PublicKeyBoundCard from './PublicKeyBoundCard'
import * as pkEnums from '../../enums/publicKey'
import { formatDate } from '../../util'
import type { WithClassName } from '../../types/common'
interface PublicKeysListProps extends WithClassName {
  publicKeys?: PublicKey[]
}

export default function PublicKeysList({ publicKeys = [], className }: PublicKeysListProps) {
  return (
    <DataList
      items={publicKeys}
      className={className}
      rowKey={(item, index) => item.keyId ?? String(index)}
      emptyMessage="There are no public keys"
      columns={[
        { key: 'id', header: 'Key Id', minWidth: 64, cell: item => item.keyId ?? <NotActive /> },
        {
          key: 'hash',
          header: 'Public Key Hash',
          minWidth: 180,
          grow: true,
          cell: item =>
            item.publicKeyHash !== undefined ? (
              <Identifier ellipsis copyButton>
                {item.publicKeyHash}
              </Identifier>
            ) : (
              <NotActive />
            )
        },
        {
          key: 'type',
          header: 'Type',
          minWidth: 100,
          cell: item =>
            item.keyType !== undefined ? (
              <ValueContainer colorScheme="gray" size="sm">
                {item.keyType}
              </ValueContainer>
            ) : (
              <NotActive />
            )
        },
        {
          key: 'purpose',
          header: 'Purpose',
          minWidth: 140,
          cell: item => {
            const info = pkEnums.KeyPurposeInfo[item.purpose as keyof typeof pkEnums.KeyPurposeInfo]
            return info ? (
              <ValueContainer
                colorScheme={info.colorScheme as 'blue' | 'green' | 'orange' | 'gray' | 'red'}
                size="sm"
              >
                {info.title}
              </ValueContainer>
            ) : (
              <NotActive />
            )
          }
        },
        {
          key: 'security',
          header: 'Security Level',
          minWidth: 130,
          cell: item => {
            const info =
              pkEnums.SecurityLevelInfo[
                item.securityLevel as keyof typeof pkEnums.SecurityLevelInfo
              ]
            return info ? (
              <ValueContainer
                colorScheme={info.colorScheme as 'blue' | 'green' | 'orange' | 'gray' | 'red'}
                size="sm"
              >
                {info.title}
              </ValueContainer>
            ) : (
              <NotActive />
            )
          }
        },
        {
          key: 'disabled',
          header: 'Disabled',
          minWidth: 90,
          cell: item =>
            item.disabledAt ? (
              <Tooltip title="Disabled at" content={formatDate(item.disabledAt)?.formatted}>
                <span>
                  <ValueContainer colorScheme="red" size="sm">
                    True
                  </ValueContainer>
                </span>
              </Tooltip>
            ) : (
              <ValueContainer colorScheme="green" size="sm">
                False
              </ValueContainer>
            )
        },
        {
          key: 'readOnly',
          header: 'Read Only',
          minWidth: 90,
          cell: item =>
            item.readOnly !== undefined ? (
              <ValueContainer colorScheme={item.readOnly ? 'red' : 'green'} size="sm">
                {item.readOnly ? 'True' : 'False'}
              </ValueContainer>
            ) : (
              <NotActive />
            )
        },
        {
          key: 'data',
          header: 'Data',
          minWidth: 200,
          grow: true,
          cell: item => (
            <div>
              {item.data !== undefined ? (
                <Identifier ellipsis copyButton>
                  {item.data}
                </Identifier>
              ) : (
                <NotActive />
              )}
              {item.contractBounds && <PublicKeyBoundCard publicKeyBounds={item.contractBounds} />}
            </div>
          )
        }
      ]}
    />
  )
}
