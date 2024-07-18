<template>
  <div class="cascader-box" ref="cascaderBoxRef" tabindex="0" @keydown="handleKeydown">
    <!-- Input 框-->
    <div
      class="input-box"
      :class="{ active: hasOPen }"
      ref="inputBoxRef"
      tabindex="0"
      @mouseenter="onInputBoxMouseEnter"
      @mouseleave="onInputBoxMouseLeave"
      @click="onInputBoxClick"
    >
      <input
        type="text"
        v-model="inputValue"
        ref="inputRef"
        :placeholder="inputPlaceholder"
        :readonly="!filterable"
      />
      <div class="btn-box">
        <!-- 清空 -->
        <span class="clear-btn iconfont icon-clear" v-show="hasClear" @click.stop="clear"></span>
        <!-- 箭头 表示状态 -->
        <Transition>
          <span
            v-show="true"
            class="arrow-icon-box iconfont icon-arrow"
            :class="{ 'arrow-retrun': hasOPen }"
          ></span
        ></Transition>
      </div>
    </div>
    <!-- 面板展示 -->
    <Transition name="fade">
      <div class="panel-list-box" v-show="hasOPen">
        <div class="panel-list-container" ref="panelListRef">
          <CascaderPanel
            :panelHeight="panelHeight"
            :options="panelOptions"
            @addPanel="addPanel"
            @submitData="submitData"
            @arrowLeft="handlePanelKeydown"
            @arrowRight="handlePanelKeydown"
            @enterSubmit="enterSubmit"
          />
          <template v-for="panelItem in paneShowlList" :key="panelItem.label">
            <CascaderPanel
              :options="panelItem.children"
              :panelHeight="panelHeight"
              @addPanel="addPanel"
              @submitData="submitData"
              @arrowLeft="handlePanelKeydown"
              @arrowRight="handlePanelKeydown"
              @enterSubmit="enterSubmit"
            />
          </template>
        </div>

        <span class="decoration-icon"></span>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import CascaderPanel from './components/cascader-panel.vue'
import './icon-class/iconfont.css'
import { CascaderProps, CascaderOption } from './main'
import { ref, computed, reactive, nextTick } from 'vue'
import { useClickOutside } from './hooks/click-outside'
import { addLevel, addSelectedField } from './utils/index.ts'

const props = withDefaults(defineProps<CascaderProps>(), {
  // 默认不开启清空
  clearable: false,
  // 分隔符
  separator: '/',
  // input占位符
  inputPlaceholder: '请选择',
  filterable: false,
  panelHeight: '200px'
})
const emits = defineEmits(['update:modelValue', 'finally', 'change', 'close'])
// 数据添加层级标识
const panelOptions = computed(() => {
  // props.options
  let newOptions = addSelectedField(props.options)
  return reactive(addLevel(newOptions))
})
// 面板列表
const panelList = reactive<CascaderOption[]>([])
// 面板dom
const panelListRef = ref()
// 展示面板列表
const paneShowlList = computed(() => {
  return panelList.filter((item) => item?.children)
})
// 保存面板值
const hasOpenValue = ref(false)
// 面板是否展开
const hasOPen = computed({
  get() {
    return hasOpenValue.value
  },
  set(v) {
    hasOpenValue.value = v
    if (!hasOpenValue.value) {
      emits('close')
    }
  }
})

// cascaderBox dom对象
const cascaderBoxRef = ref()

// inputBoxRef dom对象
const inputBoxRef = ref()
// input dom对象
const inputRef = ref<HTMLInputElement>()

// input-box 是否触发hover事件
let hasInputHover = ref(false)

// 旧的选中对象
let oldChecked: CascaderOption = { value: '', label: '', checked: false }

// 是否显示清空
const hasClear = computed(() => {
  // props.clear是否存在，是否为true,input-box是否触发hover,input是否存在值
  return props.clearable && inputValue.value && hasInputHover.value
})
const inputValue = computed({
  get() {
    return props.modelValue
  },
  set(v) {
    emits('finally', { newVal: v })
    if (v !== inputValue.value) {
      emits('change', { newVal: v })
      emits('update:modelValue', v)
    }
  }
})

// input-box 移入事件处理
const onInputBoxMouseEnter = () => {
  if (!props.clearable) return
  hasInputHover.value = true
}

// input-box 移出事件处理
const onInputBoxMouseLeave = () => {
  if (!props.clearable) return
  hasInputHover.value = false
}
// input-box 单击事件处理
const onInputBoxClick = () => {
  hasOPen.value = true
}
// input-box 外部单击事件处理
const onInputBoxOutsideClick = () => {
  hasOPen.value = false
}
// 外部钩子
useClickOutside(cascaderBoxRef, onInputBoxOutsideClick)

//添加面板
const addPanel = (panelItem: CascaderOption) => {
  panelItem.selected = true
  // 先判断这个层级是否存在面板渲染
  const index = panelList.findIndex((item) => item?.level === panelItem?.level)
  // 如果新添加的面板与之前一致则不处理
  // if (panelList[index] == panelItem) return
  // 如果存在则替换旧层级面板
  if (index !== -1) {
    if (panelList[index] != panelItem) {
      // 重置所有样式
      resetSelected(index)
    } else {
      // 重置后面所有面板样式
      resetSelected(index + 1)
    }
    panelList.splice(index, 1, panelItem)
    // 清除后面所有面板
    panelList.splice(index + 1)
  } else {
    panelList.push(panelItem)
  }
}
// 重置所有面板样式
const resetSelected = (index: number) => {
  for (let i = index; i < panelList.length; i++) {
    panelList[i].selected = false
  }
}

// 数据提交
const submitData = (panelItem: CascaderOption) => {
  oldChecked.checked = false
  panelItem.checked = true
  oldChecked = panelItem
  let newData = ''
  let separator = ` ${props.separator} `
  panelList.forEach((item) => {
    newData += item.value + separator
  })
  // 去掉末尾的分隔符
  newData = newData.slice(0, newData.lastIndexOf(separator))
  inputValue.value = newData
  // 关闭面板列表
  hasOPen.value = false
  // 聚焦到面板
  nextTick(() => {
    // cascaderBoxRef.value.focus()
    props.filterable ? inputRef.value?.focus() : inputBoxRef.value?.focus()
  })
}
// 回车事件提交数据
const enterSubmit = ({ currentItem }: { currentItem: CascaderOption }) => {
  submitData(currentItem)
}
type keydown = {
  direction?: string
  currentItem?: CascaderOption
}
// 当前组件键盘事件处理
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key == 'ArrowDown') {
    hasOPen.value = true
    nextTick(() => {
      panelListRef.value.children[0].focus()
    })
  }
}
// 面板键盘事件处理
const handlePanelKeydown = ({ direction, currentItem }: keydown) => {
  const currentIndex = (currentItem.level as number) - 1
  let newxIndex = currentIndex
  // 有子元素则能往右聚焦
  let hasRight = currentItem.children ? true : false
  // 层级不是第一层则能往左聚焦
  let hasLeft = currentItem.level != 1 ? true : false

  switch (direction) {
    case 'left':
      if (!hasLeft) break
      newxIndex -= 1
      break
    case 'right':
      if (!hasRight) break
      newxIndex += 1
      break
  }
  const nextFocusItem = panelListRef.value.children[newxIndex]
  nextTick(() => {
    nextFocusItem.focus()
  })
}
// 清空
const clear = () => {
  inputValue.value = ''
  panelList.splice(0)
  oldChecked.checked = false
  hasOPen.value = false
}
</script>

<style scoped lang="scss">
$default-color: #dcdfe6;
$active-color: #409eff;

.cascader-box {
  box-sizing: border-box;
  position: relative;
  color: #606266;
  width: fit-content;
  outline: none;
  .input-box {
    box-sizing: border-box;
    padding: 1px 11px;
    border-radius: 5px;
    border: 1px solid #dcdfe6;
    display: flex;
    justify-content: center;
    align-items: center;
    outline: none;
    cursor: pointer;

    input {
      box-sizing: border-box;
      padding: 0 2px;
      border: none;
      outline: none;
      width: auto;
      height: 28px;
      font-size: 14px;
      color: #606266;
      overflow: hidden; /* 隐藏溢出的内容 */
      white-space: nowrap; /* 不换行 */
      text-overflow: ellipsis; /* 使用省略号显示溢出的内容 */
      cursor: pointer;
    }
    &:focus-within {
      border-color: $active-color;
    }

    .btn-box {
      position: relative;
      width: 14px;
      height: 28px;

      .clear-btn,
      .arrow-icon-box {
        position: absolute;
        top: 50%;
        left: 50%;
        background-color: #fff;
        transform: translate(-50%, -50%) rotate(180deg);
      }
      .clear-btn {
        z-index: 2;
      }
      .arrow-icon-box {
        font-size: 12px;
        transition: all 0.4s;
      }
    }
  }
  .active {
    border-color: $active-color;
  }
  .panel-list-box {
    position: absolute;
    top: 50px;
    z-index: 2000;
    .panel-list-container {
      display: flex;
      border: 1px solid $default-color;
      border-radius: 5px;
      overflow: hidden;
      box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.12);
      :deep(.cascader-panel) {
        border-left: 1px solid $default-color;
        &:first-child {
          border: none;
        }
      }
    }
    .decoration-icon {
      position: absolute;
      top: -4px;
      width: 10px;
      height: 10px;
      background: #fff;
      border: 1px solid $default-color;
      transform: rotate(45deg);
      border-top-left-radius: 2px;
      left: 35px;
      z-index: -1;
    }
  }
}

.iconfont {
  color: $default-color;
}
.arrow-retrun {
  transform: translate(-50%, -50%) rotate(360deg) !important;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
