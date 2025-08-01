<template>
  <div
    class="flex w-full flex-col items-center gap-5 rounded-[3.5px] bg-black bg-opacity-25 p-5 text-sm text-white md:w-10/12 lg:w-8/12"
  >
    <h2 class="text-2xl">Report an issue</h2>
    <form class="w-full space-y-8" @submit.prevent="handleSubmit">
      <section>
        <h3 class="mb-4 text-xl">Device Information</h3>
        <DeviceInfoSection
          :modelValue="deviceInfo"
          @update:modelValue="(newData) => Object.assign(deviceInfo, newData)"
        />
      </section>

      <section>
        <h3 class="mb-4 text-xl">Incident Details</h3>
        <IncidentDetailsSection
          :modelValue="incidentDetails"
          @update:modelValue="(newData) => Object.assign(incidentDetails, newData)"
        />
      </section>

      <section>
        <h3 class="mb-4 text-xl">Problem Analysis</h3>
        <ProblemAnalysisSection
          :modelValue="problemAnalysis"
          @update:modelValue="(newData) => Object.assign(problemAnalysis, newData)"
        />
      </section>

      <section>
        <h3 class="mb-4 text-xl">Additional Information</h3>
        <AdditionalInfoSection
          :modelValue="additionalInfo"
          @update:modelValue="(newData) => Object.assign(additionalInfo, newData)"
        />
      </section>

      <div class="flex w-full justify-center">
        <button
          type="submit"
          class="duration-400 min-w-32 rounded-[3.5px] bg-[#6c757d] px-[10.5px] py-[5.25px] transition-colors hover:bg-[#5a6268]"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Sending...' : 'Send' }}
        </button>
      </div>
    </form>

    <div v-if="reportId" class="mt-4 p-4 bg-gray-700 rounded-md text-white">
      <p>Report Submitted! Your tracking ID is: <strong>{{ reportId }}</strong></p>
      <p>Status: {{ reportStatus }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, ref } from 'vue' // Import ref for `isSubmitting`, `reportId`, `reportStatus`
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
  screenshots: File[] // Still expects File[] from sub-component
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
      userEmail: '',
      severityLevel: '',
      hasPreviouslyOccurred: '',
      additionalComments: '',
      screenshots: [] as File[]
    })

    // Reactive states for submission status and report ID
    const isSubmitting = ref(false)
    const reportId = ref<string | null>(null)
    const reportStatus = ref('Pending...') // Placeholder for future real-time status

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
      isSubmitting.value = true
      reportId.value = null // Reset on new submission
      reportStatus.value = 'Initiating upload...' // Reset status

      try {
        const payload = { ...completeForm.value }; // Copy form data to manipulate
        const uploadedFileUrls: string[] = [];

        // --- Step 1: Validate files and get pre-signed URLs for direct S3 upload ---
        if (payload.screenshots && payload.screenshots.length > 0) {
          for (const file of payload.screenshots) {
            const error = validateFile(file);
            if (error) {
              alert(error);
              isSubmitting.value = false;
              return;
            }

            // Request a pre-signed URL from your backend for each file
            // This new endpoint needs to be created on the backend
            reportStatus.value = `Requesting upload URL for ${file.name}...`
            const presignedUrlResponse = await fetch('/api/presigned-url', { // NEW BACKEND ENDPOINT
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                fileName: file.name,
                fileType: file.type,
                reportId: 'temp-placeholder' // We don't have the final reportId yet, backend might generate one or add a UUID suffix
              })
            });

            if (!presignedUrlResponse.ok) {
              const errorResult = await presignedUrlResponse.json();
              throw new Error(`Failed to get pre-signed URL: ${errorResult.error || 'Unknown error'}`);
            }
            const { url: presignedUrl, s3ObjectUrl } = await presignedUrlResponse.json();

            // --- Step 2: Upload file directly to S3 using the pre-signed URL ---
            reportStatus.value = `Uploading ${file.name} to S3...`
            const uploadResponse = await fetch(presignedUrl, {
              method: 'PUT', // Often PUT for pre-signed URLs
              headers: {
                'Content-Type': file.type,
                // 'Content-Encoding': 'gzip' // Only if you gzipped it client-side
              },
              body: file // Send the raw File object directly
            });

            if (!uploadResponse.ok) {
              throw new Error(`Failed to upload file ${file.name} to S3.`);
            }
            uploadedFileUrls.push(s3ObjectUrl); // Store the final public S3 URL
            console.log(`Uploaded ${file.name} to S3: ${s3ObjectUrl}`);
          }
        }

        // --- Step 3: Prepare and send the main form data (without raw files) to the backend ---
        reportStatus.value = 'Submitting report details...'
        const formData = new FormData()
        const keyMapping = {
          userEmail: 'user_email',
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
          // screenshots: 'screenshots' // No longer needed here as raw files are not sent
        }

        const snakeCaseData = {} as Record<string, string>
        Object.entries(payload).forEach(([key, value]) => {
          // Exclude the 'screenshots' File array, we're sending URLs instead
          if (key !== 'screenshots') {
            const backendKey = keyMapping[key] || key
            snakeCaseData[backendKey] = value ? String(value) : ''
          }
        })

        if (payload.incidentDate) {
          const dateObj = new Date(payload.incidentDate)
          snakeCaseData['incident_date'] = formatISO(dateObj, { representation: 'date' })
        }

        // Append all snake_case data to FormData
        Object.entries(snakeCaseData).forEach(([key, value]) => {
          formData.append(key, value)
        })

        // Add the S3 file URLs to the formData instead of the raw files
        uploadedFileUrls.forEach((url) => {
          formData.append('file_urls[]', url); // Use 'file_urls[]' to send as an array
        });
        // Note: The backend's `reportSchema` will need to be updated to expect `file_urls`
        // instead of `screenshots` for the main form submission (if you want to strictly validate).
        // For now, the backend `reports.ts` will receive `file_urls[]` from here,
        // which matches the Pub/Sub payload for `file_urls`.
        const submissionPayload = {
          ...snakeCaseData,
          file_urls: uploadedFileUrls // Add the S3 file URLs
        }
        console.log('Submitting main form data to backend with S3 URLs:', submissionPayload)
        formData.forEach((value, key) => {
          console.log('FormData:', key, value)
        })

        // Changed target to /api/reports as backend `reports.ts` is now simplified
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(submissionPayload)
        })

        const result = await response.json()
        if (!response.ok) {
          console.error('Server error:', result)
          let errorMessage = 'Failed to submit report: '
          if (result.error) { // Simplified error check for both array and string errors
            if (Array.isArray(result.error)) {
              errorMessage += result.error.map((err: any) => `${err.path.join('.')}: ${err.message}`).join('\n');
            } else if (typeof result.error === 'string') {
              errorMessage += result.error;
            } else {
              errorMessage += JSON.stringify(result.error || 'Unknown error');
            }
          } else {
            errorMessage += 'Unknown error from server.';
          }
          throw new Error(errorMessage);
        }

        console.log('Success:', result)
        alert('Report submitted successfully!')
        reportId.value = result.reportId; // Capture the reportId from the backend response
        reportStatus.value = result.message; // Display the initial status message

      } catch (error: any) {
        console.error('Error:', error)
        alert(`Error: ${error.message}`)
        reportStatus.value = `Submission failed: ${error.message}`;
      } finally {
        isSubmitting.value = false
      }
    }
    return {
      deviceInfo,
      incidentDetails,
      problemAnalysis,
      additionalInfo,
      handleSubmit,
      isSubmitting, // Expose for button disabled state
      reportId,      // Expose for displaying to user
      reportStatus   // Expose for displaying status
    }
  }
})
</script>