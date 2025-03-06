import { Body, Controller, Post } from "@nestjs/common";
import { NotificationService } from "./notification.service";
import { CreateNotifDto } from "./dto/create-notif.dto";

@Controller("notification")
export class NotificationController {
  constructor(private notificationService: NotificationService) {}
  @Post()
  sendNotification(@Body() pushNotification: CreateNotifDto) {
    this.notificationService.sendPush(pushNotification);
  }
}
