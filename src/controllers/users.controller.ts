// import userService from '../services/users.service';
// import asyncHandler from '../utils/asyncHandler';
//
// // Clean. No try/catch. Errors flow to the global handler.
// export const getAll = asyncHandler(async (req, res) => {
//   const users = await userService.findAll();
//   res.json({ data: users });
// });
//
// export const getOne = asyncHandler(async (req, res) => {
//   const user = await userService.findById(req.params.id);
//   res.json({ data: user });
// });
//
// export const update = asyncHandler(async (req, res) => {
//   const user = await userService.updateUser(req.params.id, req.body);
//   res.json({ data: user });
// });
//
// export const remove = asyncHandler(async (req, res) => {
//   await userService.deleteUser(req.params.id);
//   res.status(204).send();
// });
