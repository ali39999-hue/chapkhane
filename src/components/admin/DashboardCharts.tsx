"use client";

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartProps {
  data: {
    date: string;
    revenue: number;
    orders?: number;
  }[];
}

export function DashboardCharts({ data }: ChartProps) {
  return (
    <div className="w-full h-full min-h-[320px]">
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#d4af37" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            tickFormatter={(value) => `${(value / 10000000).toLocaleString('fa-IR')} م.ت`}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '16px', 
              border: '1px solid rgba(255, 255, 255, 0.1)', 
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              backgroundColor: 'rgba(10, 14, 23, 0.95)',
              backdropFilter: 'blur(8px)',
              padding: '12px 16px',
              direction: 'rtl',
              textAlign: 'right',
              fontFamily: 'inherit',
              color: '#fff'
            }}
            itemStyle={{ color: '#d4af37' }}
            formatter={(value: unknown) => [`${Number(value ?? 0).toLocaleString('fa-IR')} ریال`, 'مبلغ فروش']}
            labelFormatter={(label) => `روز: ${label}`}
          />
          <Area 
            type="monotone" 
            dataKey="revenue" 
            stroke="#d4af37" 
            fill="url(#colorRevenue)" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#0a0e17', strokeWidth: 2, stroke: '#d4af37' }}
            activeDot={{ r: 6, fill: '#d4af37', strokeWidth: 3, stroke: '#ffffff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
