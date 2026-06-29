const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function readErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as { message?: string };
    return payload.message || response.statusText || "Request failed";
  } catch {
    return response.statusText || "Request failed";
  }
}

export async function apiGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "GET",
    signal,
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response.json() as Promise<T>;
}
