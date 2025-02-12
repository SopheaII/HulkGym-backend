import { Request, Response } from "express";
import { AppDataSource } from "../config";
import { Activity } from "../entity/activity.entity";
import { UserInfo } from "../entity/user.entity";


export const getActivity = async (req: Request, res: Response) => {
    const activityRepository = AppDataSource.getRepository(Activity);
    const userId = req.user?.id ?? ""
    console.log("------- getActivity");
    

    try {
        const activities = await activityRepository.find({
            where: { user: {id: userId} },
            select: {
              id: true,
              title: true,
              icon: true,
              sets: true,
              reps: true,
              currentSet: true,
            },
          });
          
        console.log(activities)
        return res.status(200).json({ message: "Success", activities });
  
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: 'Internal server error!' });
    }
  };