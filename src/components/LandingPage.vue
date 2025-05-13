<template>
  <div class="landing-page min-h-screen bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden relative">
    <!-- Animated background elements -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="particles-container">
        <!-- Animated particles will be created with CSS -->
        <div v-for="n in 20" :key="n" class="particle"></div>
      </div>
      <div class="grid-lines"></div>
    </div>

    <div class="container mx-auto px-4 py-16 relative z-10">
      <!-- Hero Section -->
      <div class="hero-section flex flex-col items-center justify-center text-center py-16 space-y-8">
        <div class="logo-container mb-8">
          <img class="max-w-52 logo-animation" src="/thirsty.png" alt="Thirsty Logo" />
        </div>

        <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight fade-in-up">
          Shape the Future: <span class="text-blue-400">Report, Resolve, Evolve.</span>
        </h1>

        <p class="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto fade-in-up animation-delay-200">
          Step into our advanced issue reporting portal. Your insights are vital to our innovation. 
          Let's build a flawless experience, together.
        </p>

        <router-link to="/form" class="cta-button mt-8 fade-in-up animation-delay-400">
          Initiate Report Protocol
        </router-link>
      </div>

      <!-- Why Your Report Matters Section -->
      <div class="why-section py-16 fade-in-up animation-delay-600">
        <h2 class="text-3xl font-bold text-center text-white mb-12">Why Your Report Matters</h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="feature-card">
            <div class="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-blue-400 mb-2">Drive Innovation</h3>
            <p class="text-gray-300">Your reports fuel our continuous improvement and help us push the boundaries of what's possible.</p>
          </div>

          <div class="feature-card">
            <div class="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-blue-400 mb-2">Enhance Stability</h3>
            <p class="text-gray-300">Each report contributes to a more stable, reliable system that everyone can depend on.</p>
          </div>

          <div class="feature-card">
            <div class="icon-container">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-blue-400 mb-2">Co-create Excellence</h3>
            <p class="text-gray-300">Join us in crafting an exceptional product that exceeds expectations and sets new standards.</p>
          </div>
        </div>
      </div>

      <!-- Streamlined Reporting Process Section -->
      <div class="process-section py-16 fade-in-up animation-delay-800">
        <h2 class="text-3xl font-bold text-center text-white mb-12">Streamlined Reporting Process</h2>

        <div class="flex flex-col md:flex-row justify-center items-center md:space-x-12 space-y-8 md:space-y-0">
          <div class="process-step">
            <div class="step-number">1</div>
            <h3 class="text-xl font-semibold text-blue-400 mb-2">Detail the Issue</h3>
            <p class="text-gray-300">Provide comprehensive information about the problem you've encountered.</p>
          </div>

          <div class="process-connector hidden md:block">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>

          <div class="process-step">
            <div class="step-number">2</div>
            <h3 class="text-xl font-semibold text-blue-400 mb-2">Provide Evidence</h3>
            <p class="text-gray-300">Upload screenshots or additional files to help us understand the issue better.</p>
          </div>

          <div class="process-connector hidden md:block">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>

          <div class="process-step">
            <div class="step-number">3</div>
            <h3 class="text-xl font-semibold text-blue-400 mb-2">Submit & Track</h3>
            <p class="text-gray-300">Send your report and track its progress as our team works on a solution.</p>
          </div>
        </div>
      </div>

      <!-- Final CTA -->
      <div class="final-cta text-center py-16 fade-in-up animation-delay-1000">
        <h2 class="text-3xl font-bold text-white mb-6">Ready to Contribute?</h2>
        <p class="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
          Your feedback is the cornerstone of our improvement process. Help us create a better experience for everyone.
        </p>
        <router-link to="/form" class="cta-button">
          Report an Anomaly
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional script logic needed for this component
</script>

<style scoped>
/* Animated background elements */
.grid-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: 50px 50px;
  background-image: 
    linear-gradient(to right, rgba(30, 64, 175, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(30, 64, 175, 0.05) 1px, transparent 1px);
  transform: perspective(1000px) rotateX(60deg);
  transform-origin: center top;
  animation: grid-animation 20s linear infinite;
}

@keyframes grid-animation {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 50px 50px;
  }
}

.particles-container {
  position: absolute;
  width: 100%;
  height: 100%;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background-color: rgba(59, 130, 246, 0.6);
  border-radius: 50%;
  animation: float 15s infinite ease-in-out;
}

.particle:nth-child(odd) {
  background-color: rgba(96, 165, 250, 0.4);
}

.particle:nth-child(3n) {
  background-color: rgba(147, 197, 253, 0.3);
}

.particle:nth-child(1) { top: 10%; left: 20%; animation-delay: 0s; }
.particle:nth-child(2) { top: 20%; left: 80%; animation-delay: 1s; }
.particle:nth-child(3) { top: 30%; left: 45%; animation-delay: 2s; }
.particle:nth-child(4) { top: 40%; left: 15%; animation-delay: 3s; }
.particle:nth-child(5) { top: 50%; left: 75%; animation-delay: 4s; }
.particle:nth-child(6) { top: 60%; left: 35%; animation-delay: 5s; }
.particle:nth-child(7) { top: 70%; left: 85%; animation-delay: 6s; }
.particle:nth-child(8) { top: 80%; left: 25%; animation-delay: 7s; }
.particle:nth-child(9) { top: 90%; left: 65%; animation-delay: 8s; }
.particle:nth-child(10) { top: 15%; left: 55%; animation-delay: 9s; }
.particle:nth-child(11) { top: 25%; left: 5%; animation-delay: 10s; }
.particle:nth-child(12) { top: 35%; left: 95%; animation-delay: 11s; }
.particle:nth-child(13) { top: 45%; left: 30%; animation-delay: 12s; }
.particle:nth-child(14) { top: 55%; left: 70%; animation-delay: 13s; }
.particle:nth-child(15) { top: 65%; left: 10%; animation-delay: 14s; }
.particle:nth-child(16) { top: 75%; left: 50%; animation-delay: 15s; }
.particle:nth-child(17) { top: 85%; left: 90%; animation-delay: 16s; }
.particle:nth-child(18) { top: 95%; left: 40%; animation-delay: 17s; }
.particle:nth-child(19) { top: 5%; left: 60%; animation-delay: 18s; }
.particle:nth-child(20) { top: 15%; left: 30%; animation-delay: 19s; }

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-20px) translateX(10px);
  }
  50% {
    transform: translateY(0) translateX(20px);
  }
  75% {
    transform: translateY(20px) translateX(10px);
  }
}

/* Logo animation (reused from App.vue) */
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

/* Fade-in animations */
.fade-in-up {
  animation: fadeInUp 1s ease-out forwards;
  opacity: 0;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

.animation-delay-600 {
  animation-delay: 0.6s;
}

.animation-delay-800 {
  animation-delay: 0.8s;
}

.animation-delay-1000 {
  animation-delay: 1s;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Feature cards */
.feature-card {
  @apply bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-blue-900 transition-all duration-300;
  backdrop-filter: blur(10px);
}

.feature-card:hover {
  @apply bg-opacity-70 border-blue-600 transform scale-105;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.icon-container {
  @apply text-blue-400 mb-4 flex items-center justify-center w-16 h-16 mx-auto rounded-full bg-blue-900 bg-opacity-30;
}

/* Process steps */
.process-step {
  @apply bg-gray-800 bg-opacity-50 p-6 rounded-lg border border-blue-900 flex flex-col items-center text-center max-w-xs transition-all duration-300;
  backdrop-filter: blur(10px);
}

.process-step:hover {
  @apply bg-opacity-70 border-blue-600 transform scale-105;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

.step-number {
  @apply w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold mb-4;
}

.process-connector {
  @apply text-blue-400;
}

/* CTA Button */
.cta-button {
  @apply inline-block px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-lg transition-all duration-300 hover:bg-blue-700 transform hover:scale-105 hover:shadow-lg;
  background: linear-gradient(135deg, #3b82f6, #1e40af);
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.5);
}

.cta-button:hover {
  background: linear-gradient(135deg, #2563eb, #1e3a8a);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.7);
}
</style>
