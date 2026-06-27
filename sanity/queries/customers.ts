import { defineQuery } from "next-sanity";

/**
 * Fetch a single customer by email
 * Params: { email: string }
 */
export const CUSTOMER_BY_EMAIL_QUERY = defineQuery(`*[
  _type == "customer"
  && email == $email
][0]{
  _id,
  email,
  name,
  clerkUserId,
  stripeCustomerId,
  createdAt
}`);

/**
 * Fetch a single customer by Stripe customer ID
 * Params: { stripeCustomerId: string }
 */
export const CUSTOMER_BY_STRIPE_ID_QUERY = defineQuery(`*[
  _type == "customer"
  && stripeCustomerId == $stripeCustomerId
][0]{
  _id,
  email,
  name,
  clerkUserId,
  stripeCustomerId,
  createdAt
}`);
