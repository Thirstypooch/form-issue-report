<template>
  <div id="app" class="flex flex-col items-center gap-11 bg-partner-color px-5 py-11">
    <div>
      <img class="max-w-52 logo-animation" src="./public/thirsty.png" alt="Thirsty Logo" />
    </div>
    <MyForm />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MyForm from './components/MyForm.vue'

export default defineComponent({
  name: 'App',
  components: {
    MyForm
  }
})
</script>

<style>
.logo-animation {
  animation: pulse 2s infinite ease-in-out;
  transform-origin: center;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
</style>
