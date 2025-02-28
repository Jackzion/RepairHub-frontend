export interface RepairTicket {
  id: string;
  userId: string;
  type: string;
  description: string;
  location: {
    building: string;
    room: string;
    coordinates: [number, number];
  };
  priority: 'normal' | 'urgent' | 'critical';
  status: 'pending' | 'processing' | 'completed';
  images: string[];
  createdAt: string;
  updatedAt: string;
  maintainerId?: string;
  completionNote?: string;
  rating?: number;
  feedback?: string;
}