import { test, expect } from '@playwright/test';

test('alterna os looks preenchendo toda a área da vitrine', async ({ page }) => {
  await page.goto('/');

  const slides = page.locator('.hero-slide');
  await expect(slides).toHaveCount(4);
  await expect
    .poll(() =>
      page
        .locator('.hero-slide img')
        .evaluateAll((images) =>
          images.every(
            (image) =>
              (image as HTMLImageElement).complete &&
              (image as HTMLImageElement).naturalWidth > 0,
          ),
        ),
    )
    .toBe(true);

  const activeImage = page.locator(
    '.hero-slide.is-active .hero-slide-product',
  );
  const backdrop = page.locator('.hero-slide.is-active .hero-slide-backdrop');
  await expect(activeImage).toHaveAttribute('src', /look-white-black/);
  await expect(activeImage).toHaveCSS('object-fit', 'contain');
  await expect(backdrop).toHaveCSS('object-fit', 'cover');
  const imageBounds = await backdrop.boundingBox();
  const heroBounds = await page.locator('.hero-visual').boundingBox();
  expect(imageBounds).not.toBeNull();
  expect(heroBounds).not.toBeNull();
  // The backdrop is enlarged for the zoom effect, but must cover the hero.
  expect(imageBounds!.x).toBeLessThanOrEqual(heroBounds!.x);
  expect(imageBounds!.y).toBeLessThanOrEqual(heroBounds!.y);
  expect(imageBounds!.x + imageBounds!.width).toBeGreaterThanOrEqual(heroBounds!.x + heroBounds!.width);
  expect(imageBounds!.y + imageBounds!.height).toBeGreaterThanOrEqual(heroBounds!.y + heroBounds!.height);
  await page.mouse.move(0, 0);
  await expect(activeImage).not.toHaveAttribute('src', /look-white-black/, {
    timeout: 12000,
  });

  await page
    .getByRole('button', { name: 'Imagem 3 de 4: POLOS & TEXTURAS' })
    .click();
  await expect(activeImage).toHaveAttribute(
    'src',
    /look-polo-navy/,
  );

  await page.getByRole('button', { name: 'Imagem anterior' }).click();
  await expect(activeImage).toHaveAttribute(
    'src',
    /look-red-denim/,
  );
  await page.getByRole('button', { name: 'Próxima imagem' }).click();
  await expect(activeImage).toHaveAttribute(
    'src',
    /look-polo-navy/,
  );

  const playbackToggle = page.getByRole('button', {
    name: 'Pausar reprodução automática',
  });
  await playbackToggle.click();
  await expect(
    page.getByRole('button', { name: 'Retomar reprodução automática' }),
  ).toHaveAttribute('aria-pressed', 'true');
  await page
    .getByRole('button', { name: 'Retomar reprodução automática' })
    .click();
  await expect(
    page.getByRole('button', { name: 'Pausar reprodução automática' }),
  ).toHaveAttribute('aria-pressed', 'false');
});
