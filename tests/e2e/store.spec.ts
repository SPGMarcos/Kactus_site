import { test, expect } from '@playwright/test';
test('vitrine e navegação sem vendas fictícias', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', {
      name: 'O que vestir hoje?',
    }),
  ).toBeVisible();
  await page.getByRole('link', { name: 'Ver catálogo', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Catálogo' }),
  ).toBeVisible();
  await page.getByPlaceholder('O que você procura?').fill('inexistente');
  await page.getByRole('button', { name: 'Filtrar' }).click();
  await expect(page).toHaveURL(/q=inexistente/);
  await expect(
    page.getByRole('heading', { name: 'Nenhuma peça encontrada' }),
  ).toBeVisible();
});
test('carrinho persiste durante navegação para login', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() =>
    localStorage.setItem(
      'kactus-cart',
      JSON.stringify([
        {
          variant_id: '00000000-0000-4000-8000-000000000002',
          name: 'Fixture de teste',
          size: 'M',
          color: 'Preto',
          price: 10000,
          image: '',
          quantity: 1,
        },
      ]),
    ),
  );
  await page.goto('/carrinho');
  await expect(page.getByText('Fixture de teste')).toBeVisible();
  await page.goto('/conta');
  await expect(
    page.getByRole('link', { name: 'Entrar com Google' }),
  ).toBeVisible();
  await page.goto('/carrinho');
  await expect(page.getByText('Fixture de teste')).toBeVisible();
  await page.getByRole('button', { name: 'Remover Fixture de teste' }).click();
  await expect(
    page.getByText('Seu carrinho está vazio.'),
  ).toBeVisible();
});
test('admin sem sessão é bloqueado e URL de retorno não confirma pagamento', async ({
  page,
  request,
}) => {
  await page.goto('/admin');
  await expect(
    page.getByRole('heading', { name: 'Acesso administrativo.' }),
  ).toBeVisible();
  const res = await request.get('/api/admin?entity=orders');
  expect(res.status()).toBe(403);
  await page.goto(
    '/checkout/retorno?order=00000000-0000-4000-8000-000000000000',
  );
  await expect(
    page.getByRole('heading', { name: 'Pagamento em processamento.' }),
  ).toBeVisible();
});
test('layout não transborda horizontalmente', async ({ page }) => {
  for (const path of ['/', '/loja', '/carrinho', '/conta', '/admin']) {
    await page.goto(path);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
});
