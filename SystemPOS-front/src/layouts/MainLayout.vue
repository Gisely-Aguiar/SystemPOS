<template>
  <div>
    <background />
    <Uilogo />
    <UiButton :label="'Entrar'" />
    <UiButton
      class="register"
      :label="'Cadastre-se'"
      :click="
        () => {
          router.push('/register')
        }
      "
    />
  </div>
</template>

<script setup>
import { UiButton, background, Uilogo } from '../components/index.js'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style>
.register {
  top: 500px;
}
</style>

