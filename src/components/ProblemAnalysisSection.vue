<template>
  <div class="space-y-8">
    <div class="flex flex-col">
      <label class="mb-2" for="reproduccionSteps">Steps to reproduce the problem</label>
      <textarea
        class="min-h-20 rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
        id="reproduccionSteps"
        v-model="problemAnalysis.reproduccionSteps"
        required
      ></textarea>
    </div>
    <div class="flex flex-col">
      <label class="mb-2" for="expectedBehavior">Expected behavior</label>
      <textarea
        class="min-h-20 rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
        id="expectedBehavior"
        v-model="problemAnalysis.expectedBehavior"
        required
      ></textarea>
    </div>
    <div class="flex flex-col">
      <label class="mb-2" for="actualBehavior">Actual behavior</label>
      <textarea
        class="min-h-20 rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
        id="actualBehavior"
        v-model="problemAnalysis.actualBehavior"
        required
      ></textarea>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, watch, PropType} from 'vue'

export default defineComponent({
  name: 'ProblemAnalysisSection',
  props: {
    modelValue: {
      type: Object as PropType<{
        reproduccionSteps: string
        expectedBehavior: string
        actualBehavior: string
      }>,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const problemAnalysis = reactive({
      reproduccionSteps: props.modelValue.reproduccionSteps || '',
      expectedBehavior: props.modelValue.expectedBehavior || '',
      actualBehavior: props.modelValue.actualBehavior || ''
    })


    watch(problemAnalysis, (newValue) => {
      emit('update:modelValue', newValue)
    }, { deep: true })

    watch(() => props.modelValue, (newValue) => {
      problemAnalysis.reproduccionSteps = newValue.reproduccionSteps || ''
      problemAnalysis.expectedBehavior = newValue.expectedBehavior || ''
      problemAnalysis.actualBehavior = newValue.actualBehavior || ''
    }, { deep: true })

    return {
      problemAnalysis
    }
  }
})
</script>