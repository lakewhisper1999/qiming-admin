<template>
  <div class="multi-upload">
    <!-- 已上传图片列表 -->
    <div v-if="imageList.length > 0" class="image-grid">
      <div
        v-for="(url, index) in imageList"
        :key="url + index"
        class="image-item"
        :class="{ cover: index === 0, dragging: dragIndex === index }"
        draggable="true"
        @dragstart="onDragStart(index)"
        @dragover.prevent="onDragOver(index)"
        @dragend="onDragEnd"
      >
        <img :src="resolveUrl(url)" class="thumb" alt="" />
        <div class="item-overlay">
          <span v-if="index === 0" class="cover-badge">封面</span>
          <div class="item-actions">
            <button class="item-btn" title="设为封面" @click.stop="setCover(index)" v-if="index !== 0">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </button>
            <button class="item-btn item-btn-remove" title="移除" @click.stop="removeImage(index)">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <span class="item-index">{{ index + 1 }}</span>
      </div>

      <!-- 添加按钮 -->
      <div class="add-btn" @click="triggerInput">
        <input
          ref="fileInput"
          type="file"
          accept="image/*,video/*"
          multiple
          style="display:none"
          @change="handleFileChange"
        />
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="12" y1="5" x2="12" y2="19" stroke-linecap="round"/>
          <line x1="5" y1="12" x2="19" y2="12" stroke-linecap="round"/>
        </svg>
        <span>添加</span>
      </div>
    </div>

    <!-- 空状态上传区 -->
    <div
      v-else
      class="upload-zone"
      :class="{ dragging: isDragging }"
      @click="triggerInput"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*,video/*"
        multiple
        style="display:none"
        @change="handleFileChange"
      />
      <div class="upload-placeholder">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 16V4m0 0L8 8m4-4l4 4" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20 16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <p class="upload-text">点击或拖拽文件到此处</p>
        <p class="upload-hint">可一次选择多张图片，第一张将自动设为封面</p>
      </div>
    </div>

    <!-- 手动 URL 输入 -->
    <div class="url-row">
      <el-input
        :model-value="manualUrl"
        placeholder="或手动输入 URL，回车添加"
        size="small"
        @keyup.enter="addManualUrl"
        v-model="manualUrl"
      />
      <el-button size="small" @click="addManualUrl" :disabled="!manualUrl.trim()">添加</el-button>
    </div>

    <p v-if="imageList.length > 0" class="upload-tip">
      共 {{ imageList.length }} 张 · 拖拽可排序 · 第一张为封面
    </p>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: { type: String, default: '' }
})
const emit = defineEmits(['update:modelValue'])

const fileInput = ref(null)
const isDragging = ref(false)
const dragIndex = ref(null)
const manualUrl = ref('')

const imageList = computed(() => {
  if (!props.modelValue) return []
  try {
    const arr = JSON.parse(props.modelValue)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
})

function resolveUrl(url) {
  if (!url) return ''
  // 管理后台已配置 /uploads 代理，使用相对路径避免跨域
  if (url.startsWith('/uploads/')) return url
  return url
}

function emitList(list) {
  emit('update:modelValue', list.length > 0 ? JSON.stringify(list) : '')
}

function triggerInput() {
  fileInput.value?.click()
}

function handleDrop(e) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files || [])
  if (files.length > 0) uploadFiles(files)
}

function handleFileChange(e) {
  const files = Array.from(e.target.files || [])
  if (files.length > 0) uploadFiles(files)
  e.target.value = ''
}

async function uploadFiles(files) {
  const token = localStorage.getItem('admin_token') || ''
  const uploaded = []

  for (const file of files) {
    if (file.size > 500 * 1024 * 1024) {
      ElMessage.warning(`${file.name} 超过 500MB，已跳过`)
      continue
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const json = await res.json()
      if (json.code === 200 || json.code === '200') {
        const url = json.data?.url || json.data
        uploaded.push(url)
      } else {
        ElMessage.error(`${file.name} 上传失败: ${json.message || '未知错误'}`)
      }
    } catch {
      ElMessage.error(`${file.name} 上传失败`)
    }
  }

  if (uploaded.length > 0) {
    emitList([...imageList.value, ...uploaded])
    ElMessage.success(`成功上传 ${uploaded.length} 个文件`)
  }
}

function removeImage(index) {
  const list = [...imageList.value]
  list.splice(index, 1)
  emitList(list)
}

function setCover(index) {
  const list = [...imageList.value]
  const [item] = list.splice(index, 1)
  list.unshift(item)
  emitList(list)
  ElMessage.success('已设为封面')
}

// 拖拽排序
function onDragStart(index) {
  dragIndex.value = index
}
function onDragOver(index) {
  if (dragIndex.value === null || dragIndex.value === index) return
  const list = [...imageList.value]
  const [moved] = list.splice(dragIndex.value, 1)
  list.splice(index, 0, moved)
  dragIndex.value = index
  emitList(list)
}
function onDragEnd() {
  dragIndex.value = null
}

function addManualUrl() {
  const url = manualUrl.value.trim()
  if (!url) return
  emitList([...imageList.value, url])
  manualUrl.value = ''
}
</script>

<style scoped>
.multi-upload {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.image-item {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: grab;
  background: #f5f5f5;
  transition: border-color 0.2s, transform 0.2s;
}

.image-item:active {
  cursor: grabbing;
}

.image-item.cover {
  border-color: #409eff;
}

.image-item.dragging {
  opacity: 0.4;
}

.thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-item:hover .item-overlay {
  opacity: 1;
}

.cover-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  padding: 1px 6px;
  border-radius: 4px;
  background: #409eff;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 600;
}

.item-actions {
  display: flex;
  gap: 4px;
}

.item-btn {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
}

.item-btn:hover {
  background: #fff;
}

.item-btn-remove:hover {
  background: #f56c6c;
  color: #fff;
}

.item-index {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 0.65rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn {
  width: 100px;
  height: 100px;
  border-radius: 10px;
  border: 2px dashed rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  color: #aaa;
  transition: all 0.2s;
  background: rgba(0, 0, 0, 0.02);
}

.add-btn:hover {
  border-color: #409eff;
  color: #409eff;
  background: rgba(64, 158, 255, 0.04);
}

.add-btn span {
  font-size: 0.7rem;
}

.upload-zone {
  border: 2px dashed rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  padding: 28px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s ease;
  background: rgba(0, 0, 0, 0.02);
}

.upload-zone:hover,
.upload-zone.dragging {
  border-color: #409eff;
  background: rgba(64, 158, 255, 0.04);
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
  font-size: 0.72rem;
  color: #aaa;
  margin: 0;
}

.url-row {
  display: flex;
  gap: 8px;
}

.upload-tip {
  font-size: 0.72rem;
  color: #999;
  margin: 0;
}
</style>
