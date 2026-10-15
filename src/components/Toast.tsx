import { useEffect } from 'react'
import './Toast.css'

export interface ToastData {
  type: 'success' | 'error'
  message: string
}

interface ToastProps extends ToastData {
  onClose: () => void
  duration?: number
}

export default function Toast({ type, message, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  return (
    <div className={`toast toast--${type}`} role="status">
      <span className="msr toast__icon">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={onClose} aria-label="Cerrar">
        <span className="msr">close</span>
      </button>
    </div>
  )
}
