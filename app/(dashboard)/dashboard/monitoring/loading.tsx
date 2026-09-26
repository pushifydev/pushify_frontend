import {
  SkeletonPageHeader,
  SkeletonMonitoringGaugeCard,
  SkeletonMonitoringChartBlock,
} from '@/components/Skeleton';

export default function MonitoringLoading() {
  return (
    <div className="dash-page max-w-7xl min-w-0 space-y-6 pb-8 animate-slide-in">
      <SkeletonPageHeader />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <SkeletonMonitoringGaugeCard key={i} />
        ))}
      </div>
      <SkeletonMonitoringChartBlock />
    </div>
  );
}
