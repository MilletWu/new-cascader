<template>
  <div
    class="cascader-panel"
    @focus="hanleFocus"
    @blur="handleBlur"
    @keydown.stop="handleKeyDown"
    tabindex="0"
    ref="cascaderPanelRef"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave"
  >
    <div class="cascader-panel-container" :style="{ height: panelHeight }">
      <ul class="scrollable" :class="{ 'scrollable-hidden': !scrollbarVisible }" ref="listRef">
        <li
          v-for="(item, index) in options"
          :class="{
            active: item.selected,
            hover: currentIndex == index && isFocus,
            disabled: item.disabled
          }"
          :key="item.value"
          @click="() => handleSelected(item, index)"
          @dblclick="() => handleSubmit(item)"
        >
          <i v-if="item.checked" class="icon-checked-box iconfont icon-checked"></i>
          <span>{{ item.value }}</span>
          <i v-if="item.children" class="arrow-icon-box iconfont icon-arrow"></i>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import '../icon-class/iconfont.css'
import { CascaderPanelProps, CascaderOption } from '../main'
import { ref, computed, nextTick } from 'vue'
const emits = defineEmits(['addPanel', 'submitData', 'arrowLeft', 'arrowRight', 'enterSubmit'])
const props = withDefaults(defineProps<CascaderPanelProps>(), {})

// cascaderPanelRef dom元素 面板dom元素
const cascaderPanelRef = ref()
// 列表dom
const listRef = ref()
// 聚焦状态判定
const isFocus = ref(false)

// 当前选中的下标
let currentIndex = ref(0)

// 当前选中的元素
const currentItem = computed(() => {
  return props.options[currentIndex.value]
})
// 滚动条是否可见
const scrollbarVisible = ref(false)

// 选择数据
const handleSelected = (item: CascaderOption, index?: number) => {
  if (item.disabled) return
  currentIndex.value = index || props.options.indexOf(item)

  emits('addPanel', item)
}
// 提交数据
const handleSubmit = (item: CascaderOption) => {
  if (item.disabled) return
  emits('submitData', item)
}
// 键盘事件处理
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    // 上
    case 'ArrowUp':
      indexCount(-1)
      setScrollHeight()
      break
    // 下
    case 'ArrowDown':
      indexCount(1)
      setScrollHeight()
      break
    // 左
    case 'ArrowLeft':
      emits('arrowLeft', { direction: 'left', currentItem: currentItem.value })

      break
    // 右
    case 'ArrowRight':
      emits('arrowRight', { direction: 'right', currentItem: currentItem.value })
      break
    // 右
    case 'Enter':
      emits('enterSubmit', { currentItem: currentItem.value })
      break
  }
  // 选中当前元素
  handleSelected(currentItem.value)
}
// index 处理和限制
const indexCount = (num: number) => {
  let max = props.options.length - 1

  currentIndex.value += num

  if (currentIndex.value > max) {
    currentIndex.value = max
  }
  if (currentIndex.value < 0) {
    currentIndex.value = 0
  }

  if (currentItem.value.disabled) {
    if (currentIndex.value == max && num > 0) {
      indexCount(-num)
    } else if (currentIndex.value == 0 && num < 0) {
      indexCount(1)
    } else {
      indexCount(num)
    }
  }
}
// 设置滚动高度
const setScrollHeight = () => {
  nextTick(() => {
    listRef.value.children[currentIndex.value].scrollIntoView({
      behavior: 'smooth'
    })
  })
}

// 获取焦点
const hanleFocus = () => {
  handleSelected(currentItem.value)
  isFocus.value = true
}
// 失去焦点
const handleBlur = () => {
  isFocus.value = false
}
// 鼠标移入
const handleMouseenter = () => {
  scrollbarVisible.value = true
}
// 鼠标移除
const handleMouseleave = () => {
  scrollbarVisible.value = false
}
</script>

<style lang="scss" scoped>
$default-color: #dcdfe6;
$active-color: #409eff;
.cascader-panel {
  position: relative;
  outline: none;
  .cascader-panel-container {
    // width: 180px;
    min-width: 180px;
    min-height: 204px;
    background-color: #fff;
    box-sizing: border-box;
    position: relative;
    min-height: 100%;
    margin: 0;
    padding-right: 2px;
    font-size: 14px;
    color: #606266;
    outline: none;
    ul {
      margin: 0;
      padding: 6px 0;
      height: 100%;
      box-sizing: border-box;
      overflow: auto;
      outline: none;

      li {
        position: relative;
        display: flex;
        align-items: center;
        // justify-content: space-between;
        padding: 0 18px 0 20px;
        height: 34px;
        line-height: 34px;
        outline: none;
        &:hover {
          background-color: #f5f7fa;
        }
        span {
          padding: 0 8px;
          box-sizing: border-box;
          // width: fit-content;
          overflow: hidden; /* 隐藏溢出的内容 */
          white-space: nowrap; /* 不换行 */
          text-overflow: ellipsis; /* 使用省略号显示溢出的内容 */
        }
        .icon-checked-box {
          font-size: 12px;
        }
        .arrow-icon-box {
          font-size: 12px;
          transform: rotate(90deg);
          margin-left: auto;
        }
      }
      .hover {
        background-color: #f5f7fa;
      }
      .active {
        color: $active-color;
        span {
          font-weight: 600;
        }
      }
      .disabled {
        color: #a8abb2 !important;
        // 禁用
        cursor: not-allowed !important;
      }
    }
  }
}

li {
  list-style: none;
}
/*定义滚动条高宽及背景 高宽分别对应横竖滚动条的尺寸*/

.scrollable::-webkit-scrollbar {
  width: 6px;
  // height: 148px;
  // background-color: red;
}

/*定义滚动条轨道 内阴影+圆角*/
.scrollable::-webkit-scrollbar-track {
  // -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  background-color: transparent;
}

/*定义滑块 内阴影+圆角*/
.scrollable::-webkit-scrollbar-thumb {
  border-radius: 10px;
  height: 180px;

  // -webkit-box-shadow: inset 0 0 6px #dddee0;
  background-color: rgba(221, 222, 224, 0.8);
}
.scrollable-hidden::-webkit-scrollbar {
  display: none;
}
</style>
