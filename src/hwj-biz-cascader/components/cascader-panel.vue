<template>
  <div
    class="cascader-panel"
    @focusin="hanleFocus"
    @blur="handleBlur"
    @keydown.stop="handleKeyDown"
    tabindex="0"
    ref="cascaderPanelRef"
    @mouseenter="handleMouseenter"
    @mouseleave="handleMouseleave"
  >
    <div class="cascader-panel-container" :style="{ height: panelHeight }">
      <ul
        class="scrollable"
        :class="{ 'scrollable-hidden': !scrollbarVisible }"
        ref="listRef"
        v-if="options?.length"
      >
        <li
          v-for="(item, index) in options"
          :class="{
            active: item.selected,
            hover: currentIndex == index && isFocus,
            disabled: item.disabled
          }"
          :key="item[valueKey]"
          @click="() => clickSelected(item, index)"
          @dblclick="() => doubleClickSubmit(item)"
        >
          <i v-if="item.checked" class="icon-checked-box iconfont icon-checked"></i>
          <span>{{ item[labelKey] }}</span>
          <div class="btn-box">
            <!-- 箭头 -->
            <i
              v-if="!item?.leaf && !item.loading && !filterable"
              class="arrow-icon-box iconfont icon-arrow"
            ></i>
            <!-- 加载效果 -->
            <i v-if="item.loading && !item.leaf && lazy == true" class="iconfont icon-loading"></i>
          </div>
        </li>
      </ul>
      <div class="no-data-box" v-if="!options?.length">暂无数据</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '../icon-class/iconfont.css'
import { CascaderPanelProps, CascaderOption } from '../main'
import { ref, computed, nextTick } from 'vue'
import { addLevel } from '../utils/index.ts'
import { useClickHandler } from '../utils/clickhandle.ts'
const emits = defineEmits(['addPanel', 'submitData', 'arrowLeft', 'arrowRight', 'enterSubmit'])
const props = withDefaults(defineProps<CascaderPanelProps>(), {
  setProps: () => ({
    valueKey: 'value',
    labelKey: 'label',
    childrenKey: 'children'
  }),
  panelHeight: '204px',
  filterable: false
})
const { valueKey, labelKey, childrenKey } = props.setProps
// cascaderPanelRef dom元素 面板dom元素
const cascaderPanelRef = ref()
// 列表dom
const listRef = ref()
// 聚焦状态判定
const isFocus = ref(false)

// 当前选中的下标
let currentIndex = ref(0)
let oldIndex = ref(-1)

// 当前选中的元素
const currentItem = computed(() => {
  return props.options[currentIndex.value]
})
// 滚动条是否可见
const scrollbarVisible = ref(false)
// 处理单击和双击冲突
const [clickSelected, doubleClickSubmit] = useClickHandler(
  (item: CascaderOption, index?: number) => handleSelected(item, index),
  (item: CascaderOption) => handleSubmit(item),
  50
)

// 选择数据
const handleSelected = (item: CascaderOption, index?: number) => {
  if (item?.disabled) return
  const newIndex = index || props.options.indexOf(item)

  oldIndex.value = currentIndex.value
  currentIndex.value = newIndex
  // 懒加载处理函数
  handleLazy(item)
  emits('addPanel', { currentItem: item, filterable: props.filterable })
}

// 懒加载处理函数
const handleLazy = (item: CascaderOption) => {
  // 懒加载
  if (props.lazy && props.lazyLoad && !item?.leaf) {
    // 请求到子数组
    item.loading = true
    props.lazyLoad(item).then(
      (res: CascaderOption[]) => {
        // 如果传递了懒加载返回函数则用户控制数据添加，返回的值是当前对象和处理完格式的请求值
        if (props.lazyCallBack) {
          props.lazyCallBack(item, addLevel(res, (item.level as number) + 1))
        } else {
          // 默认添加
          item[childrenKey] = addLevel(res, (item.level as number) + 1)
        }
        item.loading = false
      },
      () => {
        item.loading = false
      }
    )
  }
}
// 提交数据
const handleSubmit = (item: CascaderOption) => {
  if (item.disabled) return
  // 如果当前提交的元素不是选中元素则触发selecet方法选中当前元素
  if (!item.selected) {
    handleSelected(item)
  }
  emits('submitData', { currentItem: item, filterable: props.filterable })
}

// 键盘事件处理
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    // 上
    case 'ArrowUp':
      setIndexCount(-1)
      break
    // 下
    case 'ArrowDown':
      setIndexCount(1)
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
      emits('enterSubmit', { currentItem: currentItem.value, filterable: props.filterable })
      break
  }
  // 选中当前元素
  if (e.key == 'ArrowUp' || e.key == 'ArrowDown') {
    if (currentIndex.value != oldIndex.value) {
      handleSelected(currentItem.value)
    }
  }
  if (e.key != 'Enter') setScrollHeight()
}
// index 处理和限制
const setIndexCount = (num: number) => {
  let max = props.options.length - 1

  const nextIndext = currentIndex.value + num
  const nextItem = props.options[nextIndext]

  if (nextItem?.disabled) {
    if (nextIndext == max && num > 0) {
      return
    } else if (nextIndext == 0 && num < 0) {
      return
    } else {
      return setIndexCount(num * 2)
    }
  }

  oldIndex.value = currentIndex.value
  if (nextIndext > max) {
    currentIndex.value = max
  } else if (nextIndext < 0) {
    currentIndex.value = 0
  } else {
    currentIndex.value = nextIndext
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
const hanleFocus = (e) => {
  //  全部为禁用则失去焦点
  const disabled = props.options?.every((item) => item.disabled)
  // 是否有选中
  const hasSelected = props.options?.some((item) => item.selected)

  if (disabled) return cascaderPanelRef.value.blur()

  let newIndex = currentIndex.value
  oldIndex.value = currentIndex.value
  while (props.options[newIndex]?.disabled && (currentIndex.value = newIndex)) {
    newIndex += 1
  }

  // 如果有被选中的则不会重复执行选中
  if (!hasSelected && !e.sourceCapabilities) {
    handleSelected(currentItem.value)
  }

  if (hasSelected && !e.sourceCapabilities) {
    const selectedItem = props.options.find((item) => item.selected)
    currentIndex.value = props.options.indexOf(selectedItem)
    setScrollHeight()
  }

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
    position: relative;
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
        cursor: pointer;
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
        .btn-box {
          margin-left: auto;
          display: flex;
          .arrow-icon-box {
            font-size: 12px;
            transform: rotate(90deg);
          }
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
    .no-data-box {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      // font-weight: 600;
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
