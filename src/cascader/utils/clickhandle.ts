/**
 * 返回处理点击和双击事件的函数。
 *
 * @param onClick - 单击事件触发时调用的回调函数。
 * @param onDbClick - 双击事件触发时调用的回调函数。
 * @param delay - 双击事件的最大时间间隔（毫秒），默认为 200 毫秒。
 * @returns [handleClick, handleDoubleClick] - 处理单击和双击事件的函数。
 */
export function useClickHandler(onClick: Function, onDbClick: Function, delay = 200) {
  let clickHandleTimer: number | undefined // 定时器句柄，用于处理点击事件的延迟
  let count = 0 // 点击次数计数器
  /**
   * 处理单击事件。
   * 在点击事件触发后，设置一个定时器来判断是否是单击还是双击。
   * 如果在指定延迟时间内只点击了一次，则触发单击回调函数。
   * 如果在指定时间内又点击了一次，则取消单击回调的触发。
   *
   * @param args - 单击事件传递的参数。
   */
  const handleClick = function (...args: any[]) {
    count++ // 增加点击次数
    window.clearTimeout(clickHandleTimer) // 清除之前的定时器，以避免误判为双击

    // 设置新的定时器
    clickHandleTimer = setTimeout(function () {
      if (count === 1) {
        onClick(...args) // 只有一次点击，触发单击事件
        count = 0 // 重置点击次数计数器
      }
      // 防止可能存在的越界
      if (count > 2) return (count = 0)
    }, delay)
  }

  /**
   * 处理双击事件。
   * 在双击事件触发时，取消单击事件的定时器并立即触发双击回调函数。
   *
   * @param args - 双击事件传递的参数。
   */
  const handleDoubleClick = function (...args: any[]) {
    clearTimeout(clickHandleTimer) // 清除单击事件的定时器
    onDbClick(...args) // 触发双击事件
    count = 0
  }

  return [handleClick, handleDoubleClick] // 返回处理单击和双击事件的函数
}
