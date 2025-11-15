<template>
  <!--um botão de login sem nada escrito usando props-->
  <button class="btn" @click="props.click">{{ label }}</button>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    default: 'Login',
  },
  click: {
    type: Function,
    default: () => {},
  },
})
</script>

<style>
.btn {
  /* width: 250px; */
  height: 70px;
  font-size: 20px;
  border-radius: 10px;
  /* font-size: 20px; */
  background-color: #ff7f26;
  color: white;
  border: none;
  cursor: pointer;
}

.btn:hover {
  background-color: #b14a01;
}

.btn:active {
  background-color: #ff7f26;
}
</style>
