import { LoadingState } from '@/components/feedback/LoadingState'

export type RouteLoadingFallbackProps = {
  title?: string
  message?: string
}

export const RouteLoadingFallback = ({
  title = 'Loading module...',
  message = 'Please wait while this section is loaded on demand.',
}: RouteLoadingFallbackProps) => {
  return (
    <div className="mx-auto w-full max-w-4xl py-6">
      <LoadingState title={title} message={message} />
    </div>
  )
}
