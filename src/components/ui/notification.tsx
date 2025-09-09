import React from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface NotificationProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
  autoClose?: boolean;
  duration?: number;
}

const Notification: React.FC<NotificationProps> = ({
  type = 'info',
  title,
  message,
  onClose,
  className,
  autoClose = false,
  duration = 5000
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getTypeClasses = () => {
    switch (type) {
      case 'success':
        return 'notification-success';
      case 'error':
        return 'notification-error';
      case 'warning':
        return 'notification-warning';
      case 'info':
      default:
        return 'notification-info';
    }
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      'notification-panel',
      getTypeClasses(),
      isVisible ? 'animate-slide-in-down' : 'animate-slide-out-up',
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="notification-icon">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className="notification-title">
              {title}
            </h4>
          )}
          <p className="notification-message">
            {message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={handleClose}
            className="notification-close"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Notification;
export { Notification };