export const PROFESSIONAL_INTERESTS = [
  'Crypto',
  'Software Development',
  'AI / ML',
  'Marketing',
  'Entrepreneurship',
  'Business Development',
  'Network State',
  'DeFi',
  'Web3',
  'Venture Capital',
  'Finance',
  'Design',
  'Content Creation',
  'Healthcare',
  'Legal',
  'Real Estate',
  'Education',
  'Other',
] as const

export const PERSONAL_INTERESTS = [
  'Network State',
  'Longevity',
  'Crypto',
  'Investments',
  'Fitness',
  'Mindfulness',
  'Travel',
  'Reading',
  'Philosophy',
  'Nutrition',
  'Biohacking',
  'Art & Culture',
  'Sports',
  'Gaming',
  'Parenting',
  'Music',
  'Other',
] as const

export const TOP_LANGUAGES = [
  'English',
  'Hindi',
  'Mandarin Chinese',
  'Malay',
  'Russian',
  'Arabic',
  'Spanish',
  'Portuguese',
  'French',
  'Japanese',
  'German',
  'Korean',
  'Italian',
  'Thai',
  'Vietnamese',
  'Turkish',
  'Dutch',
  'Polish',
  'Swedish',
  'Danish',
]

export const SPECIAL_RESIDENCE_OPTIONS = [
  { value: 'Network School', label: 'Network School', icon: '🏛', special: true },
  { value: 'Digital Nomad', label: 'Digital Nomad', icon: '🌍', special: true },
]

export const COHORT_FORMAT = 'MMMM yyyy' // e.g. "April 2025"

export const AVAILABLE_COHORTS = [
  'February 2025',
  'March 2025',
  'April 2025',
  'May 2025',
  'June 2025',
  'July 2025',
  'August 2025',
  'September 2025',
  'October 2025',
]

export const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda',
  'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain',
  'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria',
  'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada',
  'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
  'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic',
  'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica',
  'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
  'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
  'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras',
  'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
  'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho',
  'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar',
  'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
  'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco',
  'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia',
  'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger',
  'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan',
  'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru',
  'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
  'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo',
  'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe',
]

export const LOOKING_FOR_OPTIONS = [
  { key: 'looking_for_professional', label: 'Professional connections / collaboration', icon: 'Briefcase' },
  { key: 'looking_for_friendship', label: 'Friendship & shared interests', icon: 'Users' },
  { key: 'looking_for_romantic', label: 'Romantic interest', icon: 'Heart' },
  { key: 'looking_for_job', label: 'Looking for a job', icon: 'Search' },
  { key: 'looking_for_cofounder', label: 'Looking for a co-founder', icon: 'Handshake' },
] as const

export const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
export const PROFILE_PHOTOS_BUCKET = 'profile-photos'
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ns-peoplebook.vercel.app'
