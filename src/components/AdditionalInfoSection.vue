<template>
  <div class="space-y-8">
    <div class="flex flex-col">
      <label class="mb-2" for="severityLevel">Severity level</label>
      <select
        id="severityLevel"
        class="w-full rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
        v-model="additionalInfo.severityLevel"
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
        v-model="additionalInfo.hasPreviouslyOccurred"
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
        v-model="additionalInfo.additionalComments"
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
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch, PropType} from 'vue'

export default defineComponent({
  name: 'AdditionalInfoSection',
  props: {
    modelValue: {
      type: Object as PropType<{
        severityLevel: string
        hasPreviouslyOccurred: string
        additionalComments: string
        screenshots: File[]
      }>,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const additionalInfo = reactive({
      severityLevel: props.modelValue.severityLevel || '',
      hasPreviouslyOccurred: props.modelValue.hasPreviouslyOccurred || '',
      additionalComments: props.modelValue.additionalComments || '',
      screenshots: props.modelValue.screenshots || []
    })

    const handleFileUpload = (event: Event) => {
      const files = (event.target as HTMLInputElement).files
      if (files) {
        additionalInfo.screenshots = Array.from(files)
        emit('update:modelValue', additionalInfo)
      }
    }


    watch(additionalInfo, (newValue) => {
      emit('update:modelValue', newValue)
    }, { deep: true })


    watch(() => props.modelValue, (newValue) => {
      additionalInfo.severityLevel = newValue.severityLevel || ''
      additionalInfo.hasPreviouslyOccurred = newValue.hasPreviouslyOccurred || ''
      additionalInfo.additionalComments = newValue.additionalComments || ''
      additionalInfo.screenshots = newValue.screenshots || []
    }, { deep: true })

    return {
      additionalInfo,
      handleFileUpload
    }
  }
})
</script>