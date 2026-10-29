import { it,expect } from 'vitest';
import Stripe from 'stripe';
const stripe=new Stripe('sk_test_fixture_only');const secret='whsec_fixture_only';const payload=JSON.stringify({id:'evt_fixture',object:'event',type:'checkout.session.completed',data:{object:{id:'cs_test_fixture'}}});
it('verifica assinatura usando corpo original',()=>{const header=stripe.webhooks.generateTestHeaderString({payload,secret});expect(stripe.webhooks.constructEvent(payload,header,secret).id).toBe('evt_fixture');});
it('recusa payload modificado após assinatura',()=>{const header=stripe.webhooks.generateTestHeaderString({payload,secret});expect(()=>stripe.webhooks.constructEvent(payload+' ',header,secret)).toThrow();});
