<template>
  <el-dialog :title="isEdit ? '编辑图文' : '新增图文'" v-model="visible" width="700px" @close="resetForm">
    <el-form ref="formEl" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="图文标题" />
      </el-form-item>
      <el-form-item label="分类" prop="categoryId">
        <el-select v-model="form.categoryId" placeholder="选择分类" style="width:100%">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="封面" prop="coverUrl">
        <FileUpload v-model="form.coverUrl" accept="image/*" />
      </el-form-item>
      <el-form-item label="正文" prop="content">
        <el-input v-model="form.content" type="textarea" :rows="12" placeholder="Markdown 正文" />
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
import FileUpload from '../../components/FileUpload.vue'

defineProps({ categories: { type: Array, default: () => [] } })
const emit = defineEmits(['success'])

const visible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formEl = ref()
const editId = ref(null)

const form = reactive({ title: '', categoryId: null, coverUrl: '', content: '' })
const rules = { title: [{ required: true, message: '请输入标题', trigger: 'blur' }] }

function resetForm() {
  formEl.value?.resetFields()
  Object.assign(form, { title: '', categoryId: null, coverUrl: '', content: '' })
}

function open(row) {
  visible.value = true
  if (row?.id) {
    isEdit.value = true; editId.value = row.id
    Object.assign(form, { title: row.title, categoryId: row.categoryId, coverUrl: row.coverUrl || '', content: row.content || '' })
  } else { isEdit.value = false; editId.value = null }
}

async function handleSubmit() {
  const valid = await formEl.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (isEdit.value) await request.put(`/admin/articles/${editId.value}`, form)
    else await request.post('/admin/articles', form)
    ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
    visible.value = false; emit('success')
  } finally { submitting.value = false }
}

defineExpose({ open })
</script>
