import express from "express";
import { verifyToken } from "../../../common/middlewares/authjwt.middleware.js";
import {
  getUsers,
  paginationUsersController,
  countUsersController,
  saveUserController,
  deleteUserController,
  updateUserPhotoController,
  getUsersByPermision,
  saveUserNovedad,
  deleteUserNovedad,
  getUserNovedades,
  getInstructors,
  getPatients,
} from "./users.controller.js";

const usersRoutes = express.Router();

usersRoutes.get("/get_users", verifyToken, getUsers);
usersRoutes.post("/get_users_permision", verifyToken, getUsersByPermision);
usersRoutes.post("/get_instructors", verifyToken, getInstructors);
usersRoutes.post("/get_patients", verifyToken, getPatients);
usersRoutes.post("/list_users", verifyToken, paginationUsersController);
usersRoutes.get("/count_users", verifyToken, countUsersController);
usersRoutes.post("/save_user", verifyToken, saveUserController);
usersRoutes.post("/update_user_photo", verifyToken, updateUserPhotoController);
usersRoutes.put("/delete_user", verifyToken, deleteUserController);
usersRoutes.post("/save_newness_user", verifyToken, saveUserNovedad);
usersRoutes.post("/delete_newness_user", verifyToken, deleteUserNovedad);
usersRoutes.post("/get_newness_user", verifyToken, getUserNovedades);

export default usersRoutes;
