import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg glass-morphism border border-primary/30 px-3 py-2 text-sm font-exo text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-glow focus-visible:border-neon-cyan focus-visible:glow-primary focus-visible:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300 hover:border-primary/50 hover:glow-primary/30 backdrop-blur-sm resize-none',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
