<template>
  <div
    class="flex w-full flex-col items-center gap-5 rounded-[3.5px] bg-black bg-opacity-25 p-5 text-sm text-white md:w-10/12 lg:w-8/12">
    <h2 class="text-2xl">Report an issue</h2>
    <form class="w-full space-y-8" @submit.prevent="handleSubmit">
      <section>
        <h3 class="mb-4 text-xl">Device Information</h3>
        <DeviceInfoSection v-model="deviceInfo" />
      </section>

      <section>
        <h3 class="mb-4 text-xl">Incident Details</h3>
        <IncidentDetailsSection v-model="incidentDetails" />
      </section>

      <section>
        <h3 class="mb-4 text-xl">Problem Analysis</h3>
        <ProblemAnalysisSection v-model="problemAnalysis" />
      </section>

      <section>
        <h3 class="mb-4 text-xl">Additional Information</h3>
        <AdditionalInfoSection v-model="additionalInfo" />
      </section>

      <div class="flex w-full justify-center">
        <button type="submit"
          class="duration-400 min-w-32 rounded-[3.5px] bg-[#6c757d] px-[10.5px] py-[5.25px] transition-colors hover:bg-[#5a6268]">
          Send
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from 'vue'
import DeviceInfoSection from './DeviceInfoSection.vue'
import IncidentDetailsSection from './IncidentDetailsSection.vue'
import ProblemAnalysisSection from './ProblemAnalysisSection.vue'
import AdditionalInfoSection from './AdditionalInfoSection.vue'

interface FormData {
  deviceType: string
  deviceModel: string
  operatingSystem: string
  otherOperatingSystem?: string
  appVersion: string
  incidentDate: string
  problemDescription: string
  reproduccionSteps: string
  expectedBehavior: string
  actualBehavior: string
  severityLevel: string
  hasPreviouslyOccurred: string
  additionalComments: string
  screenshots: File[]
}

export default defineComponent({
  name: 'MyForm',
  components: {
    DeviceInfoSection,
    IncidentDetailsSection,
    ProblemAnalysisSection,
    AdditionalInfoSection
  },
  setup() {
    const deviceInfo = reactive({
      deviceType: '',
      deviceModel: '',
      operatingSystem: '',
      otherOperatingSystem: '',
      appVersion: ''
    })
    const incidentDetails = reactive({
      incidentDate: '',
      problemDescription: ''
    })
    const problemAnalysis = reactive({
      reproduccionSteps: '',
      expectedBehavior: '',
      actualBehavior: ''
    })
    const additionalInfo = reactive({
      severityLevel: '',
      hasPreviouslyOccurred: '',
      additionalComments: '',
      screenshots: [] as File[]
    })
    // Combine all form sections for submission
    const completeForm = computed<FormData>(() => {
      return {
        ...deviceInfo,
        ...incidentDetails,
        ...problemAnalysis,
        ...additionalInfo
      }
    })
    const validateFile = (file: File) => {
      const validTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/quicktime'
      ]
      if (!validTypes.includes(file.type)) {
        return 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, QuickTime) are allowed.'
      }
      if (file.type.startsWith('image/') && file.size > 10 * 1024 * 1024) {
        return 'Image size exceeds 10MB limit.'
      }
      if (file.type.startsWith('video/') && file.size > 50 * 1024 * 1024) {
        return 'Video size exceeds 50MB limit.'
      }
      return null
    }
    const handleSubmit = async () => {
      try {
        const formData = new FormData()
        Object.entries(completeForm.value).forEach(([key, value]) => {
          if (key !== 'screenshots') {
            formData.append(key, value as string)
          }
        })
        if (completeForm.value.screenshots.length > 0) {
          for (const file of completeForm.value.screenshots) {
            const error = validateFile(file)
            if (error) {
              alert(error)
              return
            }
            formData.append('screenshots', file)
          }
        }
        const response = await fetch('http://localhost:8000/reports', {
          method: 'POST',
          body: formData
        })
        if (!response.ok) {
          throw new Error('Failed to submit report')
        }
        const result = await response.json()
        console.log('Success:', result)
        // Reset form or show success message
      } catch (error) {
        console.error('Error:', error)
        // Show error message to user
      }
    }
    return {
      deviceInfo,
      incidentDetails,
      problemAnalysis,
      additionalInfo,
      handleSubmit
    }
  }
})
</script>
