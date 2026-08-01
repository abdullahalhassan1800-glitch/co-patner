export interface User {
  id: string;
  username?: string;
  email: string;
  phone?: string;
  name: string;
  avatar: string;
  gender: "male" | "female" | "other";
  age: number;
  country: string;
  bio: string;
  interests: string[];
  credits: number;
  isPremium: boolean;
  friends: string[];
  createdAt?: string;
}

export interface Partner {
  id: string;
  name: string;
  avatar: string;
  gender: string;
  country: string;
  age: number;
  interests: string[];
}

export interface MatchFilters {
  gender: string;
  country: string;
  minAge: number;
  maxAge: number;
}

export interface ChatMessage {
  id: string;
  message: string;
  from: "me" | "partner";
  timestamp: number;
}

export interface Transaction {
  _id: string;
  amount: number;
  type: "recharge" | "spend";
  description: string;
  createdAt: string;
}

export type ConnectionState = "idle" | "searching" | "connecting" | "connected" | "disconnected";

export interface Room {
  roomId: string;
  role: "caller" | "callee";
  partner: Partner;
}
