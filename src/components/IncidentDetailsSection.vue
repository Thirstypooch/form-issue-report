<template>
  <div class="space-y-8">
    <div class="flex flex-col">
      <label class="mb-2" for="incidentDate">Date and time of the incident</label>
      <input
        class="rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
        type="datetime-local"
        id="incidentDate"
        v-model="incidentDetails.incidentDate"
        required
      />
    </div>
    <div class="flex flex-col">
      <label class="mb-2" for="problemDescription">Problem description</label>
      <textarea
        class="min-h-20 rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
        id="problemDescription"
        v-model="incidentDetails.problemDescription"
        required
      ></textarea>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from 'vue'

export default defineComponent({
  name: 'IncidentDetailsSection',
  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const incidentDetails = reactive({
      incidentDate: props.modelValue.incidentDate || '',
      problemDescription: props.modelValue.problemDescription || ''
    })


    watch(incidentDetails, (newValue) => {
      emit('update:modelValue', newValue)
    }, { deep: true })


    watch(() => props.modelValue, (newValue) => {
      incidentDetails.incidentDate = newValue.incidentDate || ''
      incidentDetails.problemDescription = newValue.problemDescription || ''
    }, { deep: true })

    return {
      incidentDetails
    }
  }
})
</script>