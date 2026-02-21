/**
 * NS Peoplebook Seed Script
 *
 * Creates 15 demo member profiles + 2 special accounts for pitch demo.
 *
 * Usage:
 *   1. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   2. Run: npx ts-node --project tsconfig.json scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const SEED_PROFILES = [
  {
    email: 'alice.chen@example.com',
    display_name: 'Alice C.',
    country: 'Network School',
    cohort: 'February 2025',
    citizenships: ['Singapore', 'United States'],
    age: 28,
    gender: 'female',
    languages: ['English', 'Mandarin Chinese'],
    pro_interests: ['Software Development', 'AI / ML', 'Entrepreneurship'],
    personal_interests: ['Fitness', 'Reading', 'Philosophy'],
    looking_for_professional: true,
    looking_for_cofounder: true,
    contact_telegram: '@alice_c',
    contact_linkedin: 'https://linkedin.com/in/alice-c',
    additional_info: [{ label: 'What I\'m building', value: 'An AI-powered fitness coaching app for digital nomads.' }],
    visibility: { photo: true, display_name: true, country_of_residence: true, professional_interests: true, personal_interests: true, looking_for: true, contact_telegram: true, contact_linkedin: true, additional_info: true, languages: true },
  },
  {
    email: 'marco.rossi@example.com',
    display_name: 'Marco R.',
    country: 'Network School',
    cohort: 'February 2025',
    citizenships: ['Italy'],
    age: 34,
    gender: 'male',
    languages: ['Italian', 'English', 'Spanish'],
    pro_interests: ['Venture Capital', 'Crypto', 'DeFi'],
    personal_interests: ['Longevity', 'Biohacking', 'Travel'],
    looking_for_professional: true,
    looking_for_friendship: true,
    contact_telegram: '@marco_r',
    additional_info: [{ label: 'Background', value: 'Early-stage VC based in Milan. Previously co-founded a fintech startup.' }],
    visibility: { display_name: true, country_of_residence: true, professional_interests: true, personal_interests: true, looking_for: true, contact_telegram: true, additional_info: true, languages: true },
  },
  {
    email: 'priya.sharma@example.com',
    display_name: 'Priya S.',
    country: 'India',
    cohort: 'February 2025',
    citizenships: ['India'],
    age: 31,
    gender: 'female',
    languages: ['English', 'Hindi'],
    pro_interests: ['Healthcare', 'AI / ML', 'Education'],
    personal_interests: ['Yoga', 'Reading', 'Nutrition'],
    looking_for_professional: true,
    looking_for_friendship: true,
    contact_linkedin: 'https://linkedin.com/in/priya-s',
    additional_info: [{ label: 'Current work', value: 'Building AI diagnostic tools for rural healthcare in India.' }],
    visibility: { display_name: true, country_of_residence: true, professional_interests: true, personal_interests: true, looking_for: true, contact_linkedin: true, additional_info: true, languages: true },
  },
  {
    email: 'james.okafor@example.com',
    display_name: 'James O.',
    country: 'Network School',
    cohort: 'March 2025',
    citizenships: ['Nigeria', 'United Kingdom'],
    age: 29,
    gender: 'male',
    languages: ['English', 'Yoruba'],
    pro_interests: ['Web3', 'Finance', 'Business Development'],
    personal_interests: ['Crypto', 'Investments', 'Sports'],
    looking_for_cofounder: true,
    looking_for_professional: true,
    contact_telegram: '@james_o',
    additional_info: [{ label: 'Looking for', value: 'Technical co-founder for a Web3 payments startup targeting Africa.' }],
    visibility: { display_name: true, country_of_residence: true, professional_interests: true, personal_interests: true, looking_for: true, contact_telegram: true, additional_info: true, languages: true },
  },
  {
    email: 'sofia.petrov@example.com',
    display_name: 'Sofia P.',
    country: 'Network School',
    cohort: 'March 2025',
    citizenships: ['Russia', 'Estonia'],
    age: 26,
    gender: 'female',
    languages: ['Russian', 'English', 'Estonian'],
    pro_interests: ['Design', 'Marketing', 'Content Creation'],
    personal_interests: ['Art & Culture', 'Music', 'Travel'],
    looking_for_professional: true,
    looking_for_friendship: true,
    looking_for_romantic: true,
    romantic_interest_in: 'men',
    contact_instagram: '@sofia.designs',
    additional_info: [{ label: 'Portfolio', value: 'Brand design and visual identity for Web3 and tech startups.' }],
    visibility: { display_name: true, country_of_residence: true, professional_interests: true, personal_interests: true, looking_for: true, contact_instagram: true, additional_info: true, languages: true },
  },
  {
    email: 'liam.walker@example.com',
    display_name: 'Liam W.',
    country: 'United States',
    cohort: 'March 2025',
    citizenships: ['United States'],
    age: 33,
    gender: 'male',
    languages: ['English'],
    pro_interests: ['Software Development', 'AI / ML', 'Entrepreneurship'],
    personal_interests: ['Gaming', 'Philosophy', 'Fitness'],
    looking_for_professional: true,
    looking_for_job: true,
    contact_github: 'liam-walker',
    contact_linkedin: 'https://linkedin.com/in/liam-w',
    additional_info: [{ label: 'Skills', value: 'Full-stack engineer, 8 years exp. TypeScript, Rust, AI/ML pipelines.' }],
    visibility: { display_name: true, country_of_residence: true, professional_interests: true, personal_interests: true, looking_for: true, contact_linkedin: true, additional_info: true, languages: true },
  },
  {
    email: 'yuki.tanaka@example.com',
    display_name: 'Yuki T.',
    country: 'Network School',
    cohort: 'March 2025',
    citizenships: ['Japan'],
    age: 30,
    gender: 'female',
    languages: ['Japanese', 'English'],
    pro_interests: ['Network State', 'Legal', 'Finance'],
    personal_interests: ['Network State', 'Longevity', 'Reading'],
    looking_for_professional: true,
    looking_for_friendship: true,
    contact_telegram: '@yuki_t',
    additional_info: [{ label: 'Background', value: 'International lawyer interested in Network State governance models.' }],
    visibility: { display_name: true, country_of_residence: true, professional_interests: true, personal_interests: true, looking_for: true, contact_telegram: true, additional_info: true, languages: true },
  },
  {
    email: 'carlos.mendez@example.com',
    display_name: 'Carlos M.',
    country: 'Mexico',
    cohort: 'April 2025',
    citizenships: ['Mexico'],
    age: 27,
    gender: 'male',
    languages: ['Spanish', 'English', 'Portuguese'],
    pro_interests: ['Entrepreneurship', 'Marketing', 'Real Estate'],
    personal_interests: ['Travel', 'Parenting', 'Investments'],
    looking_for_professional: true,
    looking_for_friendship: true,
    contact_whatsapp: '+521234567890',
    additional_info: [{ label: 'Projects', value: 'Building a co-living network for remote workers across Latin America.' }],
    visibility: { display_name: true, country_of_residence: true, professional_interests: true, personal_interests: true, looking_for: true, additional_info: true, languages: true },
  },
  {
    email: 'fatima.al-rashid@example.com',
    display_name: 'Fatima A.',
    country: 'Network School',
    cohort: 'April 2025',
    citizenships: ['United Arab Emirates', 'Lebanon'],
    age: 32,
    gender: 'female',
    languages: ['Arabic', 'English', 'French'],
    pro_interests: ['Finance', 'Venture Capital', 'Business Development'],
    personal_interests: ['Mindfulness', 'Philosophy', 'Nutrition'],
    looking_for_professional: true,
    looking_for_cofounder: true,
    contact_linkedin: 'https://linkedin.com/in/fatima-a',
    additional_info: [{ label: 'Focus', value: 'Founder of a MENA-focused climate tech fund. Previously investment banking.' }],
    visibility: { display_name: true, country_of_residence: true, professional_interests: true, personal_interests: true, looking_for: true, contact_linkedin: true, additional_info: true, languages: true },
  },
  {
    email: 'nikolai.ivanov@example.com',
    display_name: 'Nikolai I.',
    country: 'Network School',
    cohort: 'April 2025',
    citizenships: ['Russia'],
    age: 35,
    gender: 'male',
    languages: ['Russian', 'English'],
    pro_interests: ['Crypto', 'DeFi', 'Software Development'],
    personal_interests: ['Biohacking', 'Longevity', 'Philosophy'],
    looking_for_professional: true,
    looking_for_cofounder: true,
    looking_for_friendship: true,
    contact_telegram: '@nik_i',
    additional_info: [{ label: 'Background', value: 'Ex-Google engineer. Building decentralized identity infrastructure.' }],
    visibility: { display_name: true, country_of_residence: true, professional_interests: true, personal_interests: true, looking_for: true, contact_telegram: true, additional_info: true, languages: true },
  },
  {
    email: 'emma.johnson@example.com',
    display_name: 'Emma J.',
    country: 'United Kingdom',
    cohort: 'February 2025',
    citizenships: ['United Kingdom', 'Australia'],
    age: 29,
    gender: 'female',
    languages: ['English'],
    pro_interests: ['Content Creation', 'Marketing', 'Education'],
    personal_interests: ['Reading', 'Music', 'Mindfulness'],
    looking_for_professional: true,
    looking_for_friendship: true,
    contact_instagram: '@emma.creates',
    additional_info: [{ label: 'Work', value: 'Content strategist for Web3 and crypto projects. Writer on network states.' }],
    visibility: { display_name: true, country_of_residence: true, professional_interests: true, personal_interests: true, looking_for: true, contact_instagram: true, additional_info: true, languages: true },
  },
  {
    email: 'rafael.santos@example.com',
    display_name: 'Rafael S.',
    country: 'Brazil',
    cohort: 'March 2025',
    citizenships: ['Brazil'],
    age: 31,
    gender: 'male',
    languages: ['Portuguese', 'English', 'Spanish'],
    pro_interests: ['Software Development', 'AI / ML', 'Healthcare'],
    personal_interests: ['Sports', 'Fitness', 'Travel'],
    looking_for_professional: true,
    looking_for_job: true,
    contact_linkedin: 'https://linkedin.com/in/rafael-s',
    additional_info: [{ label: 'Current role', value: 'ML engineer at a Brazilian healthtech. Looking for global opportunities.' }],
    visibility: { display_name: true, country_of_residence: true, professional_interests: true, personal_interests: true, looking_for: true, contact_linkedin: true, additional_info: true, languages: true },
  },
  {
    email: 'mei.lin@example.com',
    display_name: 'Mei L.',
    country: 'Network School',
    cohort: 'April 2025',
    citizenships: ['China', 'Singapore'],
    age: 27,
    gender: 'female',
    languages: ['Mandarin Chinese', 'English', 'Malay'],
    pro_interests: ['AI / ML', 'Entrepreneurship', 'Network State'],
    personal_interests: ['Network State', 'Philosophy', 'Art & Culture'],
    looking_for_professional: true,
    looking_for_friendship: true,
    looking_for_romantic: true,
    romantic_interest_in: 'both',
    contact_telegram: '@mei_l',
    additional_info: [{ label: 'Interests', value: 'Researching digital governance and AI policy at the intersection of East and West.' }],
    visibility: { display_name: true, country_of_residence: true, professional_interests: true, personal_interests: true, looking_for: true, contact_telegram: true, additional_info: true, languages: true },
  },
  {
    email: 'ibrahim.hassan@example.com',
    display_name: 'Ibrahim H.',
    country: 'Network School',
    cohort: 'February 2025',
    citizenships: ['Egypt', 'Germany'],
    age: 36,
    gender: 'male',
    languages: ['Arabic', 'German', 'English'],
    pro_interests: ['Real Estate', 'Finance', 'Entrepreneurship'],
    personal_interests: ['Investments', 'Crypto', 'Fitness'],
    looking_for_professional: true,
    looking_for_cofounder: true,
    contact_whatsapp: '+49123456789',
    additional_info: [{ label: 'Current project', value: 'Tokenized real estate platform bridging Europe and MENA markets.' }],
    visibility: { display_name: true, country_of_residence: true, professional_interests: true, personal_interests: true, looking_for: true, additional_info: true, languages: true },
  },
  {
    email: 'anna.kowalski@example.com',
    display_name: 'Anna K.',
    country: 'Network School',
    cohort: 'April 2025',
    citizenships: ['Poland'],
    age: 28,
    gender: 'female',
    languages: ['Polish', 'English', 'German'],
    pro_interests: ['Design', 'Entrepreneurship', 'Content Creation'],
    personal_interests: ['Art & Culture', 'Travel', 'Gaming'],
    looking_for_professional: true,
    looking_for_friendship: true,
    contact_instagram: '@anna.k.design',
    contact_telegram: '@anna_k',
    additional_info: [{ label: 'Focus', value: 'UX/product designer. Currently building a design system for Web3 protocols.' }],
    visibility: { display_name: true, country_of_residence: true, professional_interests: true, personal_interests: true, looking_for: true, contact_telegram: true, contact_instagram: true, additional_info: true, languages: true },
  },
]

async function seed() {
  console.log('Seeding NS Peoplebook...\n')

  for (const p of SEED_PROFILES) {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: p.email,
      email_confirm: true,
      user_metadata: { display_name: p.display_name },
    })

    if (authError) {
      console.log(`⚠ Auth user for ${p.email}: ${authError.message}`)
      continue
    }

    const userId = authData.user.id
    const isNsResident = p.country === 'Network School'

    // Insert profile
    const slug = p.display_name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .trim()
      .replace(/\s+/g, '-') + '-' + userId.slice(0, 4)

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        display_name: p.display_name,
        citizenships: p.citizenships || [],
        country_of_residence: p.country,
        is_ns_resident: isNsResident,
        age: p.age,
        gender: p.gender,
        languages: p.languages || [],
        professional_interests: p.pro_interests || [],
        personal_interests: p.personal_interests || [],
        looking_for_professional: p.looking_for_professional || false,
        looking_for_friendship: p.looking_for_friendship || false,
        looking_for_romantic: p.looking_for_romantic || false,
        romantic_interest_in: p.romantic_interest_in || null,
        looking_for_job: p.looking_for_job || false,
        looking_for_cofounder: p.looking_for_cofounder || false,
        contact_email: p.email,
        contact_whatsapp: p.contact_whatsapp || null,
        contact_telegram: p.contact_telegram || null,
        contact_instagram: p.contact_instagram || null,
        contact_linkedin: p.contact_linkedin || null,
        additional_info: p.additional_info || [],
        cohort: p.cohort,
        profile_slug: slug,
        agreed_terms: true,
        is_active: true,
      })
      .select()
      .single()

    if (profileError) {
      console.log(`⚠ Profile for ${p.email}: ${profileError.message}`)
      continue
    }

    // Insert visibility
    const visRows = Object.entries(p.visibility || {}).map(([section, is_public]) => ({
      profile_id: profile.id,
      section,
      is_public,
    }))

    await supabase.from('profile_visibility').upsert(visRows, { onConflict: 'profile_id,section' })

    // Add to allowlist
    await supabase.from('allowed_emails').upsert({ email: p.email, note: 'Seed' }, { onConflict: 'email' })

    console.log(`✓ Created profile: ${p.display_name} (${p.email})`)
  }

  console.log('\n✓ Seed complete!')
}

seed().catch(console.error)
