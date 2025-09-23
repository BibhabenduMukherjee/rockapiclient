declare module 'reactour' {
  import { ReactNode } from 'react';

  interface TourStep {
    selector: string;
    content: ReactNode;
    position?: 'top' | 'right' | 'bottom' | 'left' | 'center';
    style?: React.CSSProperties;
  }

  interface TourProps {
    steps: TourStep[];
    isOpen: boolean;
    onRequestClose: () => void;
    goToStep?: number;
    nextButton?: ReactNode;
    prevButton?: ReactNode;
    closeButton?: ReactNode;
    showNavigation?: boolean;
    showButtons?: boolean;
    showNumber?: boolean;
    showBadge?: boolean;
    accentColor?: string;
    className?: string;
    maskClassName?: string;
    highlightedMaskClassName?: string;
  }

  const Tour: React.FC<TourProps>;
  export default Tour;
}
