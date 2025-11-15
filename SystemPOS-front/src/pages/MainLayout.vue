<template>
  <div
    class="flex flex-center column bg-cover bg-center"
    style="background-image: url('../assets/fundoTCClogin.png')"
  >
    <div v-if="isLoading" class="spinner-overlay">
      <SpinnerLoading :isLoading="isLoading" message="Processando login..." />
    </div>
    <img
      src="../assets/logo.png"
      alt="Logo SystemPOS"
      class="q-mb-xs"
      style="width: 40%; height: auto"
    />
    <div
      style="
        width: 100%;
        max-width: 300px;
        display: flex;
        justify-content: center;
        border-radius: 6px;
        font-size: 1.1rem;
      "
    >
      <UiButton
        color="orange"
        text-color="white"
        class="full-width q-py-sm"
        label="Entrar"
        @click="login"
        :disabled="isLoading"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { UiButton } from '../components/index.js'

const isLoading = ref(false)
const router = useRouter()
const login = () => router.push('/loginPage')
</script>

<style scoped>
.spinner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}
</style>
