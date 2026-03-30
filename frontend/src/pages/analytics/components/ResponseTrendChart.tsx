import React from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer } from
"recharts";
import { CheckCircle2, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { MaterialDatePicker } from "@/components/ui/MaterialDatePicker";
interface ResponseTrendChartProps {
  data: {date: string;count: number;}[];
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  onCopy: (id: string) => void;
  copySuccess: string | null;
}
export const ResponseTrendChart: React.FC<ResponseTrendChartProps> = ({
  data,
  selectedMonth,
  onMonthChange,
  onCopy,
  copySuccess
}) => {
  const { t } = useTranslation();
  const [isMonthPickerOpen, setIsMonthPickerOpen] = React.useState(false);
  const selectedMonthDate = React.useMemo(() => {
    const m = /^(\d{4})-(\d{2})$/.exec(selectedMonth);
    if (!m) return null;
    const year = Number(m[1]);
    const monthNum = Number(m[2]);
    if (!Number.isFinite(year) || !Number.isFinite(monthNum)) return null;
    return new Date(year, monthNum - 1, 1);
  }, [selectedMonth]);
  const getPrimaryColor = () => {
    if (typeof window !== "undefined") {
      const rootStyle = getComputedStyle(document.body);
      const primary = rootStyle.getPropertyValue("--primary").trim();
      if (primary && primary !== "") return primary;
    }
    return "#6366f1";
  };
  const monthLabel = selectedMonthDate ?
  selectedMonthDate.toLocaleDateString(undefined, { month: "long", year: "numeric" }) :
  selectedMonth;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("analytics.response_trend")}
          </h3>
          <div className="mt-1">
            <label className="sr-only" htmlFor="response-trend-month">
              {t("common.date.month")}
            </label>
            <button
              id="response-trend-month"
              type="button"
              onClick={() => setIsMonthPickerOpen(true)}
              className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-black/20">
              {monthLabel}
            </button>
          </div>
        </div>
        <button
          onClick={() => onCopy("response-trend-chart")}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          title={t("analytics.copy_chart")}>
          {copySuccess === "response-trend-chart" ?
          <CheckCircle2 className="w-4 h-4 text-green-600" /> :
          <Copy className="w-4 h-4" />
          }
        </button>
      </div>
      <MaterialDatePicker
        isOpen={isMonthPickerOpen}
        onClose={() => setIsMonthPickerOpen(false)}
        selectedDate={selectedMonthDate}
        mode="month"
        themeColor={getPrimaryColor()}
        onSelect={(date) => {
          const mm = String(date.getMonth() + 1).padStart(2, "0");
          onMonthChange(`${date.getFullYear()}-${mm}`);
        }} />
      <div id="response-trend-chart" className="p-2 bg-white rounded-lg">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              minTickGap={10}
              interval="preserveStartEnd" />
            <YAxis
              tick={{ fontSize: 11, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              domain={[0, "auto"]} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                border: "none",
                borderRadius: "12px",
                boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                padding: "12px"
              }}
              cursor={{
                stroke: "#8b5cf6",
                strokeWidth: 1,
                strokeDasharray: "4 4"
              }}
              itemStyle={{
                color: "#6d28d9",
                fontWeight: 600,
                fontSize: "14px"
              }}
              labelStyle={{
                color: "#64748b",
                marginBottom: "4px",
                fontSize: "12px"
              }} />
            <Area
              type="monotoneX"
              dataKey="count"
              stroke="#8b5cf6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorResponses)"
              name={t("analytics.view_responses")}
              activeDot={{
                r: 6,
                stroke: "#fff",
                strokeWidth: 3,
                fill: "#8b5cf6"
              }}
              connectNulls />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>);
};