// Lógica auxiliar para el módulo de cocina

// Retry genérico para promesas
export async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 500): Promise<T> {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw lastError;
}

// Aquí puedes agregar más lógica de negocio o utilidades para el módulo de cocina
