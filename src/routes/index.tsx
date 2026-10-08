import Home from "./index";
import Camera from "./camera";
import Admin from "./admin";

export const routes = [
  { path: "/", component: Home },
  { path: "/camera", component: Camera },
  { path: "/admin", component: Admin },
];