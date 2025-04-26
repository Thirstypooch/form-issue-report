<template>
  <div
    class="flex w-full flex-col items-center gap-5 rounded-[3.5px] bg-black bg-opacity-25 p-5 text-sm text-white md:w-10/12 lg:w-8/12"
  >
    <h2 class="text-2xl">Report an issue</h2>
    <form class="w-full space-y-8" @submit.prevent="handleSubmit">
      <div class="flex flex-col">
        <label class="mb-2" for="deviceType">Device type</label>
        <select
          id="deviceType"
          class="w-full rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
          v-model="form.deviceType"
          required
        >
          <option value="">Select an option</option>
          <option value="PC">Windows</option>
          <option value="Mac">macOS</option>
          <option value="iOS">iOS</option>
          <option value="Android">Android</option>
        </select>
      </div>
      <div class="flex flex-col">
        <label class="mb-2" for="deviceModel">Device model</label>
        <input
          class="rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
          type="text"
          id="deviceModel"
          v-model="form.deviceModel"
          required
        />
      </div>
      <div class="flex flex-col">
        <label class="mb-2" for="operatingSystem">Operating system</label>
        <select
          id="operatingSystem"
          class="w-full rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
          v-model="form.operatingSystem"
          @change="checkOtherOS"
          required
        >
          <option value="">Select an option</option>
          <option value="Windows 11">Windows 11</option>
          <option value="macOS Sequoia">macOS Sequoia</option>
          <option value="iOS 18">iOS 18</option>
          <option value="Android 13">Android 15</option>
          <option value="Other">Other</option>
        </select>
        <input
          class="mt-2 rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
          v-if="isOtherOS"
          type="text"
          v-model="form.otherOperatingSystem"
          placeholder="Ingrese el sistema operativo"
          required
        />
      </div>
      <div class="flex flex-col">
        <label class="mb-2" for="appVersion">Application version</label>
        <input
          class="rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
          type="text"
          id="appVersion"
          v-model="form.appVersion"
          required
        />
      </div>
      <div class="flex flex-col">
        <label class="mb-2" for="incidentDate">Date and time of the incident</label>
        <input
          class="rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
          type="datetime-local"
          id="incidentDate"
          v-model="form.incidentDate"
          required
        />
      </div>
      <div class="flex flex-col">
        <label class="mb-2" for="problemDescription">Problem description</label>
        <textarea
          class="min-h-20 rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
          id="problemDescription"
          v-model="form.problemDescription"
          required
        ></textarea>
      </div>
      <div class="flex flex-col">
        <label class="mb-2" for="reproduccionSteps">Steps to reproduce the problem</label>
        <textarea
          class="min-h-20 rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
          id="reproduccionSteps"
          v-model="form.reproduccionSteps"
          required
        ></textarea>
      </div>
      <div class="flex flex-col">
        <label class="mb-2" for="expectedBehavior">Expected behavior</label>
        <textarea
          class="min-h-20 rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
          id="expectedBehavior"
          v-model="form.expectedBehavior"
          required
        ></textarea>
      </div>
      <div class="flex flex-col">
        <label class="mb-2" for="actualBehavior">Actual behavior</label>
        <textarea
          class="min-h-20 rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
          id="actualBehavior"
          v-model="form.actualBehavior"
          required
        ></textarea>
      </div>
      <div class="flex flex-col">
        <label class="mb-2" for="severityLevel">Severity level</label>
        <select
          id="severityLevel"
          class="w-full rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
          v-model="form.severityLevel"
          required
        >
          <option value="">Select an option</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <div class="flex flex-col">
        <label class="mb-2" for="hasPreviouslyOccurred">Has this problem occurred before?</label>
        <select
          id="hasPreviouslyOccurred"
          class="w-full rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
          v-model="form.hasPreviouslyOccurred"
          required
        >
          <option value="">Select an option</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <div class="flex flex-col">
        <label class="mb-2" for="additionalComments">Additional comments or additional information</label>
        <textarea
          class="min-h-20 rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
          id="additionalComments"
          v-model="form.additionalComments"
        ></textarea>
      </div>
      <div class="flex flex-col">
        <label class="mb-2" for="screenshots">Screenshots or videos</label>
        <input
          class="rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
          type="file"
          id="screenshots"
          multiple
          @change="handleFileUpload"
        />
      </div>
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
import { defineComponent, reactive, ref } from 'vue'

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
  setup() {
    const form = reactive<FormData>({
      deviceType: '',
      deviceModel: '',
      operatingSystem: '',
      appVersion: '',
      incidentDate: '',
      problemDescription: '',
      reproduccionSteps: '',
      expectedBehavior: '',
      actualBehavior: '',
      severityLevel: '',
      hasPreviouslyOccurred: '',
      additionalComments: '',
      screenshots: []
    })

    const isOtherOS = ref(false)

    const handleFileUpload = (event: Event) => {
      const files = (event.target as HTMLInputElement).files
      if (files) {
        form.screenshots = Array.from(files)
      }
    }

    const handleSubmit = () => {
      console.log('Form submitted:', form)
      // Add your form submission logic here
    }

    const checkOtherOS = () => {
      isOtherOS.value = form.operatingSystem === 'Other'
      if (!isOtherOS.value) {
        form.otherOperatingSystem = ''
      }
    }

    return {
      form,
      isOtherOS,
      handleFileUpload,
      handleSubmit,
      checkOtherOS
    }
  }
})
</script>
