import { Request, Response } from "express";
import { handleMessage } from "../service/telegram.service";
import { validateTelegramData } from "../utils/hash-util";
import { UserInfo } from "../entity/user.entity";
import { RoleEnum, RoleType } from "../common";
import { AppDataSource } from "../config";
import { encryptPassword, generateToken } from "../utils/encrypt";


export const checkTelegramData = async (req: Request, res: Response) => {
  const userRepo = AppDataSource.getRepository(UserInfo);
  const { initData, userInfo } = req.body;
  console.log("------ 1 ", initData)
  console.log("------ 1 ", userInfo)
  const { TELEGRAM_TOKEN } = process.env

  const firstName = userInfo?.first_name || ""
  const userName = userInfo?.username || ""
  const userId = userInfo?.id || ""
  
  console.log("------ ", initData)
  console.log("------ ", userInfo)
  if (initData == undefined || !firstName || !userId || !userName) {
    return res.status(400).json({ success: false, message: 'Invalid data' });
  }
  try {

    const isValid = validateTelegramData(initData, TELEGRAM_TOKEN || "");
    if (isValid) {
      console.log("Data is valid")
      const validUser = await userRepo.findOne({ where: { userEmail: userId} });
      if (validUser) {
        const token = generateToken({ id: validUser.id, role: validUser.role as RoleType });
        console.log("Token1: ", token)
        return res.status(200).json({ message: "User authenticated.", token });
      }

      
      const user = new UserInfo();
      user.name = firstName;
      user.userEmail = userId;
      user.userContact = userName;
      user.password = "";

      await userRepo.save(user);

      const token = generateToken({ id: user.id, role: RoleEnum[2] });
      console.log("Token2: ", token)

      return res.status(200).json({ message: "User created successfully", token});
    } else {
      console.log("Invalid data")
      return res.status(400).json({ success: false, message: 'Invalid data' });
    }

  } catch (err) {
    return res.status(500).json({ success: false, message: 'Internal server error!' });
  }
};