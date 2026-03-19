import { mockClients } from './mockClients';

export interface MultiWeddingDashboardItem {
  id: number;
  coupleNames: string;
  weddingDate: string;
  location: string;
  progress: number;
  attentionFlag?: string;
}

export const multiWeddingDashboardData: MultiWeddingDashboardItem[] = mockClients.map((client, index) => {
  const flags: Array<string | undefined> = [
    'Pending vendor follow-up',
    'Payment due this week',
    'Timeline review needed',
    undefined,
    undefined,
    'Awaiting final confirmation',
  ];

  return {
    id: client.id,
    coupleNames: client.coupleNames,
    weddingDate: client.weddingDate,
    location: client.location,
    progress: client.progress,
    attentionFlag: flags[index],
  };
});