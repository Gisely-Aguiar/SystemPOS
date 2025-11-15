<template>
  <div class="q-gutter-md row">
    <q-select
      class="selects"
      label="Tipo:"
      transition-show="flip-up"
      transition-hide="flip-down"
      filled
      v-model="localModel"
      :options="options"
      style="width: 250px"
      @update:model-value="handleChange"
    />
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Object],
    default: null,
  },
  options: {
    type: Array,
    default: () => ['Google', 'Facebook', 'Twitter', 'Apple', 'Oracle'],
  },
})

const emit = defineEmits(['update:model-value'])

// Criamos uma ref local para trabalhar com o v-model
const localModel = ref(props.modelValue)

// Atualiza o valor local quando a prop muda
watch(
  () => props.modelValue,
  (newValue) => {
    localModel.value = newValue
  },
)

// Emite o evento quando o valor local muda
const handleChange = (value) => {
  emit('update:model-value', value)
}
</script>

<style scoped>
.selects {
  background-color: white;
  border-radius: 20px;
}
</style>
