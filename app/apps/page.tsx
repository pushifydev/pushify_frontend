import { appsByCategory } from '@/lib/apps-catalog';
import { AppsIndexView } from './AppsIndexView';

export default function AppsPage() {
  return <AppsIndexView groups={appsByCategory()} />;
}
