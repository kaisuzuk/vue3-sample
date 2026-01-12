import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useMasterStore } from "@/features/master/model/useMasterStore";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/tasks",
  },
  {
    path: "/tasks",
    name: "TaskList",
    component: () => import("@/pages/tasks/TaskListPage.vue"),
  },
  {
    path: "/tasks/new",
    name: "TaskCreate",
    component: () => import("@/pages/tasks/TaskCreatePage.vue"),
  },
  {
    path: "/tasks/:id/edit",
    name: "TaskEdit",
    component: () => import("@/pages/tasks/TaskEditPage.vue"),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 画面遷移時にマスタ更新チェック
router.beforeEach(async (_to, _from, next) => {
  const { checkAndUpdateMasters, initialized } = useMasterStore();

  // 初期化済みの場合のみマスタ更新チェック
  if (initialized.value) {
    await checkAndUpdateMasters();
  }

  next();
});
