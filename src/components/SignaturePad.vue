<template>
<v-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-h6">請在下方簽名</v-card-title>
      <v-card-text>
        <div class="signature-wrapper">
          <canvas ref="canvasRef" class="signature-canvas" />
        </div>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="grey" text @click="clearSignature">清除</v-btn>
        <v-btn color="primary" text @click="saveSignature">確認</v-btn>
        <v-btn color="secondary" text @click="$emit('update:modelValue', false)">取消</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import SignaturePad from 'signature_pad';

const props = defineProps({
  modelValue: Boolean
});
const emit = defineEmits(['update:modelValue', 'done']);

const canvasRef = ref(null);
let signaturePad = null;

watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    nextTick(() => resizeCanvas());
  }
});

const resizeCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  canvas.width = canvas.offsetWidth * ratio;
  canvas.height = canvas.offsetHeight * ratio;
  canvas.getContext('2d').scale(ratio, ratio);
  signaturePad?.clear();
};

onMounted(() => {
  signaturePad = new SignaturePad(canvasRef.value, {
    backgroundColor: 'rgba(0,0,0,0)', // 透明背景
    penColor: 'black'
  });
  resizeCanvas();
});

const clearSignature = () => {
  signaturePad.clear();
};

const saveSignature = () => {
  if (signaturePad.isEmpty()) {
    alert('請先簽名');
    return;
  }
  const dataUrl = signaturePad.toDataURL('image/png');
  emit('done', dataUrl); // 回傳 base64
  emit('update:modelValue', false);
};
</script>

<style scoped>
.signature-wrapper {
  border: 1px solid #ccc;
  border-radius: 6px;
  width: 100%;
  height: 200px;
}
.signature-canvas {
  width: 100%;
  height: 100%;
}
</style>
