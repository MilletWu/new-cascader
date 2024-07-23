import { onMounted, onUnmounted, type Ref } from 'vue'

/**
 * @param {Ref<HTMLElement | null>} elementRef - 要监控点击事件的元素的引用。
 * @param {(event: Event) => void} callback - 点击元素外部时要执行的回调函数。
 * @example
 * useClickOutside(myRef, () => {
 *   console.log("Clicked outside!");
 * });
 */
export function useClickOutside(
  elementRef: Ref<HTMLElement | null>,
  callback: (event: Event) => void
) {
  const handleClickOutside = (event: Event) => {
    const el = elementRef.value
    // 如果元素存在，并且事件目标不在元素内或不是元素本身，则执行回调
    if (el && !(el === event.target || el.contains(event.target as Node))) {
      callback(event)
    }
  }

  // 在组件挂载时，添加点击事件监听器
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  // 在组件卸载时，移除点击事件监听器
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
}
