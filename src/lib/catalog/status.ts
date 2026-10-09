/**
 * Every visible option carries one of these statuses. They come from the
 * catalog only; components never decide availability on their own.
 */
export const AVAILABILITY = ['observed_example', 'proposed_custom', 'requires_confirmation'] as const;
export type Availability = (typeof AVAILABILITY)[number];

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  observed_example: 'Izrađeni primjer',
  proposed_custom: 'Prijedlog po mjeri',
  requires_confirmation: 'Potvrđujemo uz ponudu',
};

export const AVAILABILITY_HINT: Record<Availability, string> = {
  observed_example:
    'Varijanta iz objavljenog DAL rada. Dostupnost dogovaramo uz ponudu.',
  proposed_custom: 'Prijedlog po mjeri — mogućnost izrade potvrđujemo uz ponudu.',
  requires_confirmation:
    'Poseban prijedlog. Mogućnost izrade potvrđujemo uz ponudu.',
};

export const CUSTOM_PROPOSAL_COPY = 'Prijedlog po mjeri — mogućnost izrade potvrđujemo uz ponudu.';
