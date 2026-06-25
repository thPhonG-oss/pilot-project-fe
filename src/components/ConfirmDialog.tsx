import { useEffect, useId, useRef } from 'react'
import { useTranslation } from 'react-i18next'

type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  message: string
  confirmLabel: string
  isConfirming?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  isConfirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const messageId = useId()
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    cancelButtonRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !isConfirming) {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, isConfirming, onCancel])

  if (!isOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="presentation"
      onClick={() => {
        if (!isConfirming) {
          onCancel()
        }
      }}
    >
      <div
        className="w-full max-w-md rounded border border-slate-200 bg-white p-6 shadow-lg"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="mb-2 text-base font-semibold text-slate-700">
          {title}
        </h2>
        <p id={messageId} className="mb-6 text-sm text-slate-600">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            className="h-8 rounded border border-slate-300 bg-white px-4 text-sm text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isConfirming}
            onClick={onCancel}
          >
            {t('project.cancelButton')}
          </button>
          <button
            type="button"
            className="h-8 rounded border border-sky-700 bg-gradient-to-b from-sky-500 to-sky-700 px-4 text-sm font-semibold text-white hover:from-sky-600 hover:to-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isConfirming}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
