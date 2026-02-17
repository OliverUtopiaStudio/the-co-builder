// 5-Year KPI Projections for Utopia Studio
// Targets per year for each KPI key (Year 1 comes from the database)

export type FiveYearTargets = {
  year1: number;
  year2: number;
  year3: number;
  year4: number;
  year5: number;
};

export const FIVE_YEAR_TARGETS: Record<string, FiveYearTargets> = {
  eir: {
    year1: 12,
    year2: 25,
    year3: 40,
    year4: 55,
    year5: 75,
  },
  concepts: {
    year1: 12,
    year2: 25,
    year3: 40,
    year4: 55,
    year5: 75,
  },
  spinouts: {
    year1: 6,
    year2: 15,
    year3: 25,
    year4: 40,
    year5: 60,
  },
  ftes: {
    year1: 8,
    year2: 20,
    year3: 40,
    year4: 65,
    year5: 100,
  },
  equity: {
    year1: 15,
    year2: 35,
    year3: 65,
    year4: 100,
    year5: 150,
  },
  revenue: {
    year1: 500_000,
    year2: 2_000_000,
    year3: 8_000_000,
    year4: 20_000_000,
    year5: 50_000_000,
  },
  customers: {
    year1: 50,
    year2: 150,
    year3: 400,
    year4: 800,
    year5: 1_500,
  },
};

// Format helpers for display
export function formatKPIValue(key: string, value: number): string {
  if (key === "equity") {
    return `${value}M`;
  }
  if (key === "revenue") {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
    }
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return value.toLocaleString();
}
