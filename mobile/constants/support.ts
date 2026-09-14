export const supportOptions = [
  {
    label: 'Unclear',
    tone: 'A little hard to name',
    support: 'Start by choosing one emotional space. You do not need the exact word yet.',
    action: 'Open Emotionize',
    href: '/emotionize',
    feature: 'emotionize',
    color: '#fde6cf',
  },
  {
    label: 'Heavy',
    tone: 'Low energy or tired',
    support: 'Keep this small. A gentle daily check-in can help you notice what needs less pressure.',
    action: 'Open Check-in',
    href: '/dailies',
    feature: 'dailies',
    color: '#e9f0fa',
  },
  {
    label: 'Too much',
    tone: 'Overloaded or tense',
    support: 'Try regulating before reflecting. Your body may need quiet before words.',
    action: 'Open Toolkit',
    href: '/toolkit',
    feature: 'toolkit',
    color: '#f4f8f3',
  },
  {
    label: 'Need words',
    tone: 'Something to say',
    support: 'Use a guided prompt to find language that feels honest and careful.',
    action: 'Open Express',
    href: '/express',
    feature: 'express',
    color: '#e1dcf9',
  },
] as const;

export type SupportOption = (typeof supportOptions)[number];
