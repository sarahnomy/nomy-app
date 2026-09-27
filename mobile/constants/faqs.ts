type FaqItem = {
  question: string;
  answer: string;
  linkLabel?: string;
  linkUrl?: string;
};

export const faqs: readonly FaqItem[] = [
  {
    question: 'What is nomy?',
    answer:
      'nomy is a space designed to help late-diagnosed autistic adults understand themselves, express themselves and find what works for them. It brings together tools for emotions, communication, self-reflection and regulation in one place.',
  },
  {
    question: 'What is Emotionize?',
    answer:
      'Emotionize helps you understand and name what you’re feeling, with explanations that reflect the autistic experience. Explore emotions, reflect on how they show up for you, and start noticing your own patterns.',
  },
  {
    question: 'What is Check-in?',
    answer:
      'Check-In gives you a simple way to notice how you’re feeling and what you might need throughout your day. You can check in in the morning or evening, without having to complete a long list or explain everything.',
  },
  {
    question: 'What is Express?',
    answer:
      'Express helps you find the words for what you really mean, especially when something feels difficult to explain. Tell nomy what happened, work out what you want to communicate, and find words that still feel like you.',
  },
  {
    question: 'What is Toolkit?',
    answer:
      'Toolkit gives you simple tools to use when you need support in the moment. Choose whether you want to calm down, release energy, or get your brain elsewhere, with options like movement, sensory activities, breathing and puzzles.',
  },
  {
    question: 'How do I change language?',
    answer:
      'English is currently the only language available on nomy. More languages may be added in the future.',
  },
  {
    question: 'How do subscriptions work?',
    answer:
      'You can manage your subscription in Settings → Membership. From there, you can sign up for full access to nomy’s features or cancel your membership.',
  },
  {
    question: 'Where can I get support?',
    answer:
      'For account, privacy, or app support, contact hello@nomy.app. nomy is not an emergency or crisis service.',
  },
  {
    question: 'What is the privacy policy?',
    answer:
      'Our Privacy Policy explains how nomy collects, uses and protects your information. You can read the full Privacy Policy',
    linkLabel: 'here.',
    linkUrl: 'https://nomy-app-fq92.onrender.com/privacy/',
  },
  {
    question: 'Is nomy medical advice?',
    answer:
      'No. nomy is a self-reflection and wellbeing app. It is not a medical, diagnostic, therapy, emergency, or crisis service.',
  },
] as const;
