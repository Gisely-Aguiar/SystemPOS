<template>
  <router-view />
</template>

<script setup>
//
</script>

<style>
/* ESTILOS GLOBAIS DA SCROLLBAR */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
}

::-webkit-scrollbar-thumb {
  background: #ff7f26;
  border-radius: 6px;
  border: 2px solid #1a1a1a;
}

::-webkit-scrollbar-thumb:hover {
  background: #e67322;
}

::-webkit-scrollbar-thumb:active {
  background: #cc6622;
}

::-webkit-scrollbar-corner {
  background: #1a1a1a;
}

.botao-voltar {
  width: 80px;
  height: 80px;
  background-color: #333;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 20px;
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
}

.botao-voltar:hover {
  background-color: #444;
}

.botao-voltar svg {
  width: 36px;
  height: 36px;
  stroke: white;
  stroke-width: 5;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}
</style>
