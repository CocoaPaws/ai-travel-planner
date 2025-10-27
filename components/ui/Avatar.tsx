// components/ui/Avatar.tsx
import React from 'react';
import styles from './Avatar.module.css';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={`${styles.avatar} ${className}`} {...props}>
        {children}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar };