<template>
  <el-dialog :title="isEdit ? '编辑作品' : '新增作品'" v-model="visible" width="680px" @close="resetForm">
    <el-form ref="formEl" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="作品标题" />
      </el-form-item>
      <el-form-item label="分类" prop="categoryId">
        <el-select v-model="form.categoryId" placeholder="选择分类" style="width:100%">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="多图上传" prop="imageList">
        <MultiImageUpload v-model="form.imageList" @update:model-value="syncCoverUrl" />
        <div class="cover-hint">第一张自动设为封面，可拖拽排序、点击星标切换封面</div>
      </el-form-item>
      <el-form-item label="封面URL" prop="coverUrl">
        <el-input v-model="form.coverUrl" placeholder="封面（由多图上传自动填充）" readonly />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="form.description" type="textarea" :rows="3" placeholder="作品描述" />
      </el-form-item>
      <el-form-item label="下载URL" prop="downloadUrl">
        <el-input v-model="form.downloadUrl" placeholder="下载链接（可选）" />
      </el-form-item>
      <el-form-item label="视频嵌入地址" prop="videoUrl">
        <el-input v-model="form.videoUrl" placeholder="B站/YouTube 视频页链接（可选，前端以嵌入方式播放）" />
      </el-form-item>
      <el-form-item label="文件大小" prop="fileSize">
        <el-input-number v-model="form.fileSize" :min="0" placeholder="字节" style="width:100%" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '../../utils/request'
import MultiImageUpload from '../../components/MultiImageUpload.vue'

defineProps({ categories: { type: Array, default: () => [] } })
const emit = defineEmits(['success'])

const visible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formEl = ref()
const editId = ref(null)

const form = reactive({
  title: '',
  categoryId: null,
  coverUrl: '',
  imageUrls: '',
  imageList: '',
  description: '',
  downloadUrl: '',
  videoUrl: '',
  fileSize: 0
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  imageList: [{ required: true, message: '请至少上传一张图片作为封面', trigger: 'change' }]
}

/** 多图上传变化时，自动将第一张同步为封面 */
function syncCoverUrl(imageListStr) {
  try {
    const arr = imageListStr ? JSON.parse(imageListStr) : []
    if (Array.isArray(arr) && arr.length > 0) {
      form.coverUrl = arr[0]
    } else {
      form.coverUrl = ''
    }
  } catch {
    form.coverUrl = ''
  }
}

function resetForm() {
  formEl.value?.resetFields()
  Object.assign(form, { title: '', categoryId: null, coverUrl: '', imageUrls: '', imageList: '', description: '', downloadUrl: '', videoUrl: '', fileSize: 0 })
}

function buildImageList(coverUrl, imageUrlsStr) {
  const list = []
  if (coverUrl) list.push(coverUrl)
  try {
    const extra = imageUrlsStr ? JSON.parse(imageUrlsStr) : []
    if (Array.isArray(extra)) list.push(...extra)
  } catch { /* ignore */ }
  return list
}

function open(row) {
  visible.value = true
  if (row?.id) {
    isEdit.value = true
    editId.value = row.id
    Object.assign(form, {
      title: row.title,
      categoryId: row.categoryId,
      coverUrl: row.coverUrl || '',
      imageUrls: row.imageUrls || '',
      imageList: JSON.stringify(buildImageList(row.coverUrl, row.imageUrls)),
      description: row.description || '',
      downloadUrl: row.downloadUrl || '',
      videoUrl: row.videoUrl || '',
      fileSize: row.fileSize || 0
    })
  } else {
    isEdit.value = false
    editId.value = null
    Object.assign(form, { title: '', categoryId: null, coverUrl: '', imageUrls: '', imageList: '', description: '', downloadUrl: '', videoUrl: '', fileSize: 0 })
  }
}

function splitImageListBeforeSubmit() {
  try {
    const arr = form.imageList ? JSON.parse(form.imageList) : []
    if (Array.isArray(arr) && arr.length > 0) {
      form.coverUrl = arr[0]
      form.imageUrls = arr.length > 1 ? JSON.stringify(arr.slice(1)) : ''
    } else {
      form.coverUrl = ''
      form.imageUrls = ''
    }
  } catch {
    form.coverUrl = ''
    form.imageUrls = ''
  }
}

async function handleSubmit() {
  const valid = await formEl.value.validate().catch(() => false)
  if (!valid) return

  splitImageListBeforeSubmit()
  if (!form.coverUrl) {
    ElMessage.warning('请至少上传一张图片作为封面')
    return
  }

  submitting.value = true
  try {
    if (isEdit.value) {
      await request.put(`/admin/artworks/${editId.value}`, form)
    } else {
      await request.post('admin/artworks', form)
    }
    ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
    visible.value = false
    emit('success')
  } finally {
    submitting.value = false
  }
}

defineExpose({ open })
</script>

<style scoped>
.cover-hint {
  font-size: 0.72rem;
  color: #999;
  margin-top: 4px;
}
</style>
