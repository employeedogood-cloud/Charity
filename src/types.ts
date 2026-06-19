export interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  attachmentUrl?: string; // For mock face upload
}

export interface DonorPhoto {
  id: string;
  name: string;
  location: string;
  eggCount: number;
  imageUrl: string;
  message?: string;
  date: string;
}

export interface Donation {
  id: string;
  name: string;
  amount: number;
  eggs: number;
  timestamp: string;
  message?: string;
}
