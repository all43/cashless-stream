import type { Account } from '../lib/types'

// Featured — shown prominently, most contrasting
export const featuredScenarios: Account[] = [
  {
    name: 'Student',
    initialBalance: 200,
    currency: 'EUR',
    streams: [
      { id: 's-bafog', title: 'BAföG', period: 'monthly', value: 934, type: 'live', category: 'income', icon: '🎓' },
      { id: 's-minijob', title: 'Mini Job', period: 'monthly', value: 520, type: 'live', category: 'income', icon: '☕' },
      { id: 's-rent', title: 'WG Room', period: 'monthly', value: 450, type: 'live', category: 'expense', icon: '🏠' },
      { id: 's-food', title: 'Food & Mensa', period: 'monthly', value: 250, type: 'projected', category: 'expense', icon: '🍜' },
      { id: 's-transport', title: 'Semester Ticket', period: 'monthly', value: 35, type: 'live', category: 'expense', icon: '🚃' },
      { id: 's-phone', title: 'Phone Plan', period: 'monthly', value: 10, type: 'live', category: 'expense', icon: '📱' },
      { id: 's-spotify', title: 'Spotify Student', period: 'monthly', value: 5, type: 'live', category: 'expense', icon: '🎵' },
    ],
  },
  {
    name: 'Overextended',
    initialBalance: 1200,
    currency: 'EUR',
    streams: [
      { id: 'o-salary', title: 'Net Salary', period: 'monthly', value: 5800, type: 'live', category: 'income', icon: '💼' },
      { id: 'o-side', title: 'Side Income', period: 'monthly', value: 300, type: 'projected', category: 'income', icon: '📦' },
      { id: 'o-mortgage', title: 'Mortgage', period: 'monthly', value: 1950, type: 'live', category: 'expense', icon: '🏡' },
      { id: 'o-car1', title: 'Car Loan #1', period: 'monthly', value: 520, type: 'live', category: 'expense', icon: '🚗' },
      { id: 'o-car2', title: 'Car Loan #2', period: 'monthly', value: 380, type: 'live', category: 'expense', icon: '🚙' },
      { id: 'o-school', title: 'Private School', period: 'monthly', value: 1100, type: 'live', category: 'expense', icon: '🏫' },
      { id: 'o-food', title: 'Food & Dining', period: 'monthly', value: 820, type: 'projected', category: 'expense', icon: '🍽️', taxDeductible: false },
      { id: 'o-insurance', title: 'Insurance (all)', period: 'monthly', value: 480, type: 'live', category: 'expense', icon: '🛡️' },
      { id: 'o-credit', title: 'Credit Card Minimum', period: 'monthly', value: 350, type: 'live', category: 'expense', icon: '💳' },
      { id: 'o-subs', title: 'Subscriptions', period: 'monthly', value: 280, type: 'live', category: 'expense', icon: '📦' },
      { id: 'o-utilities', title: 'Utilities', period: 'monthly', value: 380, type: 'live', category: 'expense', icon: '⚡' },
    ],
  },
  {
    name: 'Retiree',
    initialBalance: 180000,
    currency: 'EUR',
    streams: [
      { id: 'r-pension', title: 'State Pension', period: 'monthly', value: 1840, type: 'live', category: 'income', icon: '🏛️' },
      { id: 'r-dividends', title: 'Portfolio Dividends', period: 'monthly', value: 680, type: 'live', category: 'income', icon: '📈' },
      { id: 'r-consulting', title: 'Occasional Consulting', period: 'monthly', value: 400, type: 'projected', category: 'income', icon: '🧠' },
      { id: 'r-housing', title: 'Housing (paid off)', period: 'monthly', value: 320, type: 'live', category: 'expense', icon: '🏡' },
      { id: 'r-food', title: 'Food & Groceries', period: 'monthly', value: 280, type: 'projected', category: 'expense', icon: '🛒' },
      { id: 'r-travel', title: 'Travel & Leisure', period: 'annual', value: 4800, type: 'projected', category: 'expense', icon: '🌍', taxDeductible: false },
      { id: 'r-car', title: 'Car (no loan)', period: 'monthly', value: 190, type: 'live', category: 'expense', icon: '🚗' },
      { id: 'r-subs', title: 'Subscriptions', period: 'monthly', value: 45, type: 'live', category: 'expense', icon: '📺' },
    ],
  },
]

// More — additional perspectives
export const moreScenarios: Account[] = [
  {
    name: 'Employed',
    initialBalance: 3200,
    currency: 'EUR',
    streams: [
      { id: 'em-salary', title: 'Salary', period: 'monthly', value: 2400, type: 'live', category: 'income', icon: '💼' },
      { id: 'em-rent', title: 'Rent', period: 'monthly', value: 850, type: 'live', category: 'expense', icon: '🏠' },
      { id: 'em-groceries', title: 'Groceries', period: 'monthly', value: 280, type: 'projected', category: 'expense', icon: '🛒' },
      { id: 'em-transport', title: 'Transit Pass', period: 'monthly', value: 49, type: 'live', category: 'expense', icon: '🚌' },
      { id: 'em-internet', title: 'Internet & Phone', period: 'monthly', value: 45, type: 'live', category: 'expense', icon: '🌐' },
      { id: 'em-subs', title: 'Subscriptions', period: 'monthly', value: 45, type: 'live', category: 'expense', icon: '📺' },
      { id: 'em-savings', title: 'Savings', period: 'monthly', value: 200, type: 'live', category: 'expense', icon: '🏦' },
    ],
  },
  {
    name: 'Couple',
    initialBalance: 8500,
    currency: 'EUR',
    streams: [
      { id: 'c-salary1', title: 'Salary (Partner 1)', period: 'monthly', value: 2800, type: 'live', category: 'income', icon: '💼' },
      { id: 'c-salary2', title: 'Salary (Partner 2)', period: 'monthly', value: 2400, type: 'live', category: 'income', icon: '💼' },
      { id: 'c-rent', title: 'Shared Apartment', period: 'monthly', value: 1400, type: 'live', category: 'expense', icon: '🏠' },
      { id: 'c-groceries', title: 'Groceries', period: 'monthly', value: 450, type: 'projected', category: 'expense', icon: '🛒' },
      { id: 'c-transport', title: 'Transport', period: 'monthly', value: 130, type: 'live', category: 'expense', icon: '🚌' },
      { id: 'c-utilities', title: 'Utilities', period: 'monthly', value: 180, type: 'live', category: 'expense', icon: '⚡' },
      { id: 'c-dining', title: 'Dining & Leisure', period: 'monthly', value: 220, type: 'projected', category: 'expense', icon: '🍽️', taxDeductible: false },
      { id: 'c-subs', title: 'Subscriptions', period: 'monthly', value: 65, type: 'live', category: 'expense', icon: '📺' },
      { id: 'c-insurance', title: 'Insurance', period: 'annual', value: 1200, type: 'live', category: 'expense', icon: '🛡️' },
    ],
  },
  {
    name: 'Executive',
    initialBalance: 28000,
    currency: 'EUR',
    streams: [
      { id: 'e-salary', title: 'Net Salary', period: 'monthly', value: 9400, type: 'live', category: 'income', icon: '💼' },
      { id: 'e-dividends', title: 'Dividends', period: 'monthly', value: 620, type: 'live', category: 'income', icon: '📈' },
      { id: 'e-rent', title: 'Apartment (luxury)', period: 'monthly', value: 2400, type: 'live', category: 'expense', icon: '🏠', taxDeductible: false },
      { id: 'e-car', title: 'Car Lease (premium)', period: 'monthly', value: 890, type: 'live', category: 'expense', icon: '🚗', taxDeductible: false },
      { id: 'e-food', title: 'Food & Dining', period: 'monthly', value: 750, type: 'projected', category: 'expense', icon: '🍽️', taxDeductible: false },
      { id: 'e-travel', title: 'Travel', period: 'annual', value: 7200, type: 'projected', category: 'expense', icon: '✈️', taxDeductible: false },
      { id: 'e-wellness', title: 'Wellness & Gym', period: 'monthly', value: 180, type: 'live', category: 'expense', icon: '🧘', taxDeductible: false },
      { id: 'e-subs', title: 'Subscriptions', period: 'monthly', value: 220, type: 'live', category: 'expense', icon: '📦', taxDeductible: false },
      { id: 'e-utilities', title: 'Utilities', period: 'monthly', value: 310, type: 'live', category: 'expense', icon: '⚡' },
    ],
  },
]

// Alternative income — non-salary primary income types
export const alternativeScenarios: Account[] = [
  {
    name: 'Landlord',
    initialBalance: 45000,
    currency: 'EUR',
    streams: [
      { id: 'll-apt1', title: 'Apartment #1 Rent', period: 'monthly', value: 1100, type: 'live', category: 'income', icon: '🏢' },
      { id: 'll-apt2', title: 'Apartment #2 Rent', period: 'monthly', value: 950, type: 'live', category: 'income', icon: '🏢' },
      { id: 'll-parttime', title: 'Part-time Job', period: 'monthly', value: 800, type: 'live', category: 'income', icon: '💼' },
      { id: 'll-mortgage1', title: 'Mortgage #1', period: 'monthly', value: 780, type: 'live', category: 'expense', icon: '🏡' },
      { id: 'll-mortgage2', title: 'Mortgage #2', period: 'monthly', value: 640, type: 'live', category: 'expense', icon: '🏡' },
      { id: 'll-maintenance', title: 'Property Maintenance', period: 'monthly', value: 180, type: 'projected', category: 'expense', icon: '🔧' },
      { id: 'll-insurance', title: 'Property Insurance', period: 'annual', value: 1400, type: 'live', category: 'expense', icon: '🛡️' },
      { id: 'll-living', title: 'Own Housing', period: 'monthly', value: 420, type: 'live', category: 'expense', icon: '🏠' },
      { id: 'll-health', title: 'Health Insurance', period: 'monthly', value: 240, type: 'live', category: 'expense', icon: '🏥' },
      { id: 'll-food', title: 'Food & Groceries', period: 'monthly', value: 300, type: 'projected', category: 'expense', icon: '🛒' },
    ],
  },
  {
    name: 'Investor',
    initialBalance: 220000,
    currency: 'EUR',
    streams: [
      { id: 'inv-dividends', title: 'ETF Dividends', period: 'monthly', value: 580, type: 'live', category: 'income', icon: '📈' },
      { id: 'inv-bonds', title: 'Bond Interest', period: 'monthly', value: 290, type: 'live', category: 'income', icon: '📊' },
      { id: 'inv-reit', title: 'REIT Distributions', period: 'monthly', value: 210, type: 'live', category: 'income', icon: '🏗️' },
      { id: 'inv-consulting', title: 'Occasional Consulting', period: 'monthly', value: 400, type: 'projected', category: 'income', icon: '🧠' },
      { id: 'inv-rent', title: 'Rent', period: 'monthly', value: 1050, type: 'live', category: 'expense', icon: '🏠' },
      { id: 'inv-health', title: 'Health Insurance', period: 'monthly', value: 420, type: 'live', category: 'expense', icon: '🏥' },
      { id: 'inv-food', title: 'Food & Groceries', period: 'monthly', value: 350, type: 'projected', category: 'expense', icon: '🛒' },
      { id: 'inv-rebalance', title: 'Reinvestment', period: 'monthly', value: 300, type: 'live', category: 'expense', icon: '♻️' },
      { id: 'inv-subs', title: 'Subscriptions', period: 'monthly', value: 85, type: 'live', category: 'expense', icon: '📺' },
      { id: 'inv-leisure', title: 'Leisure & Travel', period: 'monthly', value: 200, type: 'projected', category: 'expense', icon: '🌍' },
    ],
  },
  {
    name: 'Creator',
    initialBalance: 5500,
    currency: 'EUR',
    streams: [
      { id: 'cr-royalties', title: 'Book / Course Royalties', period: 'monthly', value: 780, type: 'live', category: 'income', icon: '📚' },
      { id: 'cr-licensing', title: 'Music / Photo Licensing', period: 'monthly', value: 320, type: 'live', category: 'income', icon: '🎵' },
      { id: 'cr-sponsorship', title: 'Sponsorships', period: 'monthly', value: 600, type: 'projected', category: 'income', icon: '🤝' },
      { id: 'cr-freelance', title: 'Freelance Projects', period: 'monthly', value: 1200, type: 'projected', category: 'income', icon: '💻' },
      { id: 'cr-rent', title: 'Rent', period: 'monthly', value: 900, type: 'live', category: 'expense', icon: '🏠' },
      { id: 'cr-health', title: 'Health Insurance', period: 'monthly', value: 200, type: 'live', category: 'expense', icon: '🏥' },
      { id: 'cr-tools', title: 'Tools & Software', period: 'monthly', value: 80, type: 'live', category: 'expense', icon: '🛠️' },
      { id: 'cr-food', title: 'Food & Groceries', period: 'monthly', value: 300, type: 'projected', category: 'expense', icon: '🛒' },
      { id: 'cr-transport', title: 'Transport', period: 'monthly', value: 60, type: 'live', category: 'expense', icon: '🚌' },
      { id: 'cr-savings', title: 'Buffer Savings', period: 'monthly', value: 250, type: 'live', category: 'expense', icon: '🏦' },
    ],
  },
]

// Combined for store.loadScenario() lookup
export const scenarios: Account[] = [...featuredScenarios, ...moreScenarios, ...alternativeScenarios]
