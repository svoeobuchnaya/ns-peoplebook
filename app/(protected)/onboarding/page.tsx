'use client'

import { useState, useRef, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ReactCrop, { type Crop, type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import { profileSchema, type ProfileFormData } from '@/lib/validations/profile.schema'
import {
  PROFESSIONAL_INTERESTS,
  PERSONAL_INTERESTS,
  TOP_LANGUAGES,
  COUNTRIES,
  LOOKING_FOR_OPTIONS,
  PROFILE_PHOTOS_BUCKET,
} from '@/lib/constants'
import {
  DEFAULT_VISIBILITY,
  type VisibilitySection,
  ALL_VISIBILITY_SECTIONS,
} from '@/types/index'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { VisibilityToggle } from '@/components/profile/VisibilityToggle'
import { TagInput } from '@/components/profile/TagInput'
import { InterestChips } from '@/components/profile/InterestChips'
import { ArrowLeft, Upload, Trash2, Plus, X, Briefcase, Users, Heart, Search, Handshake } from 'lucide-react'

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 80 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  )
}

async function getCroppedBlob(
  image: HTMLImageElement,
  crop: PixelCrop,
  fileName: string
): Promise<File | null> {
  const canvas = document.createElement('canvas')
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  canvas.width = crop.width
  canvas.height = crop.height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width,
    crop.height
  )

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) { resolve(null); return }
        resolve(new File([blob], fileName, { type: 'image/jpeg' }))
      },
      'image/jpeg',
      0.92
    )
  })
}

// ─────────────────────────────────────────────
// Step metadata
// ─────────────────────────────────────────────

const STEP_TITLES = [
  'Profile Photo',
  'Personal Details',
  'Professional Interests',
  'Personal Interests',
  'Looking For',
  'Contact Information',
  'Additional Information',
  'Privacy Agreement',
]

const TOTAL_STEPS = 8

// ─────────────────────────────────────────────
// Main Page Component
// ─────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Visibility state
  const [visibility, setVisibility] = useState<Record<string, boolean>>(
    DEFAULT_VISIBILITY as Record<string, boolean>
  )

  // Photo crop state
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [photoUploadError, setPhotoUploadError] = useState<string | null>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Additional info state (managed outside form for dynamic row control)
  const [additionalInfo, setAdditionalInfo] = useState<{ label: string; value: string }[]>([])

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: '',
      photo_url: '',
      citizenships: [],
      country_of_residence: '',
      age: undefined,
      gender: null,
      languages: [],
      professional_interests: [],
      personal_interests: [],
      looking_for_professional: false,
      looking_for_friendship: false,
      looking_for_romantic: false,
      romantic_interest_in: null,
      looking_for_job: false,
      looking_for_cofounder: false,
      contact_email: '',
      contact_whatsapp: '',
      contact_telegram: '',
      contact_discord: '',
      contact_instagram: '',
      contact_facebook: '',
      contact_linkedin: '',
      additional_info: [],
      agreed_terms: undefined as unknown as true,
      profile_slug: null,
      cohort: null,
    },
  })

  const watchedLookingForRomantic = watch('looking_for_romantic')

  // ─── Visibility helper ───────────────────────────────────
  const setVis = (section: string, val: boolean) => {
    setVisibility((prev) => ({ ...prev, [section]: val }))
  }

  // ─── Step validation fields map ─────────────────────────
  const stepFields: Record<number, (keyof ProfileFormData)[]> = {
    1: ['photo_url'],
    2: ['display_name', 'country_of_residence'],
    3: ['professional_interests'],
    4: ['personal_interests'],
    5: [],
    6: [],
    7: [],
    8: ['agreed_terms'],
  }

  // ─── Navigation ──────────────────────────────────────────
  const goBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1)
    setSubmitError(null)
  }

  const goNext = async () => {
    const fields = stepFields[currentStep]
    if (fields && fields.length > 0) {
      const valid = await trigger(fields)
      if (!valid) return
    }
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((s) => s + 1)
      setSubmitError(null)
    }
  }

  // ─── Photo upload ────────────────────────────────────────
  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploadError(null)
    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
      setCrop(undefined)
      setCompletedCrop(undefined)
      setPhotoPreviewUrl(null)
      setValue('photo_url', '')
    }
    reader.readAsDataURL(file)
    // Reset file input
    e.target.value = ''
  }

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width, naturalHeight: height } = e.currentTarget
    const initialCrop = centerAspectCrop(width, height, 1)
    setCrop(initialCrop)
  }, [])

  const handleApplyCrop = async () => {
    if (!completedCrop || !imgRef.current) return
    setIsUploadingPhoto(true)
    setPhotoUploadError(null)
    try {
      const file = await getCroppedBlob(imgRef.current, completedCrop, 'profile.jpg')
      if (!file) throw new Error('Failed to create image')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const fileName = `${user.id}/avatar-${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage
        .from(PROFILE_PHOTOS_BUCKET)
        .upload(fileName, file, { upsert: true, contentType: 'image/jpeg' })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from(PROFILE_PHOTOS_BUCKET)
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl
      setValue('photo_url', publicUrl)
      setPhotoPreviewUrl(publicUrl)
      setImageSrc(null)
    } catch (err) {
      setPhotoUploadError(err instanceof Error ? err.message : 'Upload failed. Please try again.')
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = () => {
    setImageSrc(null)
    setPhotoPreviewUrl(null)
    setCompletedCrop(undefined)
    setCrop(undefined)
    setValue('photo_url', '')
    setPhotoUploadError(null)
  }

  // ─── Final submit ────────────────────────────────────────
  const onSubmit = async (data: ProfileFormData) => {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const payload = {
        ...data,
        additional_info: additionalInfo,
        visibility: visibility,
      }

      const res = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || body.message || `Server error: ${res.status}`)
      }

      router.push('/profile/me')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progressValue = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100

  // ─── Render steps ────────────────────────────────────────

  const renderStep = () => {
    switch (currentStep) {
      // ─── Step 1: Photo ───────────────────────────────────
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-black">Profile Photo</h2>
                <p className="text-sm text-[#888888] mt-0.5">
                  Upload a photo so others can recognise you.
                </p>
              </div>
              <VisibilityToggle
                section="photo"
                value={visibility.photo}
                onChange={(v) => setVis('photo', v)}
                label="Photo"
              />
            </div>

            {/* Preview of uploaded photo */}
            {photoPreviewUrl && !imageSrc && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-[#E0E0E0]">
                  <Image
                    src={photoPreviewUrl}
                    alt="Profile preview"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-black border border-[#E0E0E0] rounded-sm px-3 py-1.5 hover:bg-[#F5F5F5] transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Change photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-[#888888] border border-[#E0E0E0] rounded-sm px-3 py-1.5 hover:text-black hover:bg-[#F5F5F5] transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Crop interface */}
            {imageSrc && (
              <div className="space-y-4">
                <p className="text-sm text-[#888888]">
                  Drag to adjust the crop area, then click "Apply Crop".
                </p>
                <div className="max-w-sm mx-auto">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    circularCrop
                    className="rounded-sm overflow-hidden"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imgRef}
                      src={imageSrc}
                      alt="Crop preview"
                      onLoad={onImageLoad}
                      className="max-w-full"
                    />
                  </ReactCrop>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleApplyCrop}
                    disabled={!completedCrop || isUploadingPhoto}
                    className="bg-black text-white hover:bg-black/80 rounded-sm text-sm"
                  >
                    {isUploadingPhoto ? 'Uploading...' : 'Apply Crop & Upload'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemovePhoto}
                    className="border-[#E0E0E0] text-black rounded-sm text-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {/* Upload area — shown when no image selected and no preview */}
            {!imageSrc && !photoPreviewUrl && (
              <div
                className="border-2 border-dashed border-[#E0E0E0] rounded-sm p-10 flex flex-col items-center gap-3 cursor-pointer hover:border-black transition-colors"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files?.[0]
                  if (!file) return
                  const event = { target: { files: e.dataTransfer.files, value: '' } } as unknown as React.ChangeEvent<HTMLInputElement>
                  onSelectFile(event)
                }}
              >
                <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                  <Upload className="w-7 h-7 text-[#888888]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-black">Click to upload or drag & drop</p>
                  <p className="text-xs text-[#888888] mt-0.5">JPEG, PNG, WebP up to 5 MB</p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={onSelectFile}
              className="hidden"
            />

            {photoUploadError && (
              <p className="text-sm text-red-600">{photoUploadError}</p>
            )}

            <p className="text-xs text-[#888888]">
              You can skip this step and add a photo later from your profile.
            </p>
          </div>
        )

      // ─── Step 2: Personal Details ────────────────────────
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-black">Personal Details</h2>
              <p className="text-sm text-[#888888] mt-0.5">
                Tell us a little about yourself.
              </p>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-black">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <VisibilityToggle
                  section="display_name"
                  value={visibility.display_name}
                  onChange={(v) => setVis('display_name', v)}
                  label="Display name"
                />
              </div>
              <Input
                {...register('display_name')}
                placeholder="Your name as it will appear on your profile"
                className="border-[#E0E0E0] rounded-sm focus-visible:border-black focus-visible:ring-0"
              />
              {errors.display_name && (
                <p className="text-xs text-red-600">{errors.display_name.message}</p>
              )}
            </div>

            {/* Citizenships */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-black">Citizenships</label>
                <VisibilityToggle
                  section="citizenships"
                  value={visibility.citizenships}
                  onChange={(v) => setVis('citizenships', v)}
                  label="Citizenships"
                />
              </div>
              <Controller
                name="citizenships"
                control={control}
                render={({ field }) => (
                  <TagInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    suggestions={COUNTRIES}
                    placeholder="Type a country..."
                    maxTags={10}
                  />
                )}
              />
            </div>

            {/* Country of Residence */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-black">
                  Country of Residence <span className="text-red-500">*</span>
                </label>
                <VisibilityToggle
                  section="country_of_residence"
                  value={visibility.country_of_residence}
                  onChange={(v) => setVis('country_of_residence', v)}
                  label="Country of residence"
                />
              </div>
              <Controller
                name="country_of_residence"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full border-[#E0E0E0] rounded-sm focus:border-black focus:ring-0">
                      <SelectValue placeholder="Select a country..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Network School">
                        🏛 Network School
                      </SelectItem>
                      <SelectItem value="Digital Nomad">
                        🌍 Digital Nomad
                      </SelectItem>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.country_of_residence && (
                <p className="text-xs text-red-600">{errors.country_of_residence.message}</p>
              )}
            </div>

            {/* Age */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-black">Age</label>
                <VisibilityToggle
                  section="age"
                  value={visibility.age}
                  onChange={(v) => setVis('age', v)}
                  label="Age"
                />
              </div>
              <Input
                type="number"
                min={18}
                max={120}
                placeholder="Your age"
                className="border-[#E0E0E0] rounded-sm focus-visible:border-black focus-visible:ring-0"
                {...register('age', {
                  setValueAs: (v) => (v === '' || v === null ? null : Number(v)),
                })}
              />
              {errors.age && (
                <p className="text-xs text-red-600">{errors.age.message}</p>
              )}
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-black">Gender</label>
                <VisibilityToggle
                  section="gender"
                  value={visibility.gender}
                  onChange={(v) => setVis('gender', v)}
                  label="Gender"
                />
              </div>
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                    <SelectTrigger className="w-full border-[#E0E0E0] rounded-sm focus:border-black focus:ring-0">
                      <SelectValue placeholder="Select gender..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Languages */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-black">Languages</label>
                <VisibilityToggle
                  section="languages"
                  value={visibility.languages}
                  onChange={(v) => setVis('languages', v)}
                  label="Languages"
                />
              </div>
              <Controller
                name="languages"
                control={control}
                render={({ field }) => (
                  <TagInput
                    value={field.value ?? []}
                    onChange={field.onChange}
                    suggestions={TOP_LANGUAGES}
                    placeholder="Type a language..."
                    maxTags={20}
                  />
                )}
              />
            </div>
          </div>
        )

      // ─── Step 3: Professional Interests ─────────────────
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-black">Professional Interests</h2>
                <p className="text-sm text-[#888888] mt-0.5">
                  Select the professional areas you work in or care about most.
                </p>
              </div>
              <VisibilityToggle
                section="professional_interests"
                value={visibility.professional_interests}
                onChange={(v) => setVis('professional_interests', v)}
                label="Professional interests"
              />
            </div>
            <Controller
              name="professional_interests"
              control={control}
              render={({ field }) => (
                <InterestChips
                  value={field.value ?? []}
                  onChange={field.onChange}
                  options={[...PROFESSIONAL_INTERESTS]}
                  label="Professional Interest"
                />
              )}
            />
            {errors.professional_interests && (
              <p className="text-xs text-red-600">{errors.professional_interests.message}</p>
            )}
          </div>
        )

      // ─── Step 4: Personal Interests ─────────────────────
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-black">Personal Interests</h2>
                <p className="text-sm text-[#888888] mt-0.5">
                  What do you enjoy outside of work?
                </p>
              </div>
              <VisibilityToggle
                section="personal_interests"
                value={visibility.personal_interests}
                onChange={(v) => setVis('personal_interests', v)}
                label="Personal interests"
              />
            </div>
            <Controller
              name="personal_interests"
              control={control}
              render={({ field }) => (
                <InterestChips
                  value={field.value ?? []}
                  onChange={field.onChange}
                  options={[...PERSONAL_INTERESTS]}
                  label="Personal Interest"
                />
              )}
            />
            {errors.personal_interests && (
              <p className="text-xs text-red-600">{errors.personal_interests.message}</p>
            )}
          </div>
        )

      // ─── Step 5: Looking For ────────────────────────────
      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-black">Looking For</h2>
                <p className="text-sm text-[#888888] mt-0.5">
                  What kinds of connections are you open to? Select all that apply.
                </p>
              </div>
              <VisibilityToggle
                section="looking_for"
                value={visibility.looking_for}
                onChange={(v) => setVis('looking_for', v)}
                label="Looking for"
              />
            </div>

            <div className="space-y-3">
              {/* Professional */}
              <Controller
                name="looking_for_professional"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center gap-3 p-3 border border-[#E0E0E0] rounded-sm cursor-pointer hover:bg-[#F5F5F5] transition-colors">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                    />
                    <Briefcase className="w-4 h-4 text-[#888888] flex-shrink-0" />
                    <span className="text-sm font-medium text-black">
                      Professional connections / collaboration
                    </span>
                  </label>
                )}
              />

              {/* Friendship */}
              <Controller
                name="looking_for_friendship"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center gap-3 p-3 border border-[#E0E0E0] rounded-sm cursor-pointer hover:bg-[#F5F5F5] transition-colors">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                    />
                    <Users className="w-4 h-4 text-[#888888] flex-shrink-0" />
                    <span className="text-sm font-medium text-black">
                      Friendship &amp; shared interests
                    </span>
                  </label>
                )}
              />

              {/* Romantic */}
              <Controller
                name="looking_for_romantic"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center gap-3 p-3 border border-[#E0E0E0] rounded-sm cursor-pointer hover:bg-[#F5F5F5] transition-colors">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                    />
                    <Heart className="w-4 h-4 text-[#888888] flex-shrink-0" />
                    <span className="text-sm font-medium text-black">
                      Romantic interest
                    </span>
                  </label>
                )}
              />

              {/* Romantic sub-option */}
              {watchedLookingForRomantic && (
                <div className="ml-10 mt-1 space-y-1">
                  <p className="text-xs text-[#888888] mb-2 font-medium uppercase tracking-wide">
                    Interested in
                  </p>
                  <Controller
                    name="romantic_interest_in"
                    control={control}
                    render={({ field }) => (
                      <div className="flex gap-2 flex-wrap">
                        {(['men', 'women', 'both'] as const).map((opt) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => field.onChange(field.value === opt ? null : opt)}
                            className={cn(
                              'px-3 py-1.5 text-sm font-medium rounded-sm border transition-colors capitalize',
                              field.value === opt
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-black border-[#E0E0E0] hover:border-black'
                            )}
                          >
                            {opt === 'both' ? 'Both' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  />
                </div>
              )}

              {/* Job */}
              <Controller
                name="looking_for_job"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center gap-3 p-3 border border-[#E0E0E0] rounded-sm cursor-pointer hover:bg-[#F5F5F5] transition-colors">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                    />
                    <Search className="w-4 h-4 text-[#888888] flex-shrink-0" />
                    <span className="text-sm font-medium text-black">
                      Looking for a job
                    </span>
                  </label>
                )}
              />

              {/* Co-founder */}
              <Controller
                name="looking_for_cofounder"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center gap-3 p-3 border border-[#E0E0E0] rounded-sm cursor-pointer hover:bg-[#F5F5F5] transition-colors">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="data-[state=checked]:bg-black data-[state=checked]:border-black"
                    />
                    <Handshake className="w-4 h-4 text-[#888888] flex-shrink-0" />
                    <span className="text-sm font-medium text-black">
                      Looking for a co-founder
                    </span>
                  </label>
                )}
              />
            </div>
          </div>
        )

      // ─── Step 6: Contact Information ────────────────────
      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-black">Contact Information</h2>
              <p className="text-sm text-[#888888] mt-0.5">
                Share how people can reach you. All fields are optional.
              </p>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-black">Email</label>
                <VisibilityToggle
                  section="contact_email"
                  value={visibility.contact_email}
                  onChange={(v) => setVis('contact_email', v)}
                  label="Email"
                />
              </div>
              <Input
                type="email"
                placeholder="you@example.com"
                className="border-[#E0E0E0] rounded-sm focus-visible:border-black focus-visible:ring-0"
                {...register('contact_email')}
              />
              {errors.contact_email && (
                <p className="text-xs text-red-600">{errors.contact_email.message}</p>
              )}
            </div>

            {/* WhatsApp */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-black">WhatsApp</label>
                <VisibilityToggle
                  section="contact_whatsapp"
                  value={visibility.contact_whatsapp}
                  onChange={(v) => setVis('contact_whatsapp', v)}
                  label="WhatsApp"
                />
              </div>
              <Input
                placeholder="+1 234 567 8900"
                className="border-[#E0E0E0] rounded-sm focus-visible:border-black focus-visible:ring-0"
                {...register('contact_whatsapp')}
              />
            </div>

            {/* Telegram */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-black">Telegram</label>
                <VisibilityToggle
                  section="contact_telegram"
                  value={visibility.contact_telegram}
                  onChange={(v) => setVis('contact_telegram', v)}
                  label="Telegram"
                />
              </div>
              <Input
                placeholder="@username"
                className="border-[#E0E0E0] rounded-sm focus-visible:border-black focus-visible:ring-0"
                {...register('contact_telegram')}
              />
            </div>

            {/* Discord */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-black">Discord</label>
                <VisibilityToggle
                  section="contact_discord"
                  value={visibility.contact_discord}
                  onChange={(v) => setVis('contact_discord', v)}
                  label="Discord"
                />
              </div>
              <Input
                placeholder="username#0000"
                className="border-[#E0E0E0] rounded-sm focus-visible:border-black focus-visible:ring-0"
                {...register('contact_discord')}
              />
            </div>

            {/* Instagram */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-black">Instagram</label>
                <VisibilityToggle
                  section="contact_instagram"
                  value={visibility.contact_instagram}
                  onChange={(v) => setVis('contact_instagram', v)}
                  label="Instagram"
                />
              </div>
              <Input
                placeholder="@username"
                className="border-[#E0E0E0] rounded-sm focus-visible:border-black focus-visible:ring-0"
                {...register('contact_instagram')}
              />
            </div>

            {/* Facebook */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-black">Facebook</label>
                <VisibilityToggle
                  section="contact_facebook"
                  value={visibility.contact_facebook}
                  onChange={(v) => setVis('contact_facebook', v)}
                  label="Facebook"
                />
              </div>
              <Input
                placeholder="facebook.com/username or @username"
                className="border-[#E0E0E0] rounded-sm focus-visible:border-black focus-visible:ring-0"
                {...register('contact_facebook')}
              />
            </div>

            {/* LinkedIn */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-black">LinkedIn</label>
                <VisibilityToggle
                  section="contact_linkedin"
                  value={visibility.contact_linkedin}
                  onChange={(v) => setVis('contact_linkedin', v)}
                  label="LinkedIn"
                />
              </div>
              <Input
                type="url"
                placeholder="https://linkedin.com/in/yourhandle"
                className="border-[#E0E0E0] rounded-sm focus-visible:border-black focus-visible:ring-0"
                {...register('contact_linkedin')}
              />
              {errors.contact_linkedin && (
                <p className="text-xs text-red-600">{errors.contact_linkedin.message}</p>
              )}
            </div>
          </div>
        )

      // ─── Step 7: Additional Information ─────────────────
      case 7:
        return (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-black">Additional Information</h2>
                <p className="text-sm text-[#888888] mt-0.5">
                  Add any extra details you&apos;d like to share — e.g. "Current project", "Favourite book", etc.
                </p>
              </div>
              <VisibilityToggle
                section="additional_info"
                value={visibility.additional_info}
                onChange={(v) => setVis('additional_info', v)}
                label="Additional info"
              />
            </div>

            <div className="space-y-3">
              {additionalInfo.map((item, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <Input
                      value={item.label}
                      onChange={(e) => {
                        const updated = [...additionalInfo]
                        updated[index] = { ...updated[index], label: e.target.value }
                        setAdditionalInfo(updated)
                      }}
                      placeholder="Label (e.g. Current project)"
                      className="border-[#E0E0E0] rounded-sm focus-visible:border-black focus-visible:ring-0 text-sm"
                      maxLength={100}
                    />
                    <Input
                      value={item.value}
                      onChange={(e) => {
                        const updated = [...additionalInfo]
                        updated[index] = { ...updated[index], value: e.target.value }
                        setAdditionalInfo(updated)
                      }}
                      placeholder="Value"
                      className="border-[#E0E0E0] rounded-sm focus-visible:border-black focus-visible:ring-0 text-sm"
                      maxLength={2000}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdditionalInfo(additionalInfo.filter((_, i) => i !== index))}
                    className="mt-1 p-1.5 text-[#888888] hover:text-black transition-colors rounded-sm hover:bg-[#F5F5F5]"
                    aria-label="Remove row"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {additionalInfo.length < 10 && (
              <button
                type="button"
                onClick={() => setAdditionalInfo([...additionalInfo, { label: '', value: '' }])}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#888888] hover:text-black border border-dashed border-[#CCCCCC] hover:border-black rounded-sm px-3 py-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add field
              </button>
            )}

            {additionalInfo.length === 0 && (
              <p className="text-xs text-[#888888]">
                No additional fields added. Click "Add field" to add one, or skip this step.
              </p>
            )}
          </div>
        )

      // ─── Step 8: Privacy Agreement ───────────────────────
      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-black">Privacy Agreement</h2>
              <p className="text-sm text-[#888888] mt-0.5">
                Please review and accept our privacy policy to complete your profile.
              </p>
            </div>

            {/* Privacy policy text */}
            <div className="border border-[#E0E0E0] rounded-sm p-4 max-h-64 overflow-y-auto bg-[#FAFAFA] space-y-3 text-sm text-[#444444] leading-relaxed">
              <p className="font-semibold text-black">NS Peoplebook — Privacy Policy</p>
              <p>
                NS Peoplebook is a members-only directory for Network School participants. By creating a profile,
                you agree to the following terms:
              </p>
              <p className="font-medium text-black">Data you share</p>
              <p>
                You control what information is shown on your public profile using the visibility toggles
                throughout the onboarding wizard. Fields you mark as "Private" will only be stored and
                never displayed to other members.
              </p>
              <p className="font-medium text-black">Who can see your profile</p>
              <p>
                Your profile is visible only to other verified Network School members who have logged in
                to NS Peoplebook. Your information is never shared with third parties or accessible to
                the general public.
              </p>
              <p className="font-medium text-black">Data retention</p>
              <p>
                You may delete your profile and all associated data at any time from your profile settings
                page. Upon deletion, all personal data will be permanently removed from our systems within
                30 days.
              </p>
              <p className="font-medium text-black">Cookies &amp; analytics</p>
              <p>
                NS Peoplebook uses minimal, privacy-respecting analytics. No personal data is shared with
                advertising networks.
              </p>
              <p className="font-medium text-black">Contact</p>
              <p>
                If you have any questions about this privacy policy or your data, please contact the
                Network School admin team.
              </p>
              <p className="text-xs text-[#888888]">Last updated: February 2026</p>
            </div>

            {/* Agreement checkboxes */}
            <div className="space-y-3">
              <Controller
                name="agreed_terms"
                control={control}
                render={({ field }) => (
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <Checkbox
                      checked={field.value === true}
                      onCheckedChange={(checked) => field.onChange(checked ? true : undefined)}
                      className="mt-0.5 data-[state=checked]:bg-black data-[state=checked]:border-black"
                    />
                    <span className="text-sm text-black leading-snug group-hover:text-black/80">
                      I have read and agree to the NS Peoplebook Privacy Policy, and I understand
                      how my data will be used. <span className="text-red-500">*</span>
                    </span>
                  </label>
                )}
              />
              {errors.agreed_terms && (
                <p className="text-xs text-red-600 ml-7">{errors.agreed_terms.message}</p>
              )}

              <label className="flex items-start gap-3 cursor-pointer group">
                <Checkbox
                  className="mt-0.5 data-[state=checked]:bg-black data-[state=checked]:border-black"
                  onCheckedChange={() => {}}
                />
                <span className="text-sm text-black leading-snug group-hover:text-black/80">
                  I understand that this directory is for Network School members only, and I will
                  treat others&apos; information with discretion and respect.
                </span>
              </label>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-sm">
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  // ─── Page Layout ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-black tracking-tight">
            Create your profile
          </h1>
          <p className="text-sm text-[#888888] mt-1">
            Welcome to NS Peoplebook. Let&apos;s get your profile set up.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#888888] uppercase tracking-wide">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
            <span className="text-xs font-medium text-black">
              {STEP_TITLES[currentStep - 1]}
            </span>
          </div>
          <Progress
            value={progressValue}
            className="h-1.5 bg-[#F0F0F0] rounded-full [&>div]:bg-black [&>div]:rounded-full"
          />
          {/* Step dots */}
          <div className="flex items-center justify-between mt-1">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-colors',
                  i + 1 < currentStep
                    ? 'bg-black'
                    : i + 1 === currentStep
                    ? 'bg-black'
                    : 'bg-[#E0E0E0]'
                )}
              />
            ))}
          </div>
        </div>

        {/* Step card */}
        <div className="border border-[#E0E0E0] rounded-sm p-6 bg-white">
          <form
            onSubmit={
              currentStep === TOTAL_STEPS
                ? handleSubmit(onSubmit)
                : (e) => { e.preventDefault(); goNext() }
            }
          >
            {renderStep()}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[#F0F0F0]">
              <button
                type="button"
                onClick={goBack}
                disabled={currentStep === 1}
                className={cn(
                  'inline-flex items-center gap-1.5 text-sm font-medium transition-colors',
                  currentStep === 1
                    ? 'text-[#CCCCCC] cursor-not-allowed'
                    : 'text-[#888888] hover:text-black'
                )}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              {currentStep < TOTAL_STEPS ? (
                <Button
                  type="submit"
                  className="bg-black text-white hover:bg-black/80 rounded-sm text-sm px-6"
                >
                  Save &amp; Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-black text-white hover:bg-black/80 rounded-sm text-sm px-6"
                >
                  {isSubmitting ? 'Creating profile...' : 'Complete profile'}
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Skip hint */}
        {currentStep < TOTAL_STEPS && (
          <p className="text-center text-xs text-[#888888] mt-4">
            You can update all your information later from your profile settings.
          </p>
        )}
      </div>
    </div>
  )
}
