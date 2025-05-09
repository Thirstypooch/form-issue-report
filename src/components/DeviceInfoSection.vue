<template>
  <div class="space-y-8">
    <div class="flex flex-col">
      <label class="mb-2" for="deviceType">Device type</label>
      <select
        id="deviceType"
        class="w-full rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
        v-model="deviceInfo.deviceType"
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
        v-model="deviceInfo.deviceModel"
        required
      />
    </div>
    <div class="flex flex-col">
      <label class="mb-2" for="operatingSystem">Operating system</label>
      <select
        id="operatingSystem"
        class="w-full rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
        v-model="deviceInfo.operatingSystem"
        @change="checkOtherOS"
        required
      >
        <option value="">Select an option</option>
        <option value="Windows 11">Windows 11</option>
        <option value="macOS Sequoia">macOS Sequoia</option>
        <option value="iOS 18">iOS 18</option>
        <option value="Android 15">Android 15</option>
        <option value="Other">Other</option>
      </select>
      <input
        class="mt-2 rounded-[3.5px] px-[10.5px] py-[5.25px] text-gray-900"
        v-if="isOtherOS"
        type="text"
        v-model="deviceInfo.otherOperatingSystem"
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
        v-model="deviceInfo.appVersion"
        required
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch, PropType } from 'vue'

export default defineComponent({
  name: 'DeviceInfoSection',
  props: {
    modelValue: {
      type: Object as PropType<{
        deviceType: string
        deviceModel: string
        operatingSystem: string
        otherOperatingSystem: string
        appVersion: string
      }>,
      required: true
    }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const deviceInfo = reactive({
      deviceType: props.modelValue.deviceType || '',
      deviceModel: props.modelValue.deviceModel || '',
      operatingSystem: props.modelValue.operatingSystem || '',
      otherOperatingSystem: props.modelValue.otherOperatingSystem || '',
      appVersion: props.modelValue.appVersion || ''
    })

    const isOtherOS = ref(deviceInfo.operatingSystem === 'Other')

    const checkOtherOS = () => {
      isOtherOS.value = deviceInfo.operatingSystem === 'Other'
      if (!isOtherOS.value) {
        deviceInfo.otherOperatingSystem = ''
      }
    }

    const updateOperatingSystem = (deviceType: string) => {
      if (deviceType === 'PC') {
        deviceInfo.operatingSystem = 'Windows 11'
      } else if (deviceType === 'Mac') {
        deviceInfo.operatingSystem = 'macOS Sequoia'
      } else if (deviceType === 'iOS') {
        deviceInfo.operatingSystem = 'iOS 18'
      } else if (deviceType === 'Android') {
        deviceInfo.operatingSystem = 'Android 15'
      }
    }

    watch(() => deviceInfo.deviceType, (newDeviceType) => {
      if (newDeviceType) {
        updateOperatingSystem(newDeviceType)
      }
    })

    if (deviceInfo.deviceType) {
      updateOperatingSystem(deviceInfo.deviceType)
    }

    watch(deviceInfo, (newValue) => {
      emit('update:modelValue', newValue)
    }, { deep: true })

    watch(() => props.modelValue, (newValue) => {
      deviceInfo.deviceType = newValue.deviceType || ''
      deviceInfo.deviceModel = newValue.deviceModel || ''
      deviceInfo.operatingSystem = newValue.operatingSystem || ''
      deviceInfo.otherOperatingSystem = newValue.otherOperatingSystem || ''
      deviceInfo.appVersion = newValue.appVersion || ''
      isOtherOS.value = deviceInfo.operatingSystem === 'Other'
    }, { deep: true })

    return {
      deviceInfo,
      isOtherOS,
      checkOtherOS
    }
  }
})
</script>
