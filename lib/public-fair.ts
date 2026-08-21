export type FairHour = {
  dayOfWeek: number;
  opensAt: string | null;
  closesAt: string | null;
  isClosed: boolean;
};

export type PublicFairResponse = {
  timezone: string;
  localDate: string;
  fair: {
    name: string;
    isOpen: boolean;
    phone: string | null;
    location: {
      name: string | null;
      address: string | null;
      city: string | null;
      state: string | null;
      country: string | null;
      latitude: number | null;
      longitude: number | null;
      mapsUrl: string | null;
    };
    hours: FairHour[];
    todayHours: FairHour | null;
    updatedAt: string;
  };
};

export type PublicEvent = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  startTime: string | null;
  endTime: string | null;
  imageUrl: string | null;
};

export type PublicEventsResponse = {
  timezone: string;
  events: PublicEvent[];
};

const API_BASE_URL =
  process.env.MENESES_API_BASE_URL ?? "http://localhost:3001";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function getPublicFair(): Promise<PublicFairResponse> {
  return getJson<PublicFairResponse>("/public/fair");
}

export async function getPublicEvents(): Promise<PublicEventsResponse> {
  return getJson<PublicEventsResponse>("/public/events");
}
