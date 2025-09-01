"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { EChartsOption } from "echarts";
import type ReactECharts from "echarts-for-react";
type ReactEChartsProps = ComponentProps<typeof ReactECharts>;
const ECharts = dynamic<ReactEChartsProps>(() => import("echarts-for-react"), { ssr: false });

type CommitPoint = { date: string; commits: number };

type GHResponse = { user: string; days: number; data: CommitPoint[] };

const username = "thaytoiyeucoay";

export function DataVizSection() {
  const [range, setRange] = useState<"30" | "90">("30");
  const [commits, setCommits] = useState<CommitPoint[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/github-commits?user=${username}&days=${range}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((json: GHResponse) => setCommits(json.data ?? []))
      .catch(() => {});
    return () => controller.abort();
  }, [range]);

  const commitsOption = useMemo<EChartsOption>(() => {
    const dates = commits.map((d) => d.date);
    const values = commits.map((d) => d.commits);
    return {
      backgroundColor: "transparent",
      grid: { left: 32, right: 16, top: 20, bottom: 32 },
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: dates, boundaryGap: false, axisLabel: { color: "#888" } },
      yAxis: { type: "value", axisLabel: { color: "#888" }, splitLine: { lineStyle: { color: "rgba(128,128,128,0.15)" } } },
      series: [
        {
          type: "line",
          smooth: true,
          areaStyle: { color: "rgba(56,189,248,0.18)" },
          lineStyle: { color: "#38bdf8", width: 2 },
          showSymbol: false,
          data: values,
        },
      ],
      animationDuration: 600,
    } as EChartsOption;
  }, [commits]);

  // Mock training logs (epochs)
  const training = useMemo(() => {
    const epochs = 50;
    const xs = Array.from({ length: epochs }, (_, i) => i + 1);
    const loss = xs.map((e) => +(Math.max(0.05, Math.exp(-e / 12) + (Math.random() - 0.5) * 0.03)).toFixed(3));
    const acc = xs.map((e) => +(Math.min(0.99, 0.3 + 0.7 * (1 - Math.exp(-e / 10)) + (Math.random() - 0.5) * 0.02)).toFixed(3));
    return { xs, loss, acc };
  }, []);

  const trainOption = useMemo<EChartsOption>(() => {
    return {
      backgroundColor: "transparent",
      grid: { left: 40, right: 40, top: 20, bottom: 32 },
      tooltip: { trigger: "axis" },
      legend: { data: ["Loss", "Accuracy"], top: 0, textStyle: { color: "#888" } },
      xAxis: { type: "category", data: training.xs, axisLabel: { color: "#888" } },
      yAxis: [
        { type: "value", name: "Loss", position: "left", axisLabel: { color: "#888" }, splitLine: { lineStyle: { color: "rgba(128,128,128,0.15)" } } },
        { type: "value", name: "Acc", position: "right", min: 0, max: 1, axisLabel: { color: "#888" } },
      ],
      series: [
        { name: "Loss", type: "line", smooth: true, yAxisIndex: 0, lineStyle: { color: "#ef4444" }, data: training.loss },
        { name: "Accuracy", type: "line", smooth: true, yAxisIndex: 1, lineStyle: { color: "#10b981" }, data: training.acc },
      ],
      animationDuration: 600,
      dataZoom: [{ type: "inside" }, { type: "slider", height: 16 }],
    } as EChartsOption;
  }, [training]);

  return (
    <section id="dataviz" className="mt-16 scroll-mt-24">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="mb-6 text-2xl font-semibold"
      >
        Interactive Data Viz
      </motion.h2>

      <Tabs value={range} onValueChange={(v: string) => setRange(v as "30" | "90")}>
        <TabsList className="mb-6">
          <TabsTrigger value="30">30 ngày</TabsTrigger>
          <TabsTrigger value="90">90 ngày</TabsTrigger>
        </TabsList>
        <TabsContent value={range}>
          <div className="rounded-lg border bg-background/60 p-3 backdrop-blur">
            <div className="mb-2 text-sm text-muted-foreground">GitHub commits ({username})</div>
            <ECharts style={{ height: 280 }} option={commitsOption} notMerge lazyUpdate theme={undefined} />
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 rounded-lg border bg-background/60 p-3 backdrop-blur">
        <div className="mb-2 text-sm text-muted-foreground">AI training logs (mock)</div>
        <ECharts style={{ height: 320 }} option={trainOption} notMerge lazyUpdate theme={undefined} />
      </div>
    </section>
  );
}
