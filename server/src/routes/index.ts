import { Router } from "express";
import healthRoutes from "./health.route";
import protectedRoutes from "./protected.route";
import authRoutes from "../modules/auth/auth.route";
import userRoutes from "../modules/user/user.route";
import employeeRoutes from "../modules/employee/employee.route";

const router = Router();

const moduleRoutes = [
  {
    path: "/",
    route: healthRoutes,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/protected",
    route: protectedRoutes,
  },
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/employees",
    route: employeeRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
