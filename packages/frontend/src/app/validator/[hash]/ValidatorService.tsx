import { CopyButton } from '@components/ui/Buttons'
import { Tooltip } from '@components/ui/Tooltips'
import InfoLine from '@components/data/InfoLine'
import type { ValidatorEndpoints } from 'src/types/Validator'

export default function ValidatorService({
  endpoints,
  loading,
  error
}: {
  endpoints?: ValidatorEndpoints | null
  loading: boolean
  error: boolean
}) {
  const services = [
    { label: 'Core', endpoint: endpoints?.coreP2PPortStatus },
    { label: 'Platform', endpoint: endpoints?.platformP2PPortStatus },
    { label: 'gRPC', endpoint: endpoints?.platformGrpcPortStatus }
  ]

  return (
    <InfoLine
      className="ValidatorPage__Key ValidatorPage__ServiceRow"
      title="Service"
      postfix=""
      loading={loading}
      error={error}
      value={
        <div className="ValidatorPage__ServiceInline">
          <div
            className="ValidatorPage__ServiceEndpoints"
            aria-label="TCP checks from the explorer server"
          >
            {services.map(({ label, endpoint }) => {
              const status = loading || error ? 'UNKNOWN' : endpoint?.status || 'UNKNOWN'
              const result =
                status === 'OK' ? 'Reachable' : status === 'UNKNOWN' ? 'Unknown' : 'Unreachable'
              const endpointHost = endpoint?.host
              const grpcUrl =
                label === 'gRPC' && !error && endpointHost && endpoint?.port
                  ? `https://${endpointHost.includes(':') ? `[${endpointHost}]` : endpointHost}:${endpoint.port}`
                  : null
              return (
                <span className="ValidatorPage__ServiceEndpoint" key={label}>
                  <Tooltip
                    className="ValidatorPage__Tooltip"
                    content={`${label}: ${result}. TCP connection check.`}
                  >
                    <span
                      role="group"
                      aria-label={`${label} port ${endpoint?.port || 'unknown'}: ${result}`}
                      tabIndex={grpcUrl ? undefined : 0}
                      className={`ValidatorPage__ServiceEndpointValue${grpcUrl ? '' : ' ValidatorPage__Help'}`}
                    >
                      <span
                        className="ValidatorPage__EndpointDot"
                        data-status={status}
                        aria-hidden="true"
                      />
                      {grpcUrl ? (
                        <a
                          className="ValidatorPage__Link"
                          href={grpcUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${label} port ${endpoint?.port}: ${result}. Open endpoint in a new tab`}
                          title={grpcUrl}
                        >
                          {label}:{endpoint?.port}
                        </a>
                      ) : (
                        <span>
                          {label}:{endpoint?.port || '—'}
                        </span>
                      )}
                    </span>
                  </Tooltip>
                  {grpcUrl && (
                    <span title="Copy gRPC URL">
                      <CopyButton
                        className="Identifier__CopyButton"
                        text={grpcUrl}
                        aria-label="Copy gRPC URL"
                      />
                    </span>
                  )}
                </span>
              )
            })}
          </div>
        </div>
      }
    />
  )
}
