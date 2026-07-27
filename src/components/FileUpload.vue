<template>
  <div class="file-upload">
    <!-- 预览区 -->
    <div v-if="previewUrl" class="preview-area">
      <img v-if="isImage" :src="previewUrl" class="preview-media" alt="预览" />
      <video v-else-if="isVideo" :src="previewUrl" class="preview-media" preload="metadata" muted />
      <div class="preview-overlay">
        <button class="btn-remove" @click.stop="handleRemove">移除</button>
      </div>
      <div class="file-info">
        <span class="file-name">{{ fileName || '已上传' }}</span>
        <span class="file-type">{{ isVideo ? '视频' : '图片' }}</span>
      </div>
    </div>

    <!-- 上传区（无预览时显示） -->
    <div
      v-else
      class="upload-zone"
      :class="{ dragging }"
      @click="triggerInput"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="dragging = false"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        style="display: none"
        @change="handleFileChange"
      />
      <div class="upload-placeholder">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 16V4m0 0L8 8m4-4l4 4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p class="upload-text">点击或拖拽文件到此处</p>
        <p class="upload-hint">{{ acceptHint }}</p>
      </div>
    </div>

    <!-- 手动填 URL（备选） -->
    <div class="url-input-row">
      <el-input
        :model-value="modelValue"
        placeholder="或手动输入文件路径 / URL"
        size="small"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: String, default: '' },
  accept: { type: String, default: 'image/*' },
  maxSizeMB: { type: Number, default: 500 },
})
const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const dragging = ref(false)
const uploading = ref(false)
const fileName = ref('')

const isImage = computed(() => {
  if (!props.modelValue) return false
  return /\.(png|jpe?g|gif|webp|avif|svg)$/i.test(props.modelValue)
})
const isVideo = computed(() => {
  if (!props.modelValue) return false
  return /\.(mp4|webm|ogg|mov|avi)$/i.test(props.modelValue)
})
const previewUrl = computed(() => {
  if (!props.modelValue) return ''
  // 如果是 /uploads/ 开头的相对路径，拼完整前缀
  if (props.modelValue.startsWith('/uploads/')) {
    return `http://localhost:8088${props.modelValue}`
  }
  return props.modelValue
})

const acceptHint = computed(() => {
  if (props.accept.includes('image') && props.accept.includes('video')) return '支持图片和视频格式'
  if (props.accept.includes('video')) return '支持 MP4 / WebM 等视频格式'
  return '支持 JPG / PNG / WebP 等图片格式'
})

function triggerInput() {
  fileInput.value?.click()
}

function handleDrop(e) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) uploadFile(file)
}

function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (file) uploadFile(file)
  // 清空 input 的值，允许重复选择同一个文件
  e.target.value = ''
}

async function uploadFile(file) {
  // 校验大小
  if (file.size > props.maxSizeMB * 1024 * 1024) {
    ElMessage.warning(`文件大小不能超过 ${props.maxSizeMB}MB`)
    return
  }

  uploading.value = true
  fileName.value = file.name

  const formData = new FormData()
  formData.append('file', file)

  try {
    const token = localStorage.getItem('admin_token') || ''
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    })
    const json = await res.json()
    if (json.code === 200 || json.code === '200') {
      const url = json.data?.url || json.data
      emit('update:modelValue', url)
      ElMessage.success('上传成功')
    } else {
      ElMessage.error(json.message || '上传失败')
    }
  } catch (e) {
    ElMessage.error('上传失败，请检查网络连接')
  } finally {
    uploading.value = false
  }
}

function handleRemove() {
  emit('update:modelValue', '')
  fileName.value = ''
}
</script>

<style scoped>
.file-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.upload-zone {
  border: 2px dashed rgba(0,0,0,0.12);
  border-radius: 12px;
  padding: 24px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  background: rgba(0,0,0,0.02);
}
.upload-zone:hover,
.upload-zone.dragging {
  border-color: #409eff;
  background: rgba(64,158,255,0.04);
}
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #999;
}
.upload-text {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
}
.upload-hint {
  font-size: 0.75rem;
  color: #aaa;
  margin: 0;
}
.preview-area {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f5f5;
}
.preview-media {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  display: block;
}
.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.preview-area:hover .preview-overlay {
  opacity: 1;
}
.btn-remove {
  padding: 6px 16px;
  border-radius: 8px;
  border: none;
  background: rgba(255,255,255,0.95);
  color: #f56c6c;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}
.file-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 10px;
  font-size: 0.75rem;
  color: #888;
  background: #fafafa;
}
.url-input-row {
  margin-top: 4px;
}
</style>
