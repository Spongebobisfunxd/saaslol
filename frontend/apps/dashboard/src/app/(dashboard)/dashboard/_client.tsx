'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useDashboardMetrics, useDailyAnalytics, useTransactions } from '@loyalty/api-client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
} from '@loyalty/ui';
import { MetricCard } from '@/components/metric-card';
import {
  Users,
  UserCheck,
  Coins,
  TrendingUp,
  Plus,
  Gift,
  Megaphone,
  BarChart3,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: dailyData, isLoading: chartLoading } = useDailyAnalytics({
    dateFrom: useMemo(() => {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return d.toISOString().split('T')[0];
    }, []),
    dateTo: useMemo(() => new Date().toISOString().split('T')[0], []),
  });
  const { data: transactionsData, isLoading: transactionsLoading } =
    useTransactions({ limit: 10, sortBy: 'createdAt', sortOrder: 'desc' });

  const chartData = useMemo(() => {
    if (!dailyData) return [];
    return dailyData.map((d) => ({
      date: new Date(d.date).toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
      }),
      przychod: d.revenueGrosze / 100,
      transakcje: d.transactions,
    }));
  }, [dailyData]);

  const formatCurrency = (grosze: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    }).format(grosze / 100);
  };

  const formatNumber = (n: number) => {
    return new Intl.NumberFormat('pl-PL').format(n);
  };

  const quickActions = [
    {
      label: 'Dodaj klienta',
      href: '/customers?action=create',
      icon: Plus,
      color: '#6366f1',
      bgColor: 'rgba(99, 102, 241, 0.08)',
    },
    {
      label: 'Nowa nagroda',
      href: '/rewards?action=create',
      icon: Gift,
      color: '#a855f7',
      bgColor: 'rgba(168, 85, 247, 0.08)',
    },
    {
      label: 'Nowa kampania',
      href: '/campaigns?action=create',
      icon: Megaphone,
      color: 'var(--gold)',
      bgColor: 'rgba(212, 168, 83, 0.08)',
    },
    {
      label: 'Raporty',
      href: '/analytics',
      icon: BarChart3,
      color: '#4ade80',
      bgColor: 'rgba(74, 222, 128, 0.08)',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1
          className="text-3xl tracking-tight"
          style={{
            fontFamily: 'var(--font-dm-serif), Georgia, serif',
            color: 'var(--cream)',
          }}
        >
          Dashboard
        </h1>
        <p className="mt-1" style={{ color: 'var(--warm-gray)' }}>
          Przegladaj kluczowe wskazniki i aktywnosc programu lojalnosciowego.
        </p>
      </div>

      {/* Metrics grid */}
      <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Klienci ogolnie"
          value={
            metricsLoading
              ? '...'
              : formatNumber(metrics?.totalCustomers ?? 0)
          }
          change={12.5}
          icon={Users}
        />
        <MetricCard
          title="Aktywni klienci"
          value={
            metricsLoading
              ? '...'
              : formatNumber(metrics?.activeCustomers ?? 0)
          }
          change={8.2}
          icon={UserCheck}
        />
        <MetricCard
          title="Punkty wydane"
          value={
            metricsLoading
              ? '...'
              : formatNumber(metrics?.pointsIssued ?? 0)
          }
          change={23.1}
          icon={Coins}
        />
        <MetricCard
          title="Przychod"
          value={
            metricsLoading
              ? '...'
              : formatCurrency(metrics?.totalRevenueGrosze ?? 0)
          }
          change={15.3}
          icon={TrendingUp}
        />
      </div>

      {/* Charts and quick actions row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue chart */}
        <Card
          className="card-editorial overflow-hidden border-0 lg:col-span-4"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          {/* Subtle gold top line */}
          <div
            className="h-[1px] w-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(212, 168, 83, 0.2), transparent)',
            }}
          />
          <CardHeader>
            <CardTitle
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--cream)',
                fontSize: '1.15rem',
              }}
            >
              Przychod (ostatnie 30 dni)
            </CardTitle>
            <CardDescription style={{ color: 'var(--warm-gray)' }}>
              Dzienny przychod z transakcji lojalnosciowych
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div
                  className="h-8 w-8 animate-spin rounded-full border-[3px]"
                  style={{
                    borderColor: 'rgba(212, 168, 83, 0.15)',
                    borderTopColor: 'var(--gold)',
                  }}
                />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(212, 168, 83, 0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    className="text-xs"
                    tick={{ fill: '#8a8680', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(212, 168, 83, 0.08)' }}
                    tickLine={false}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: '#8a8680', fontSize: 11 }}
                    tickFormatter={(v) => `${v} zl`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#24242e',
                      border: '1px solid rgba(212, 168, 83, 0.15)',
                      borderRadius: '0.75rem',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                      color: '#f0ece4',
                    }}
                    itemStyle={{ color: '#d4a853' }}
                    labelStyle={{ color: '#8a8680', marginBottom: '4px' }}
                    formatter={(value: number) => [
                      `${value.toFixed(2)} zl`,
                      'Przychod',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="przychod"
                    stroke="#d4a853"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: '#d4a853',
                      stroke: '#0f0f12',
                      strokeWidth: 2,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card
          className="card-editorial overflow-hidden border-0 lg:col-span-3"
          style={{ backgroundColor: 'var(--surface)' }}
        >
          <div
            className="h-[1px] w-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(212, 168, 83, 0.2), transparent)',
            }}
          />
          <CardHeader>
            <CardTitle
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--cream)',
                fontSize: '1.15rem',
              }}
            >
              Szybkie akcje
            </CardTitle>
            <CardDescription style={{ color: 'var(--warm-gray)' }}>
              Popularne operacje do szybkiego wykonania
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <div
                    className="group flex flex-col items-center gap-3 rounded-xl p-5 text-center transition-all duration-300"
                    style={{
                      backgroundColor: 'var(--surface-elevated)',
                      border: '1px solid rgba(212, 168, 83, 0.05)',
                    }}
                  >
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                      style={{
                        backgroundColor: action.bgColor,
                        border: `1px solid ${action.color}15`,
                      }}
                    >
                      <action.icon
                        className="h-5 w-5"
                        style={{ color: action.color }}
                      />
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: 'var(--cream)' }}
                    >
                      {action.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card
        className="card-editorial overflow-hidden border-0"
        style={{ backgroundColor: 'var(--surface)' }}
      >
        <div
          className="h-[1px] w-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(212, 168, 83, 0.2), transparent)',
          }}
        />
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle
              style={{
                fontFamily: 'var(--font-dm-serif), Georgia, serif',
                color: 'var(--cream)',
                fontSize: '1.15rem',
              }}
            >
              Ostatnie transakcje
            </CardTitle>
            <CardDescription style={{ color: 'var(--warm-gray)' }}>
              10 ostatnich transakcji w systemie
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            asChild
            className="border-0 text-xs font-medium tracking-wide"
            style={{
              backgroundColor: 'rgba(212, 168, 83, 0.08)',
              color: 'var(--gold)',
              borderRadius: 'var(--radius)',
            }}
          >
            <Link href="/analytics">Zobacz wszystkie</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {transactionsLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div
                className="h-8 w-8 animate-spin rounded-full border-[3px]"
                style={{
                  borderColor: 'rgba(212, 168, 83, 0.15)',
                  borderTopColor: 'var(--gold)',
                }}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow
                    className="border-0"
                    style={{ borderBottom: '1px solid rgba(212, 168, 83, 0.08)' }}
                  >
                    <TableHead
                      className="text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--warm-gray)', letterSpacing: '0.08em' }}
                    >
                      ID
                    </TableHead>
                    <TableHead
                      className="text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--warm-gray)', letterSpacing: '0.08em' }}
                    >
                      Typ
                    </TableHead>
                    <TableHead
                      className="text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--warm-gray)', letterSpacing: '0.08em' }}
                    >
                      Kwota
                    </TableHead>
                    <TableHead
                      className="text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--warm-gray)', letterSpacing: '0.08em' }}
                    >
                      Punkty +
                    </TableHead>
                    <TableHead
                      className="text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--warm-gray)', letterSpacing: '0.08em' }}
                    >
                      Punkty -
                    </TableHead>
                    <TableHead
                      className="text-xs font-medium uppercase tracking-wider"
                      style={{ color: 'var(--warm-gray)', letterSpacing: '0.08em' }}
                    >
                      Data
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsData?.data && transactionsData.data.length > 0 ? (
                    transactionsData.data.map((tx) => (
                      <TableRow
                        key={tx.id}
                        className="border-0 transition-colors duration-200"
                        style={{ borderBottom: '1px solid rgba(212, 168, 83, 0.04)' }}
                      >
                        <TableCell
                          className="font-mono text-xs"
                          style={{ color: 'var(--warm-gray)' }}
                        >
                          {tx.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="border-0 text-xs"
                            style={{
                              backgroundColor: 'rgba(212, 168, 83, 0.08)',
                              color: 'var(--gold)',
                            }}
                          >
                            {tx.type}
                          </Badge>
                        </TableCell>
                        <TableCell style={{ color: 'var(--cream)' }}>
                          {formatCurrency(tx.amountGrosze)}
                        </TableCell>
                        <TableCell style={{ color: '#4ade80' }}>
                          {tx.pointsEarned > 0
                            ? `+${formatNumber(tx.pointsEarned)}`
                            : '-'}
                        </TableCell>
                        <TableCell className="text-destructive">
                          {tx.pointsSpent > 0
                            ? `-${formatNumber(tx.pointsSpent)}`
                            : '-'}
                        </TableCell>
                        <TableCell style={{ color: 'var(--warm-gray)' }}>
                          {new Date(tx.createdAt).toLocaleDateString('pl-PL', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center"
                        style={{ color: 'var(--warm-gray)' }}
                      >
                        Brak transakcji do wyswietlenia.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
