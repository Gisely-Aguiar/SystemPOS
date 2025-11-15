<template>
  <div>
    <h1>Login Layout</h1>
    <background />
    <Uilogo />
    <UiButton :label="'Entrar'" />
    <UiButton class="register" :label="'Cadastre-se'" />
  </div>
</template>

<script setup>
// import background from '../components/BackgroundBody.vue';
// import logo from '../components/logoLogin.vue';
// import btn from '../components/ButtonInput.vue';
import { UiButton, background, Uilogo } from '../components/index.js'
</script>

<style>
.register {
  top: 500px;
}
</style>
