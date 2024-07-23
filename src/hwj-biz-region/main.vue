<template>
  <Cascader
    v-model="cascaderModelValue"
    :set-props="setProps"
    :options="options"
    :separator="separator"
    :clearable="clearable"
    :input-placeholder="inputPlaceholder"
    :panel-height="panelHeight"
    :lazy="true"
    :lazy-load="lazyLoad"
    :lazy-call-back="lazyCallBack"
    :filterable="filterable"
    :width="width"
    @change="myChange"
    @finally="myFinally"
    @close="myClose"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Cascader from '../hwj-biz-cascader/main.vue'
import { CascaderProps } from './main.ts'
const props = withDefaults(defineProps<CascaderProps>(), {
  // 默认不开启清空
  clearable: false,
  // 分隔符
  separator: '/',
  // input占位符
  inputPlaceholder: '请选择',
  filterable: false,
  panelHeight: '204px',
  lazy: false,
  setProps: () => ({
    valueKey: 'value',
    labelKey: 'label',
    childrenKey: 'children'
  }),
  width: '200px'
})

const emits = defineEmits(['update:modelValue', 'change', 'finally', 'close'])
const hasSetModel = ref(false)
const cascaderModelValue = computed({
  get() {
    const { provinceCode, cityCode, areaCode } = props.modelValue
    console.log({ provinceCode, cityCode, areaCode })
    return [provinceCode, cityCode, areaCode]
  },
  set() {
    hasSetModel.value = true
    // 清空时，手动触发change
    // if (v.length == 0) {
    //   myChange({ inputKey: '', valList: [] })
    // }
  }
})

const myChange = (newVal) => {
  if (hasSetModel.value) {
    const [provinceName = '', cityName = '', areaName = ''] = strHandle(newVal['inputKey'])
    const [provinceCode = '', cityCode = '', areaCode = ''] = newVal['valList']
    emits('update:modelValue', {
      provinceName,
      cityName,
      areaName,
      provinceCode,
      cityCode,
      areaCode
    })
    hasSetModel.value = false
  }
  emits('change', newVal)
}

const myFinally = (newVal) => {
  emits('finally', newVal)
}

const myClose = () => {
  emits('close')
}

const strHandle = (str: string) => {
  if (str.includes(props.separator)) {
    return str.split(props.separator)
  } else {
    return [str]
  }
}
</script>

<style scoped lang="scss"></style>
