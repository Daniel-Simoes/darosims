export async function register() {
  const { bootstrapProductionStorage } = await import('@/lib/productionBootstrap');
  await bootstrapProductionStorage();
}
