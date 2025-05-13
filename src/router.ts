import { createRouter, createWebHistory } from 'vue-router'
import LandingPage from './components/LandingPage.vue'
import FormPage from './components/FormPage.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: LandingPage
  },
  {
    path: '/form',
    name: 'Form',
    component: FormPage
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router