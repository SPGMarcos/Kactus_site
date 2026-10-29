import { describe, it, expect } from 'vitest';
import { checkoutSchema, stockSchema } from '../../src/lib/validation';
import { safeNext, csvCell, money } from '../../src/lib/utils';
const input = {
  key: '00000000-0000-4000-8000-000000000001',
  items: [{ variant_id: '00000000-0000-4000-8000-000000000002', quantity: 1 }],
};
describe('fronteiras de confiança', () => {
  it('aceita somente IDs e quantidades no checkout', () =>
    expect(checkoutSchema.safeParse(input).success).toBe(true));
  it('recusa preço adulterado no navegador', () =>
    expect(
      checkoutSchema.safeParse({
        ...input,
        items: [{ ...input.items[0], price: 1 }],
      }).success,
    ).toBe(false));
  it.each([0, -1, 1.5, 21])('recusa quantidade %s', (quantity) =>
    expect(
      checkoutSchema.safeParse({
        ...input,
        items: [{ ...input.items[0], quantity }],
      }).success,
    ).toBe(false),
  );
  it('recusa carrinho vazio', () =>
    expect(checkoutSchema.safeParse({ ...input, items: [] }).success).toBe(
      false,
    ));
  it('exige motivo no ajuste', () =>
    expect(
      stockSchema.safeParse({
        variant_id: input.items[0].variant_id,
        delta: 1,
        reason: '',
      }).success,
    ).toBe(false));
  it.each([
    'https://evil.test',
    '//evil.test',
    '/\\evil.test',
    'javascript:alert(1)',
  ])('bloqueia redirecionamento %s', (url) =>
    expect(safeNext(url)).toBe('/conta'),
  );
  it('preserva retorno ao carrinho', () =>
    expect(safeNext('/carrinho')).toBe('/carrinho'));
  it('neutraliza fórmula CSV', () => expect(csvCell('=1+1')).toBe('"\'=1+1"'));
  it('usa centavos inteiros', () => expect(money(12990)).toContain('129,90'));
});
