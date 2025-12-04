// Configuration Stripe
import { loadStripe } from '@stripe/stripe-js';

// Clé publique Stripe (à ajouter dans .env)
const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

if (!stripePublicKey) {
  console.warn('⚠️ VITE_STRIPE_PUBLIC_KEY non définie dans .env');
}

// Initialiser Stripe uniquement si la clé est présente
export const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;
