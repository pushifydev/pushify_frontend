import {
  SkeletonPageHeader,
  SkeletonMonitoringGaugeCard,
  SkeletonMonitoringChartBlock,
} from '@/components/Skeleton';

export default function MonitoringLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-slide-in">
      <SkeletonPageHeader />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonMonitoringGaugeCard key={i} />
        ))}
      </div>
      <SkeletonMonitoringChartBlock />
      <SkeletonMonitoringChartBlock />
    </div>
  );
}
