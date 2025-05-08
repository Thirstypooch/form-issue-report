<template>
  <div class="space-y-8">
    <div class="flex flex-col">
      <label class="mb-2" for="incidentDate">Date and time of the incident</label>
      <input
        class="rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
        type="text"
        id="incidentDate"
        v-model="incidentDetails.incidentDate"
        placeholder="YYYY-MM-DD"
        @blur="validateAndFormatDate"
        required
      />
      <small class="text-gray-500">Format: YYYY-MM-DD (e.g., 2025-08-05)</small>
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
import { defineComponent, reactive, watch, onMounted } from 'vue'

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
    // Initialize with today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    const incidentDetails = reactive({
      incidentDate: props.modelValue.incidentDate || today,
      problemDescription: props.modelValue.problemDescription || ''
    });

    // Validate and format date
    const validateAndFormatDate = () => {
      const dateValue = incidentDetails.incidentDate;
      
      // Check if it's already in YYYY-MM-DD format
      const isoFormat = /^\d{4}-\d{2}-\d{2}$/;
      if (isoFormat.test(dateValue)) {
        return; // Already in correct format
      }
      
      // Check if it's in MM/DD/YYYY format
      const mmddyyyyFormat = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
      const match = dateValue.match(mmddyyyyFormat);
      
      if (match) {
        const month = match[1].padStart(2, '0');
        const day = match[2].padStart(2, '0');
        const year = match[3];
        incidentDetails.incidentDate = `${year}-${month}-${day}`;
        return;
      }
      
      // Try to parse as a date
      try {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          incidentDetails.incidentDate = date.toISOString().split('T')[0];
          return;
        }
      } catch (e) {
        // Invalid date, fall back to today
        incidentDetails.incidentDate = today;
      }
    };

    // Ensure date is in YYYY-MM-DD format on component mount
    onMounted(() => {
      validateAndFormatDate();
    });

    // Watch for changes and emit updates
    watch(incidentDetails, (newValue) => {
      emit('update:modelValue', newValue);
    }, { deep: true });

    watch(() => props.modelValue, (newValue) => {
      incidentDetails.incidentDate = newValue.incidentDate || today;
      incidentDetails.problemDescription = newValue.problemDescription || '';
      validateAndFormatDate();
    }, { deep: true });

    return {
      incidentDetails,
      validateAndFormatDate
    }
  }
})
</script>