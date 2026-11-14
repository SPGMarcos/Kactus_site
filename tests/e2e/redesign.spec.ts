import { test, expect } from '@playwright/test';

test('destinos, estado ativo e menu móvel', async ({ page, isMobile }) => {
  await page.goto('/loja');
  const navigate = async (name: string) => {
    if (isMobile)
      await page.getByRole('button', { name: 'Abrir menu' }).click();
    const region = isMobile
      ? page.getByRole('dialog')
      : page.getByRole('navigation', { name: 'Principal' });
    await region.getByRole('link', { name, exact: true }).click();
    if (isMobile) await expect(page.getByRole('dialog')).toBeHidden();
  };
  await navigate('Novidades');
  await expect(page).toHaveURL(/\/novidades$/);
  await expect(
    page.getByRole('heading', { name: 'Novidades' }),
  ).toBeInViewport();
  if (!isMobile)
    await expect(page.locator('.desktop-nav [aria-current]')).toHaveText(
      'Novidades',
    );
  await navigate('Início');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
  await page.locator('.instagram-editorial').scrollIntoViewIfNeeded();
  await navigate('Início');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
  await navigate('Loja');
  await expect(page).toHaveURL(/\/loja$/);
});

test('Instagram único, nova aba e capturas', async ({ page }, testInfo) => {
  await page.goto('/');
  const instagram = page.locator(
    'a[href="https://www.instagram.com/kactus_stylish_01/"]',
  );
  await expect(instagram).toHaveCount(1);
  await expect(instagram).toHaveText('Conversar pelo Instagram');
  await expect(instagram).toHaveAttribute('target', '_blank');
  await page.route('https://www.instagram.com/**', (route) =>
    route.fulfill({ body: 'Destino Instagram verificado' }),
  );
  const popupPromise = page.waitForEvent('popup');
  await instagram.click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL('https://www.instagram.com/kactus_stylish_01/');
  await popup.close();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.instagram-editorial img')).toHaveCount(0);
  await page.locator('.instagram-editorial').screenshot({
    style: '.header { visibility: hidden; } nextjs-portal { display: none; }',
    path: `docs/redesign-instagram-${testInfo.project.name}.png`,
  });
  await page.evaluate(async () => {
    window.scrollTo(0, 0);
    await document.fonts.ready;
  });
  await page.screenshot({
    path: `docs/redesign-${testInfo.project.name}.png`,
    fullPage: true,
    style: 'nextjs-portal { display: none; }',
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
