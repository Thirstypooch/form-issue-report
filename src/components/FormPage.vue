<template>
  <div class="form-page min-h-screen bg-gradient-to-br from-black via-gray-900 to-black px-5 py-11">
    <div class="container mx-auto">
      <div class="flex flex-col items-center gap-11">
        <!-- Logo with back button -->
        <div class="flex items-center justify-center w-full relative">
          <router-link to="/" class="absolute left-0 text-white hover:text-blue-400 transition-colors duration-300">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </div>
          </router-link>
          <img class="max-w-52 logo-animation" src="/thirsty.png" alt="Thirsty Logo" />
        </div>

        <!-- Form component -->
        <MyForm />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MyForm from './MyForm.vue';
</script>

<style scoped>
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
