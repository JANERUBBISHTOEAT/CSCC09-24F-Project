import { useEffect, useState } from "react";
import { useBlocker } from "react-router-dom";

export default function PreventRouteChange() {
  const [isBlocking, setIsBlocking] = useState(true);

  const blocker = useBlocker(() => isBlocking);
  useEffect(() => {
    if (blocker.state === "blocked") {
      const confirmLeave = window.confirm("你有未保存的更改，确定要离开吗？");
      if (confirmLeave) {
        blocker.proceed(); // 继续导航
      } else {
        blocker.reset(); // 取消导航
      }
    }
  }, [blocker]);

  return (
    <div className="p-4">
      <h2>防止路由切换</h2>
      <button
        onClick={() => setIsBlocking(!isBlocking)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isBlocking ? "解除拦截" : "启用拦截"}
      </button>
      <p>{isBlocking ? "当前阻止页面离开。" : "可以自由导航。"}</p>
    </div>
  );
}
