<template>
  <div class="text-input-container" style="padding: 10px 20px; width: 100%">
    <label
      :for="props.name"
      style="font-size: 28px; color: #ffffff; margin-bottom: 10px; display: block"
      >{{ props.name }}</label
    >
    <input
      :type="props.type"
      :name="props.name"
      :placeholder="props.placeholder"
      class="text-input"
      style="
        width: 100%;
        height: 50px;
        font-size: 16px;
        padding: 10px;
        border: none;
        border-radius: 24px;
        cursor: pointer;
      "
      @focus="(e) => (e.target.style.borderColor = '#0056b3')"
      @blur="(e) => (e.target.style.borderColor = '#007bff')"
    />
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
const props = defineProps({
  type: {
    type: String,
    default: 'text',
  },
  name: {
    type: String,
    default: 'input',
  },
  placeholder: {
    type: String,
    default: 'Digite aqui',
  },
  value: {
    type: String,
    default: '',
  },
})
</script>
