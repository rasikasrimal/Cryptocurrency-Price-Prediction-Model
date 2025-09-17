import { motion } from "framer-motion";

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
}

export function Sparkline({ values, width = 160, height = 48 }: SparklineProps) {
  if (!values.length) {
    return <div className="h-[48px] w-[160px] rounded-md bg-foreground/5" />;
  }

  const max = Math.max(...values);
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1 || 1)) * width;
    const y = height - (value / (max || 1)) * height;
    return `${x},${y}`;
  });

  return (
    <motion.svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className="text-primary"
      initial={{ opacity: 0.4 }}
      animate={{ opacity: 1 }}
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points.join(" ")}
      />
    </motion.svg>
  );
}
