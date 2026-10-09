/**
 * Every visible option carries one of these statuses. They come from the
 * catalog only; components never decide availability on their own.
 */
export const AVAILABILITY = ['observed_example', 'proposed_custom', 'requires_confirmation'] as const;
export type Availability = (typeof AVAILABILITY)[number];

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  observed_example: 'Primjer iz DAL objave',
  proposed_custom: 'Prijedlog po mjeri',
  requires_confirmation: 'Potrebna potvrda radionice',
};

export const AVAILABILITY_HINT: Record<Availability, string> = {
  observed_example:
    'Varijanta viđena na objavljenoj fotografiji. To nije obećanje trenutne dostupnosti.',
  proposed_custom: 'Prijedlog po mjeri — mogućnost izrade potvrđujemo uz ponudu.',
  requires_confirmation:
    'Opcija za razgovor. Radionica je još nije potvrdila kao proizvod; potvrda dolazi uz ponudu.',
};

export const CUSTOM_PROPOSAL_COPY = 'Prijedlog po mjeri — mogućnost izrade potvrđujemo uz ponudu.';
