'use client';

import { useState, useMemo } from 'react';
import { useDailyAnalytics, useDashboardMetrics } from '@loyalty/api-client';
import { formatPLN } from '@loyalty/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Label,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
} from '@loyalty/ui';
import { MetricCard } from '@/components/metric-card';
import {
  Users,
  TrendingUp,
  Coins,
  Award,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', '#10b981', '#f59e0b'];

export default function AnalyticsPage() {
  // Date range
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const thirtyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  }, []);

  const [dateFrom, setDateFrom] = useState(thirtyDaysAgo);
  const [dateTo, setDateTo] = useState(today);

  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics();
  const { data: dailyData, isLoading: chartLoading } = useDailyAnalytics({
    dateFrom,
    dateTo,
  });

  // Chart data: customers over time
  const customersChartData = useMemo(() => {
    if (!dailyData) return [];
    return dailyData.map((d) => ({
      date: new Date(d.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }),
      klienci: d.newCustomers,
    }));
  }, [dailyData]);

  // Chart data: revenue by day
  const revenueChartData = useMemo(() => {
    if (!dailyData) return [];
    return dailyData.map((d) => ({
      date: new Date(d.date).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }),
      przychod: d.revenueGrosze / 100,
    }));
  }, [dailyData]);

  // Pie chart: points earned vs burned
  const pointsPieData = useMemo(() => {
    if (!dailyData) return [];
    const totalEarned = dailyData.reduce((sum, d) => sum + d.pointsIssued, 0);
    const totalBurned = dailyData.reduce((sum, d) => sum + d.pointsRedeemed, 0);
    return [
      { name: 'Naliczone', value: totalEarned },
      { name: 'Wydane', value: totalBurned },
    ];
  }, [dailyData]);

  const formatNumber = (n: number) => new Intl.NumberFormat('pl-PL').format(n);
  const formatCurrency = (grosze: number) =>
    new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(grosze / 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analityka</h1>
        <p className="text-muted-foreground">
          Szczegolowe raporty i wykresy programu lojalnosciowego.
        </p>
      </div>

      {/* Date range picker */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label>Od</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Do</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setDateFrom(thirtyDaysAgo);
                setDateTo(today);
              }}
            >
              Ostatnie 30 dni
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Nowi klienci"
          value={metricsLoading ? '...' : formatNumber(metrics?.newCustomersWeek ?? 0)}
          change={12.5}
          icon={Users}
        />
        <MetricCard
          title="Przychod (miesiac)"
          value={metricsLoading ? '...' : formatCurrency(metrics?.revenueThisMonthGrosze ?? 0)}
          change={15.3}
          icon={TrendingUp}
        />
        <MetricCard
          title="Punkty wydane"
          value={metricsLoading ? '...' : formatNumber(metrics?.pointsIssued ?? 0)}
          change={23.1}
          icon={Coins}
        />
        <MetricCard
          title="Wskaznik realizacji"
          value={metricsLoading ? '...' : `${(metrics?.redemptionRate ?? 0).toFixed(1)}%`}
          change={5.4}
          icon={Award}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Line chart: customers over time */}
        <Card>
          <CardHeader>
            <CardTitle>Nowi klienci</CardTitle>
            <CardDescription>Liczba nowych klientow w wybranym okresie</CardDescription>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={customersChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="klienci"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar chart: revenue by day */}
        <Card>
          <CardHeader>
            <CardTitle>Przychod dzienny</CardTitle>
            <CardDescription>Przychod z transakcji w PLN</CardDescription>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${v} zl`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 'var(--radius)',
                    }}
                    formatter={(value: number) => [`${value.toFixed(2)} zl`, 'Przychod']}
                  />
                  <Bar dataKey="przychod" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pie chart + daily table */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pie chart: points */}
        <Card>
          <CardHeader>
            <CardTitle>Punkty: naliczone vs wydane</CardTitle>
            <CardDescription>Proporcja punktow w wybranym okresie</CardDescription>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <div className="flex h-[250px] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pointsPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pointsPieData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Daily breakdown table */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Podsumowanie dzienne</CardTitle>
            <CardDescription>Szczegoly dla wybranego zakresu dat</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {chartLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Nowi klienci</TableHead>
                      <TableHead>Transakcje</TableHead>
                      <TableHead>Przychod</TableHead>
                      <TableHead>Punkty +</TableHead>
                      <TableHead>Punkty -</TableHead>
                      <TableHead>Nagrody</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyData && dailyData.length > 0 ? (
                      [...dailyData].reverse().map((day) => (
                        <TableRow key={day.date}>
                          <TableCell className="font-medium">
                            {new Date(day.date).toLocaleDateString('pl-PL', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell>{day.newCustomers}</TableCell>
                          <TableCell>{day.transactions}</TableCell>
                          <TableCell>{formatPLN(day.revenueGrosze)}</TableCell>
                          <TableCell className="text-emerald-600">
                            +{formatNumber(day.pointsIssued)}
                          </TableCell>
                          <TableCell className="text-destructive">
                            -{formatNumber(day.pointsRedeemed)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{day.rewardsRedeemed}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          Brak danych dla wybranego zakresu dat.
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
    </div>
  );
}
