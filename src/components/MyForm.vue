<template>
  <div
    class="flex w-full flex-col items-center gap-5 rounded-[3.5px] bg-black bg-opacity-25 p-5 text-sm text-white md:w-10/12 lg:w-8/12"
  >
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
        <button
          type="submit"
          class="duration-400 min-w-32 rounded-[3.5px] bg-[#6c757d] px-[10.5px] py-[5.25px] transition-colors hover:bg-[#5a6268]"
        >
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
import { formatISO } from 'date-fns'

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
    const today = new Date().toISOString().split('T')[0]
    const incidentDetails = reactive({
      incidentDate: today,
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
    // In the handleSubmit function
    const handleSubmit = async () => {
      try {
        const formData = new FormData()
        const keyMapping = {
          deviceType: 'device_type',
          deviceModel: 'device_model',
          operatingSystem: 'operating_system',
          otherOperatingSystem: 'other_operating_system',
          appVersion: 'app_version',
          incidentDate: 'incident_date',
          problemDescription: 'problem_description',
          reproduccionSteps: 'reproducion_steps',
          expectedBehavior: 'expected_behavior',
          actualBehavior: 'actual_behavior',
          severityLevel: 'severity_level',
          hasPreviouslyOccurred: 'has_previously_occurred',
          additionalComments: 'additional_comments',
          screenshots: 'screenshots'
        }
        console.log('Date being submitted:', completeForm.value.incidentDate)

        Object.entries(completeForm.value).forEach(([key, value]) => {
          if (key !== 'screenshots') {
            const backendKey = keyMapping[key] || key
            formData.append(backendKey, value as string)
          }
        })

        // Convert incidentDate to ISO string
        if (completeForm.value.incidentDate) {
          const dateObj = new Date(completeForm.value.incidentDate)
          formData.set('incident_date', formatISO(dateObj, { representation: 'date' }))
        }

        // Add this log right after setting incident_date
        console.log('Submitting incident_date:', formData.get('incident_date'))
        formData.forEach((value, key) => {
          console.log('FormData:', key, value)
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

        const result = await response.json()
        if (!response.ok) {
          console.error('Server error:', result)
          // Format error message for better display
          let errorMessage = 'Failed to submit report: '
          if (result.error && Array.isArray(result.error)) {
            errorMessage += result.error
              .map((err) => `${err.path.join('.')}: ${err.message}`)
              .join('\n')
          } else {
            errorMessage += JSON.stringify(result.error || 'Unknown error')
          }
          alert(errorMessage)
          return
        }

        console.log('Success:', result)
        alert('Report submitted successfully!')
      } catch (error) {
        console.error('Error:', error)
        alert(`Error: ${error.message}`)
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
