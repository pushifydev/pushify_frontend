'use client';

import { useParams } from 'next/navigation';
import { SiteEditorView } from '@/components/site-editor/SiteEditorView';
import { useProject } from '@/hooks';

export default function SiteEditorPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { data: project } = useProject(projectId);

  return <SiteEditorView projectId={projectId} projectName={project?.name} />;
}
