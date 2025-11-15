<template>
  <div class="loading-overlay" v-if="isLoading">
    <div class="q-gutter-md row justify-center">
      <div class="column items-center">
        <q-spinner-dots color="red" size="7em" />
        <q-tooltip :offset="[0, 8]">QSpinnerBall</q-tooltip>
        <p>{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isLoading: Boolean,
  message: {
    type: String,
    default: 'Carregando...',
  },
  color: {
    type: String,
    default: 'primary',
  },
})
</script>

<style scoped>
.loading-overlay {
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

p {
  color: white;
  font-size: 20px;
  margin-top: 20px;
}
</style>
