export function handleError(error: unknown): void {
  const err = error as { code?: number }
  if (err.code === 4001) {
    console.error('Request rejected by user')
  } else if (err.code === -32002) {
    console.error('Request already pending')
  } else {
    console.error(error)
  }
}

export type Result = { label: string; value: string; url?: string }
