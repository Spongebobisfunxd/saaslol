'use client';

import { Card, CardContent } from '@loyalty/ui';
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react';
import { cn } from '@loyalty/ui';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  className,
}: MetricCardProps) {
  const isPositive = change >= 0;

  return (
    <Card
      className={cn(
        'card-editorial group overflow-hidden border-0 transition-all duration-300',
        className,
      )}
      style={{
        backgroundColor: 'var(--surface)',
        borderTop: '1px solid rgba(212, 168, 83, 0.08)',
      }}
    >
      {/* Subtle gold top accent */}
      <div
        className="h-[1px] w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
        }}
      />
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <p
              className="text-sm font-medium tracking-wide uppercase"
              style={{
                color: 'var(--warm-gray)',
                fontSize: '0.7rem',
                letterSpacing: '0.08em',
              }}
            >
              {title}
            </p>
            <p
              className="text-2xl tracking-tight"
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--cream)',
              }}
            >
              {value}
            </p>
          </div>
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105"
            style={{
              backgroundColor: 'rgba(212, 168, 83, 0.08)',
              border: '1px solid rgba(212, 168, 83, 0.1)',
            }}
          >
            <Icon className="h-5 w-5" style={{ color: 'var(--gold)' }} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-1.5 text-sm">
          {isPositive ? (
            <div
              className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5"
              style={{ backgroundColor: 'rgba(74, 222, 128, 0.08)' }}
            >
              <ArrowUpRight className="h-3.5 w-3.5" style={{ color: '#4ade80' }} />
              <span className="text-xs font-medium" style={{ color: '#4ade80' }}>
                +{change.toFixed(1)}%
              </span>
            </div>
          ) : (
            <div
              className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)' }}
            >
              <ArrowDownRight className="h-3.5 w-3.5 text-destructive" />
              <span className="text-xs font-medium text-destructive">
                {change.toFixed(1)}%
              </span>
            </div>
          )}
          <span className="text-xs" style={{ color: 'var(--warm-gray)' }}>
            vs poprzedni okres
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
