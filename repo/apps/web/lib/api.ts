export interface User {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function fetchUsers(): Promise<User[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

  try {
    const response = await fetch(`${baseUrl}/v1/users`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Failed to load users: ${response.status}`);
    }

    return (await response.json()) as User[];
  } catch (error) {
    console.warn('Falling back to static user list. Reason:', error);
    return [
      {
        id: 1,
        email: 'demo@teamtrack.dev',
        name: 'Demo User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }
}
