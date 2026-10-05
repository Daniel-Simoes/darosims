export async function register() {
  try {
    const { bootstrapProductionStorage } = await import('@/lib/productionBootstrap');
    await bootstrapProductionStorage();
  } catch (error) {
    console.error('[darosims] production bootstrap failed:', error);
  }
}
