import { useState, useRef, useEffect, type ReactNode } from 'react';
import clsx from 'clsx';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
  /** Content to display inside the tooltip */
  content: ReactNode;
  /** Element that triggers the tooltip on hover */
  children: ReactNode;
  /** Position of the tooltip relative to the trigger element */
  position?: TooltipPosition;
  /** Additional CSS classes for the tooltip container */
  className?: string;
  /** Delay in ms before showing tooltip (default: 200) */
  delay?: number;
}

/**
 * A reusable tooltip component that displays content on hover.
 *
 * @example
 * <Tooltip content="This is helpful info">
 *   <InfoIcon className="w-4 h-4" />
 * </Tooltip>
 *
 * @example
 * <Tooltip
 *   content={<div>Rich <strong>content</strong></div>}
 *   position="right"
 * >
 *   <button>Hover me</button>
 * </Tooltip>
 */
export function Tooltip({
  content,
  children,
  position = 'top',
  className,
  delay = 200,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const positionClasses: Record<TooltipPosition, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses: Record<TooltipPosition, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-slate-700 border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-slate-700 border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-slate-700 border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-slate-700 border-y-transparent border-l-transparent',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={clsx(
            'absolute z-50 px-3 py-2 text-sm rounded-lg shadow-lg',
            'bg-slate-700 text-slate-100 border border-slate-600',
            'whitespace-normal min-w-64 max-w-md',
            'animate-in fade-in-0 zoom-in-95 duration-150',
            positionClasses[position],
            className
          )}
        >
          {content}
          <span
            className={clsx(
              'absolute w-0 h-0 border-4',
              arrowClasses[position]
            )}
          />
        </div>
      )}
    </div>
  );
}
