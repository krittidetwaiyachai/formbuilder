import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
"recharts";
interface MonthlyChartProps {
  title: string;
  data: Array<{
    name: string;
    [key: string]: string | number;
  }>;
  dataKey: string;
  color: string;
}
export default function MonthlyChart({
  title,
  data,
  dataKey,
  color: _color
}: MonthlyChartProps) {
  const strokeColor = "#000";
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 h-[400px]">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-6">{title}</h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0
            }}>
            <defs>
              <linearGradient
                id={`color${dataKey}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.06} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 11 }}
              dy={10} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9ca3af", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)",
                fontSize: 13
              }}
              cursor={{ stroke: "#d1d5db", strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={strokeColor}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#color${dataKey})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>);
}